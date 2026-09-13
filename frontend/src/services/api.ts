import {
  DashboardData,
  District,
  Incident,
  Vehicle,
  Delivery,
  RouteAnalysisResponse,
  AlertItem,
  WeatherItem,
  Region
} from '../types';
import {
  FALLBACK_DASHBOARD,
  FALLBACK_DISTRICTS,
  FALLBACK_INCIDENTS,
  FALLBACK_VEHICLES,
  FALLBACK_DELIVERIES,
  FALLBACK_ALERTS,
  FALLBACK_ROUTES,
  FALLBACK_WEATHER,
  calculateOfflineRouteAnalysis
} from './offlineData';
import { OfflineSyncService } from './offlineSync';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('ner_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private saveToCache(key: string, data: any) {
    try {
      localStorage.setItem(`ner_cache_${key}`, JSON.stringify(data));
    } catch {
      // ignore storage quota exceeded
    }
  }

  private getFromCache<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(`ner_cache_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('ner_token', data.access_token);
        localStorage.setItem('ner_user', JSON.stringify(data.user));
        return data;
      }
    } catch {
      // Backend unavailable - use local authenticated demo role accounts
    }

    // Offline fallback authentication for RBAC roles
    const accounts: Record<string, any> = {
      'admin@nerlogistics.gov.in': { id: 1, name: 'Senior Logistics Director (NER)', email: 'admin@nerlogistics.gov.in', role: 'super_admin', department: 'North Eastern Council (NEC)' },
      'citizen@nerlogistics.gov.in': { id: 6, name: 'Priya Sharma (Public Commuter)', email: 'citizen@nerlogistics.gov.in', role: 'normal_user', department: 'Public Commuter Portal' },
      'state@nerlogistics.gov.in': { id: 2, name: 'Rajesh Kalita (Assam State Director)', email: 'state@nerlogistics.gov.in', role: 'state_admin', department: 'Assam State Transport Department' },
      'field@nerlogistics.gov.in': { id: 3, name: 'K. Meitei (Field Incident Officer)', email: 'field@nerlogistics.gov.in', role: 'field_officer', department: 'Border Roads & PWD Field Division' },
      'logistics@nerlogistics.gov.in': { id: 4, name: 'Vikram Das (Logistics & Fleet Operator)', email: 'logistics@nerlogistics.gov.in', role: 'logistics_operator', department: 'NER Strategic Freight Operations' },
      'driver@nerlogistics.gov.in': { id: 5, name: 'Pranab Gogoi (Highway Convoy Driver)', email: 'driver@nerlogistics.gov.in', role: 'driver', department: 'Assam-Arunachal Cold-Chain Express' }
    };

    const user = accounts[email] || accounts['admin@nerlogistics.gov.in'];
    const dummyToken = `offline-token-${Date.now()}`;
    const result = { access_token: dummyToken, token_type: 'bearer', user };
    localStorage.setItem('ner_token', dummyToken);
    localStorage.setItem('ner_user', JSON.stringify(user));
    return result;
  }

  logout() {
    localStorage.removeItem('ner_token');
    localStorage.removeItem('ner_user');
  }

  getCurrentUser() {
    const user = localStorage.getItem('ner_user');
    return user ? JSON.parse(user) : null;
  }

  // Dashboard
  async getDashboardData(region: Region = 'Entire NER'): Promise<DashboardData> {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard?region=${encodeURIComponent(region)}`, {
        headers: this.getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        this.saveToCache(`dashboard_${region}`, data);
        return data;
      }
    } catch {
      // Offline fallback
    }
    return this.getFromCache(`dashboard_${region}`, FALLBACK_DASHBOARD);
  }

  // Districts
  async getDistricts(state?: string, search?: string): Promise<District[]> {
    try {
      const params = new URLSearchParams();
      if (state && state !== 'Entire NER') params.append('state', state);
      if (search) params.append('search', search);
      const res = await fetch(`${API_BASE_URL}/districts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        this.saveToCache('districts', data);
        return data;
      }
    } catch {
      // Offline fallback
    }

    let list = this.getFromCache('districts', FALLBACK_DISTRICTS);
    if (state && state !== 'Entire NER') {
      list = list.filter(d => d.state.toLowerCase() === state.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(s) || d.state.toLowerCase().includes(s));
    }
    return list;
  }

  async getDistrictDetails(id: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/districts/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const d = FALLBACK_DISTRICTS.find(x => x.id === id) || FALLBACK_DISTRICTS[0];
    return {
      district: d,
      weather: FALLBACK_WEATHER.find(w => w.district_name === d.name) || FALLBACK_WEATHER[0],
      incidents: FALLBACK_INCIDENTS.filter(i => i.district_name === d.name),
      vehicles: FALLBACK_VEHICLES.slice(0, 3)
    };
  }

  // Incidents
  async getIncidents(params?: { type?: string; severity?: string; status?: string; search?: string }): Promise<Incident[]> {
    try {
      const q = new URLSearchParams();
      if (params?.type && params.type !== 'All') q.append('type', params.type);
      if (params?.severity && params.severity !== 'All') q.append('severity', params.severity);
      if (params?.status && params.status !== 'All') q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      const res = await fetch(`${API_BASE_URL}/incidents?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        this.saveToCache('incidents', data);
        return data;
      }
    } catch {
      // Offline fallback
    }

    let list = this.getFromCache('incidents', FALLBACK_INCIDENTS);
    // Combine with offline queued incidents
    const offlineQueue = OfflineSyncService.getQueue()
      .filter(i => i.type === 'Incident' && i.sync_status !== 'Synced')
      .map((i, idx) => ({
        id: 9000 + idx,
        type: i.data.type,
        description: i.data.description,
        severity: i.data.severity,
        latitude: i.data.latitude,
        longitude: i.data.longitude,
        location_name: i.data.location_name,
        reported_by: i.data.reported_by,
        status: 'Pending Sync (Offline)',
        created_at: i.created_at,
        estimated_restoration: i.data.estimated_restoration,
        district_name: i.data.district_name || 'Local Sector',
        sync_status: 'Pending'
      }));

    const combined = [...offlineQueue, ...list];

    if (params?.type && params.type !== 'All') {
      return combined.filter(i => i.type.toLowerCase() === params.type!.toLowerCase());
    }
    if (params?.severity && params.severity !== 'All') {
      return combined.filter(i => i.severity.toLowerCase() === params.severity!.toLowerCase());
    }
    return combined;
  }

  async createIncident(formData: FormData): Promise<Incident> {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: formData
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline fallback: queue report locally
    }

    const type = (formData.get('type') as any) || 'Landslide';
    const description = (formData.get('description') as string) || '';
    const severity = (formData.get('severity') as any) || 'Medium';
    const latitude = parseFloat((formData.get('latitude') as string) || '26.15');
    const longitude = parseFloat((formData.get('longitude') as string) || '91.75');
    const location_name = (formData.get('location_name') as string) || 'Field Location';
    const reported_by = (formData.get('reported_by') as string) || 'Field Officer';
    const estimated_restoration = (formData.get('estimated_restoration') as string) || '4-6 Hours';
    const district_name = (formData.get('district_name') as string) || undefined;

    OfflineSyncService.queueIncident({
      type,
      description,
      severity,
      latitude,
      longitude,
      location_name,
      reported_by,
      estimated_restoration,
      district_name
    });

    return {
      id: Date.now(),
      type,
      description,
      severity,
      latitude,
      longitude,
      location_name,
      reported_by,
      status: 'Active (Queued Offline)',
      created_at: new Date().toISOString(),
      estimated_restoration,
      district_name: district_name || 'Assigned District',
      sync_status: 'Pending'
    };
  }

  async updateIncident(incidentId: number, data: Partial<Incident>): Promise<Incident> {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        // Update local cache
        const list = this.getFromCache<Incident[]>('incidents', []);
        const idx = list.findIndex(i => i.id === incidentId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...updated };
          this.saveToCache('incidents', list);
        }
        return updated;
      }
      const err = await res.json().catch(() => ({ detail: 'Update failed' }));
      throw new Error(err.detail || `Server returned ${res.status}`);
    } catch (e: any) {
      if (e.message && e.message.includes('403')) {
        throw new Error('Unauthorized: Super Admin privileges required to edit incidents.');
      }
      throw e;
    }
  }

  async updateIncidentStatus(incidentId: number, status: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/status?status=${encodeURIComponent(status)}`, {
        method: 'PUT',
        headers: this.getAuthHeader()
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({ detail: 'Status update failed' }));
      throw new Error(err.detail || `Server returned ${res.status}`);
    } catch (e: any) {
      throw e;
    }
  }

  async deleteIncident(incidentId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader()
      });
      if (res.ok) {
        const list = this.getFromCache<Incident[]>('incidents', []);
        this.saveToCache('incidents', list.filter(i => i.id !== incidentId));
        return await res.json();
      }
      const err = await res.json().catch(() => ({ detail: 'Delete failed' }));
      throw new Error(err.detail || `Server returned ${res.status}`);
    } catch (e: any) {
      throw e;
    }
  }

  // Vehicles & GPS Simulation
  async getVehicles(params?: { status?: string; commodity?: string; search?: string }): Promise<Vehicle[]> {
    try {
      const q = new URLSearchParams();
      if (params?.status && params.status !== 'All') q.append('status', params.status);
      if (params?.commodity && params.commodity !== 'All') q.append('commodity', params.commodity);
      if (params?.search) q.append('search', params.search);
      const res = await fetch(`${API_BASE_URL}/vehicles?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        this.saveToCache('vehicles', data);
        return data;
      }
    } catch {
      // Offline fallback
    }

    let list = this.getFromCache('vehicles', FALLBACK_VEHICLES);
    if (params?.status && params.status !== 'All') {
      list = list.filter(v => v.status.toLowerCase() === params.status!.toLowerCase());
    }
    if (params?.commodity && params.commodity !== 'All') {
      list = list.filter(v => v.commodity.toLowerCase().includes(params.commodity!.toLowerCase()));
    }
    return list;
  }

  async simulateVehicleStep() {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/simulate-step`, {
        method: 'POST',
        headers: this.getAuthHeader()
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline fallback: jitter vehicle coordinates in cache
    }
    const vehicles = this.getFromCache('vehicles', FALLBACK_VEHICLES);
    vehicles.forEach(v => {
      v.latitude += (Math.random() - 0.5) * 0.005;
      v.longitude += (Math.random() - 0.5) * 0.005;
      v.speed = Math.max(0, Math.min(80, Math.round(v.speed + (Math.random() - 0.5) * 6)));
      v.updated_at = new Date().toISOString();
    });
    this.saveToCache('vehicles', vehicles);
    return { message: 'Local offline simulation step applied', vehicles_updated: vehicles.length };
  }

  async updateVehicleGPS(vehicleId: number, payload: { latitude: number; longitude: number; speed?: number; status?: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/gps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline fallback
    }
    OfflineSyncService.queueGPSUpdate({
      vehicle_id: vehicleId,
      vehicle_number: `VEH-${vehicleId}`,
      latitude: payload.latitude,
      longitude: payload.longitude,
      speed: payload.speed,
      status: payload.status
    });
    return { success: true, mode: 'queued_offline', ...payload };
  }

  // Deliveries
  async getDeliveries(params?: { commodity?: string; status?: string; priority?: string; search?: string }): Promise<Delivery[]> {
    try {
      const q = new URLSearchParams();
      if (params?.commodity && params.commodity !== 'All') q.append('commodity', params.commodity);
      if (params?.status && params.status !== 'All') q.append('status', params.status);
      if (params?.priority && params.priority !== 'All') q.append('priority', params.priority);
      if (params?.search) q.append('search', params.search);
      const res = await fetch(`${API_BASE_URL}/deliveries?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        this.saveToCache('deliveries', data);
        return data;
      }
    } catch {
      // Offline fallback
    }
    return this.getFromCache('deliveries', FALLBACK_DELIVERIES);
  }

  async createDelivery(data: { commodity: string; origin: string; destination: string; priority: string; eta: string; notes?: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline fallback
    }
    const newDelivery: Delivery = {
      id: Date.now(),
      delivery_code: `DLV-NER-${Math.floor(Math.random() * 800) + 100}`,
      commodity: data.commodity,
      origin: data.origin,
      destination: data.destination,
      priority: (data.priority as any) || 'Normal',
      status: 'In Transit',
      eta: data.eta || 'Today, 20:00',
      risk_score: 25.0,
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };
    const list = this.getFromCache('deliveries', FALLBACK_DELIVERIES);
    list.unshift(newDelivery);
    this.saveToCache('deliveries', list);
    return newDelivery;
  }

  async updateDeliveryStatus(deliveryId: number, status: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/status?status=${encodeURIComponent(status)}`, {
        method: 'PUT',
        headers: this.getAuthHeader()
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline fallback
    }
    OfflineSyncService.queueDeliveryUpdate({
      delivery_id: deliveryId,
      delivery_code: `DLV-${deliveryId}`,
      status
    });
    return { success: true, mode: 'queued_offline', delivery_id: deliveryId, status };
  }

  // AI Route Recommendation
  async analyzeRoute(payload: {
    origin: string;
    destination: string;
    commodity: string;
    vehicle_type: string;
    priority: string;
  }): Promise<RouteAnalysisResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/routes/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline fallback: execute full AI Multi-Factor Heuristic formula locally
    }
    return calculateOfflineRouteAnalysis(
      payload.origin,
      payload.destination,
      payload.commodity,
      payload.vehicle_type,
      payload.priority
    );
  }

  async getRoutes(isEmergencyOnly?: boolean) {
    try {
      const url = isEmergencyOnly ? `${API_BASE_URL}/routes?is_emergency=true` : `${API_BASE_URL}/routes`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        this.saveToCache('routes', data);
        return data;
      }
    } catch {
      // Offline fallback
    }
    const routes = this.getFromCache('routes', FALLBACK_ROUTES);
    return isEmergencyOnly ? routes.filter((r: any) => r.is_emergency_corridor) : routes;
  }

  // Alerts
  async getAlerts(severity?: string, unreadOnly?: boolean): Promise<AlertItem[]> {
    try {
      const q = new URLSearchParams();
      if (severity && severity !== 'All') q.append('severity', severity);
      if (unreadOnly) q.append('unread_only', 'true');
      const res = await fetch(`${API_BASE_URL}/alerts?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        this.saveToCache('alerts', data);
        return data;
      }
    } catch {
      // Offline fallback
    }
    return this.getFromCache('alerts', FALLBACK_ALERTS);
  }

  async markAlertRead(alertId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/read`, {
        method: 'PUT',
        headers: this.getAuthHeader()
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return { success: true };
  }

  async markAllAlertsRead() {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/mark-all-read`, {
        method: 'POST',
        headers: this.getAuthHeader()
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return { success: true };
  }

  // Emergency Mode
  async getEmergencyOverview() {
    try {
      const res = await fetch(`${API_BASE_URL}/emergency/overview`, {
        headers: this.getAuthHeader()
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline fallback
    }
    return {
      emergency_mode_active: true,
      safe_emergency_corridors: FALLBACK_ROUTES.filter(r => r.is_emergency_corridor),
      critical_incidents: FALLBACK_INCIDENTS.filter(i => i.severity === 'Critical'),
      priority_vehicles: FALLBACK_VEHICLES.filter(v => v.commodity.includes('Medicine') || v.commodity.includes('Vaccine')),
      action_checklist: [
        "Escort prioritized for DLV-NER-001 (Insulin & surgical stock)",
        "Mobile bridge repair wing on standby at Kohima NH-29",
        "Assam-Meghalaya green freight corridor clearance active"
      ]
    };
  }

  // Weather
  async getWeather(state?: string): Promise<WeatherItem[]> {
    try {
      const q = state && state !== 'Entire NER' ? `?state=${encodeURIComponent(state)}` : '';
      const res = await fetch(`${API_BASE_URL}/weather${q}`);
      if (res.ok) {
        const data = await res.json();
        this.saveToCache('weather', data);
        return data;
      }
    } catch {
      // Offline fallback
    }
    let list = this.getFromCache('weather', FALLBACK_WEATHER);
    if (state && state !== 'Entire NER') {
      list = list.filter(w => w.state.toLowerCase() === state.toLowerCase());
    }
    return list;
  }

  // Analytics
  async getAnalytics(timeframe: '7d' | '30d' = '7d') {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/overview?timeframe=${timeframe}`);
      if (res.ok) return await res.json();
    } catch {
      // Offline fallback
    }
    return {
      network_reliability_pct: 88.4,
      avg_incident_clearance_hours: 4.8,
      total_freight_mt: 14280,
      emergency_corridor_uptime_pct: 99.2,
      risk_trends: [
        { day: 'Day 1', landslide_risk: 65, flood_risk: 45, clearance_speed: 78 },
        { day: 'Day 2', landslide_risk: 72, flood_risk: 52, clearance_speed: 74 },
        { day: 'Day 3', landslide_risk: 58, flood_risk: 60, clearance_speed: 82 },
        { day: 'Day 4', landslide_risk: 42, flood_risk: 48, clearance_speed: 86 },
        { day: 'Day 5', landslide_risk: 38, flood_risk: 35, clearance_speed: 91 },
        { day: 'Day 6', landslide_risk: 30, flood_risk: 28, clearance_speed: 94 },
        { day: 'Day 7', landslide_risk: 28, flood_risk: 25, clearance_speed: 95 }
      ],
      state_readiness: [
        { state: 'Assam', readiness: 92, active_corridors: 4 },
        { state: 'Tripura', readiness: 94, active_corridors: 2 },
        { state: 'Meghalaya', readiness: 87, active_corridors: 2 },
        { state: 'Manipur', readiness: 79, active_corridors: 2 },
        { state: 'Nagaland', readiness: 76, active_corridors: 2 },
        { state: 'Mizoram', readiness: 74, active_corridors: 1 },
        { state: 'Sikkim', readiness: 75, active_corridors: 1 },
        { state: 'Arunachal', readiness: 68, active_corridors: 2 }
      ]
    };
  }

  // System
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/system/health`);
      if (res.ok) return await res.json();
    } catch {
      // offline
    }
    return {
      status: 'operational_offline_cache',
      platform: 'NER Logistics Intelligence (Offline Mode)',
      offline_ready: true,
      cached_entities: 21
    };
  }

  async toggleSimulation(enabled: boolean) {
    return { simulation: enabled };
  }

  async toggleDemoMode(enabled: boolean) {
    return { demo_mode: enabled };
  }
}

export const api = new ApiService();
