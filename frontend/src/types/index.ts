export type Region = 
  | 'Entire NER'
  | 'Arunachal Pradesh'
  | 'Assam'
  | 'Manipur'
  | 'Meghalaya'
  | 'Mizoram'
  | 'Nagaland'
  | 'Sikkim'
  | 'Tripura';

export type Language = 'en' | 'hi' | 'as';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface District {
  id: number;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  accessibility_score: number;
  risk_score: number;
  incident_count: number;
  vehicle_count: number;
  connectivity_level: string;
  weather_summary: string;
}

export type IncidentType = 
  | 'Landslide' 
  | 'Flood' 
  | 'Road Damage' 
  | 'Bridge Damage' 
  | 'Traffic' 
  | 'Weather' 
  | 'Other';

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Incident {
  id: number;
  type: IncidentType;
  description: string;
  severity: IncidentSeverity;
  latitude: number;
  longitude: number;
  location_name: string;
  image_path?: string | null;
  reported_by: string;
  status: string;
  created_at: string;
  estimated_restoration: string;
  district_name?: string | null;
  sync_status?: string;
}

export type VehicleStatus = 'Moving' | 'Delayed' | 'Stopped' | 'At Risk' | 'Delivered';

export interface Vehicle {
  id: number;
  vehicle_number: string;
  driver: string;
  driver_contact: string;
  commodity: string;
  origin: string;
  destination: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: VehicleStatus;
  eta: string;
  current_corridor: string;
  heading: number;
  updated_at: string;
}

export interface Delivery {
  id: number;
  delivery_code: string;
  commodity: string;
  origin: string;
  destination: string;
  vehicle_id?: number | null;
  vehicle_number?: string | null;
  driver?: string | null;
  priority: 'Normal' | 'High' | 'Emergency';
  status: 'In Transit' | 'Delayed' | 'Delivered' | 'At Risk' | 'Cancelled';
  eta: string;
  risk_score: number;
  notes?: string | null;
  created_at: string;
}

export interface RiskFactorBreakdown {
  weather_risk: number;
  incident_risk: number;
  road_condition: number;
  traffic_risk: number;
  historical_risk: number;
  explanation: string[];
}

export interface RouteOption {
  route_id: string;
  name: string;
  category: string;
  distance_km: number;
  estimated_time_mins: number;
  estimated_delay_mins: number;
  accessibility_score: number;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  incident_count: number;
  weather_condition: string;
  waypoints: [number, number][];
  explainability: RiskFactorBreakdown;
  status: string;
}

export interface RouteAnalysisResponse {
  origin: string;
  destination: string;
  commodity: string;
  vehicle_type: string;
  priority: string;
  recommended_route: RouteOption;
  alternate_routes: RouteOption[];
}

export interface AlertItem {
  id: number;
  title: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Information';
  location: string;
  related_type?: string | null;
  related_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface WeatherItem {
  id: number;
  district_name: string;
  state: string;
  temperature: number;
  rainfall_mm: number;
  humidity: number;
  wind_speed_kmh: number;
  weather_condition: string;
  risk_level: string;
  updated_at: string;
}

export interface DashboardKPIs {
  network_accessibility_pct: number;
  network_accessibility_change: string;
  active_vehicles: number;
  active_incidents: number;
  at_risk_routes: number;
  delayed_deliveries: number;
  emergency_corridors: number;
}

export interface AIInsight {
  id: string;
  title: string;
  insight: string;
  recommendation: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  selected_region: string;
  accessibility_trend: { day: string; accessibility: number; target: number }[];
  incident_distribution: { name: string; value: number }[];
  logistics_status: { status: string; count: number }[];
  district_connectivity: { district: string; connectivity: number; state: string; status: string }[];
  ai_insights: AIInsight[];
  critical_alerts: AlertItem[];
  recent_incidents: Incident[];
  active_vehicles_sample: Vehicle[];
}

export interface OfflineIncidentReport {
  id: string;
  type: IncidentType;
  description: string;
  severity: IncidentSeverity;
  latitude: number;
  longitude: number;
  location_name: string;
  reported_by: string;
  estimated_restoration: string;
  district_name?: string;
  timestamp: string;
  synced: boolean;
}

export type OfflineItemType = 'Incident' | 'GPS Update' | 'Delivery Update';
export type OfflineSyncStatus = 'Pending' | 'Syncing' | 'Synced' | 'Failed';

export interface OfflineQueueItem {
  id: string;
  item_code: string; // e.g. "Incident #104", "GPS Update #782", "Delivery Update #55"
  type: OfflineItemType;
  title: string;
  data: any;
  created_at: string;
  sync_status: OfflineSyncStatus;
  retry_count: number;
  error_message?: string;
}
