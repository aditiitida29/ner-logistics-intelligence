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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('ner_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      throw new Error('Invalid email or password');
    }
    const data = await response.json();
    localStorage.setItem('ner_token', data.access_token);
    localStorage.setItem('ner_user', JSON.stringify(data.user));
    return data;
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
    const res = await fetch(`${API_BASE_URL}/dashboard?region=${encodeURIComponent(region)}`, {
      headers: this.getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  }

  // Districts
  async getDistricts(state?: string, search?: string): Promise<District[]> {
    const params = new URLSearchParams();
    if (state && state !== 'Entire NER') params.append('state', state);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE_URL}/districts?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch districts');
    return res.json();
  }

  async getDistrictDetails(id: number) {
    const res = await fetch(`${API_BASE_URL}/districts/${id}`);
    if (!res.ok) throw new Error('Failed to fetch district details');
    return res.json();
  }

  // Incidents
  async getIncidents(params?: { type?: string; severity?: string; status?: string; search?: string }): Promise<Incident[]> {
    const q = new URLSearchParams();
    if (params?.type && params.type !== 'All') q.append('type', params.type);
    if (params?.severity && params.severity !== 'All') q.append('severity', params.severity);
    if (params?.status && params.status !== 'All') q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    const res = await fetch(`${API_BASE_URL}/incidents?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  }

  async createIncident(formData: FormData): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: formData
    });
    if (!res.ok) throw new Error('Failed to create incident');
    return res.json();
  }

  // Vehicles & GPS Simulation
  async getVehicles(params?: { status?: string; commodity?: string; search?: string }): Promise<Vehicle[]> {
    const q = new URLSearchParams();
    if (params?.status && params.status !== 'All') q.append('status', params.status);
    if (params?.commodity && params.commodity !== 'All') q.append('commodity', params.commodity);
    if (params?.search) q.append('search', params.search);
    const res = await fetch(`${API_BASE_URL}/vehicles?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return res.json();
  }

  async simulateVehicleStep() {
    const res = await fetch(`${API_BASE_URL}/vehicles/simulate-step`, {
      method: 'POST',
      headers: this.getAuthHeader()
    });
    if (!res.ok) throw new Error('Simulation step failed');
    return res.json();
  }

  async updateVehicleGPS(vehicleId: number, payload: { latitude: number; longitude: number; speed?: number; status?: string }) {
    const res = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/gps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update vehicle GPS');
    return res.json();
  }

  // Deliveries
  async getDeliveries(params?: { commodity?: string; status?: string; priority?: string; search?: string }): Promise<Delivery[]> {
    const q = new URLSearchParams();
    if (params?.commodity && params.commodity !== 'All') q.append('commodity', params.commodity);
    if (params?.status && params.status !== 'All') q.append('status', params.status);
    if (params?.priority && params.priority !== 'All') q.append('priority', params.priority);
    if (params?.search) q.append('search', params.search);
    const res = await fetch(`${API_BASE_URL}/deliveries?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch deliveries');
    return res.json();
  }

  async createDelivery(data: { commodity: string; origin: string; destination: string; priority: string; eta: string; notes?: string }) {
    const res = await fetch(`${API_BASE_URL}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create delivery');
    return res.json();
  }

  async updateDeliveryStatus(deliveryId: number, status: string) {
    const res = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
      headers: this.getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to update delivery status');
    return res.json();
  }

  // AI Route Recommendation
  async analyzeRoute(payload: {
    origin: string;
    destination: string;
    commodity: string;
    vehicle_type: string;
    priority: string;
  }): Promise<RouteAnalysisResponse> {
    const res = await fetch(`${API_BASE_URL}/routes/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to analyze route');
    return res.json();
  }

  async getRoutes(isEmergencyOnly?: boolean) {
    const url = isEmergencyOnly ? `${API_BASE_URL}/routes?is_emergency=true` : `${API_BASE_URL}/routes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch routes');
    return res.json();
  }

  // Alerts
  async getAlerts(severity?: string, unreadOnly?: boolean): Promise<AlertItem[]> {
    const q = new URLSearchParams();
    if (severity && severity !== 'All') q.append('severity', severity);
    if (unreadOnly) q.append('unread_only', 'true');
    const res = await fetch(`${API_BASE_URL}/alerts?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  }

  async markAlertRead(alertId: number) {
    const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/read`, {
      method: 'PUT',
      headers: this.getAuthHeader()
    });
    return res.json();
  }

  async markAllAlertsRead() {
    const res = await fetch(`${API_BASE_URL}/alerts/mark-all-read`, {
      method: 'POST',
      headers: this.getAuthHeader()
    });
    return res.json();
  }

  // Emergency Mode
  async getEmergencyOverview() {
    const res = await fetch(`${API_BASE_URL}/emergency/overview`, {
      headers: this.getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch emergency overview');
    return res.json();
  }

  // Weather
  async getWeather(state?: string): Promise<WeatherItem[]> {
    const q = state && state !== 'Entire NER' ? `?state=${encodeURIComponent(state)}` : '';
    const res = await fetch(`${API_BASE_URL}/weather${q}`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    return res.json();
  }

  // Analytics
  async getAnalytics(timeframe: '7d' | '30d' = '7d') {
    const res = await fetch(`${API_BASE_URL}/analytics/overview?timeframe=${timeframe}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }

  // System
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/system/health`);
    return res.json();
  }

  async toggleSimulation(enabled: boolean) {
    const res = await fetch(`${API_BASE_URL}/system/toggle-simulation?enabled=${enabled}`, { method: 'POST' });
    return res.json();
  }

  async toggleDemoMode(enabled: boolean) {
    const res = await fetch(`${API_BASE_URL}/system/toggle-demo-mode?enabled=${enabled}`, { method: 'POST' });
    return res.json();
  }
}

export const api = new ApiService();
