import {
  DashboardData,
  District,
  Incident,
  Vehicle,
  Delivery,
  RouteOption,
  RouteAnalysisResponse,
  AlertItem,
  WeatherItem
} from '../types';

export const FALLBACK_DISTRICTS: District[] = [
  { id: 1, name: "Kamrup Metropolitan", state: "Assam", latitude: 26.1445, longitude: 91.7362, accessibility_score: 94.2, risk_score: 14.5, incident_count: 2, vehicle_count: 14, connectivity_level: "High", weather_summary: "Partly Cloudy" },
  { id: 2, name: "Dibrugarh", state: "Assam", latitude: 27.4728, longitude: 94.9120, accessibility_score: 81.5, risk_score: 42.0, incident_count: 3, vehicle_count: 9, connectivity_level: "Moderate", weather_summary: "Heavy Rain" },
  { id: 3, name: "Cachar", state: "Assam", latitude: 24.8333, longitude: 92.7789, accessibility_score: 76.8, risk_score: 48.2, incident_count: 4, vehicle_count: 8, connectivity_level: "Moderate", weather_summary: "Waterlogging" },
  { id: 4, name: "Sonitpur", state: "Assam", latitude: 26.6338, longitude: 92.7926, accessibility_score: 89.0, risk_score: 22.0, incident_count: 1, vehicle_count: 6, connectivity_level: "High", weather_summary: "Clear" },
  { id: 5, name: "Jorhat", state: "Assam", latitude: 26.7509, longitude: 94.2037, accessibility_score: 91.2, risk_score: 18.0, incident_count: 1, vehicle_count: 7, connectivity_level: "High", weather_summary: "Scattered Clouds" },
  { id: 6, name: "Papum Pare", state: "Arunachal Pradesh", latitude: 27.0844, longitude: 93.6053, accessibility_score: 79.4, risk_score: 38.0, incident_count: 2, vehicle_count: 5, connectivity_level: "Moderate", weather_summary: "Hill Fog" },
  { id: 7, name: "Tawang", state: "Arunachal Pradesh", latitude: 27.5861, longitude: 91.8594, accessibility_score: 58.2, risk_score: 74.5, incident_count: 4, vehicle_count: 3, connectivity_level: "Low", weather_summary: "Landslide Alert / Cold Rain" },
  { id: 8, name: "East Siang", state: "Arunachal Pradesh", latitude: 28.0665, longitude: 95.3268, accessibility_score: 72.0, risk_score: 45.0, incident_count: 2, vehicle_count: 4, connectivity_level: "Moderate", weather_summary: "Moderate Rain" },
  { id: 9, name: "East Khasi Hills", state: "Meghalaya", latitude: 25.5788, longitude: 91.8933, accessibility_score: 88.5, risk_score: 28.0, incident_count: 2, vehicle_count: 11, connectivity_level: "High", weather_summary: "Misty Drizzle" },
  { id: 10, name: "West Garo Hills", state: "Meghalaya", latitude: 25.5144, longitude: 90.2201, accessibility_score: 77.0, risk_score: 39.5, incident_count: 2, vehicle_count: 4, connectivity_level: "Moderate", weather_summary: "Overcast" },
  { id: 11, name: "West Jaintia Hills", state: "Meghalaya", latitude: 25.4533, longitude: 92.2033, accessibility_score: 71.4, risk_score: 52.0, incident_count: 3, vehicle_count: 5, connectivity_level: "Moderate", weather_summary: "Heavy Downpour" },
  { id: 12, name: "Imphal West", state: "Manipur", latitude: 24.8170, longitude: 93.9368, accessibility_score: 82.0, risk_score: 36.0, incident_count: 2, vehicle_count: 8, connectivity_level: "Moderate", weather_summary: "Light Showers" },
  { id: 13, name: "Churachandpur", state: "Manipur", latitude: 24.3333, longitude: 93.6667, accessibility_score: 66.5, risk_score: 61.0, incident_count: 3, vehicle_count: 4, connectivity_level: "Low", weather_summary: "Torrential Rain" },
  { id: 14, name: "Kohima", state: "Nagaland", latitude: 25.6751, longitude: 94.1086, accessibility_score: 74.0, risk_score: 54.0, incident_count: 3, vehicle_count: 6, connectivity_level: "Moderate", weather_summary: "Dense Fog" },
  { id: 15, name: "Dimapur", state: "Nagaland", latitude: 25.9042, longitude: 93.7275, accessibility_score: 92.0, risk_score: 19.5, incident_count: 1, vehicle_count: 10, connectivity_level: "High", weather_summary: "Partly Cloudy" },
  { id: 16, name: "Aizawl", state: "Mizoram", latitude: 23.7271, longitude: 92.7176, accessibility_score: 73.5, risk_score: 51.5, incident_count: 3, vehicle_count: 6, connectivity_level: "Moderate", weather_summary: "Hill Fog & Rain" },
  { id: 17, name: "Lunglei", state: "Mizoram", latitude: 22.8800, longitude: 92.7300, accessibility_score: 64.0, risk_score: 63.0, incident_count: 2, vehicle_count: 3, connectivity_level: "Low", weather_summary: "Continuous Rain" },
  { id: 18, name: "West Tripura", state: "Tripura", latitude: 23.8315, longitude: 91.2868, accessibility_score: 93.5, risk_score: 16.0, incident_count: 1, vehicle_count: 9, connectivity_level: "High", weather_summary: "Clear Sky" },
  { id: 19, name: "Gomati", state: "Tripura", latitude: 23.5333, longitude: 91.4833, accessibility_score: 88.0, risk_score: 24.0, incident_count: 1, vehicle_count: 4, connectivity_level: "High", weather_summary: "Partly Cloudy" },
  { id: 20, name: "East Sikkim", state: "Sikkim", latitude: 27.3389, longitude: 88.6065, accessibility_score: 75.0, risk_score: 49.0, incident_count: 3, vehicle_count: 6, connectivity_level: "Moderate", weather_summary: "Heavy Mist" },
  { id: 21, name: "South Sikkim", state: "Sikkim", latitude: 27.1667, longitude: 88.3500, accessibility_score: 80.2, risk_score: 35.0, incident_count: 1, vehicle_count: 4, connectivity_level: "Moderate", weather_summary: "Passing Showers" }
];

export const FALLBACK_INCIDENTS: Incident[] = [
  { id: 1, type: "Landslide", description: "Massive rockfall and earth slide blocking both carriageways on NH-13 near Sela Pass.", severity: "Critical", latitude: 27.5020, longitude: 92.1030, location_name: "NH-13 Sela Pass Sector, Tawang", reported_by: "PWD Patrol", status: "Active", created_at: new Date().toISOString(), estimated_restoration: "18 Hours", district_name: "Tawang", sync_status: "Synced" },
  { id: 2, type: "Flood", description: "Brahmaputra overflow submerging 400m stretch of highway with 2.5ft rushing water.", severity: "Critical", latitude: 27.4200, longitude: 94.8500, location_name: "NH-37 Near Bogibeel Link, Dibrugarh", reported_by: "State Disaster Management", status: "Active", created_at: new Date().toISOString(), estimated_restoration: "12 Hours", district_name: "Dibrugarh", sync_status: "Synced" },
  { id: 3, type: "Bridge Damage", description: "Structural fissure detected on abutment piers of bailey bridge due to river scour.", severity: "Critical", latitude: 25.7500, longitude: 94.0200, location_name: "NH-29 Zubza Valley Bridge, Kohima", reported_by: "Border Roads Organisation", status: "Active", created_at: new Date().toISOString(), estimated_restoration: "24 Hours", district_name: "Kohima", sync_status: "Synced" },
  { id: 4, type: "Road Damage", description: "Subsidence of hillside outer lane causing heavy commercial vehicle restriction.", severity: "High", latitude: 24.9500, longitude: 93.8800, location_name: "NH-2 Kangpokpi-Imphal Mountain Pass", reported_by: "Manipur Police Highway Patrol", status: "Active", created_at: new Date().toISOString(), estimated_restoration: "8 Hours", district_name: "Imphal West", sync_status: "Synced" },
  { id: 5, type: "Landslide", description: "Mudslide with uprooted pines blocking single lane; clearing crews deployed.", severity: "High", latitude: 25.4800, longitude: 92.1800, location_name: "NH-6 Sonapur Tunnel Approach, Jaintia Hills", reported_by: "Meghalaya PWD", status: "Active", created_at: new Date().toISOString(), estimated_restoration: "6 Hours", district_name: "West Jaintia Hills", sync_status: "Synced" },
  { id: 6, type: "Flood", description: "Barak river flash flood breached embankment causing diversion for heavy trucks.", severity: "High", latitude: 24.8100, longitude: 92.7200, location_name: "NH-306 Silchar Bypass Corridor", reported_by: "Cachar Police", status: "Active", created_at: new Date().toISOString(), estimated_restoration: "10 Hours", district_name: "Cachar", sync_status: "Synced" },
  { id: 7, type: "Road Damage", description: "Severe road cratering and surface slippage near Teesta riverside highway.", severity: "High", latitude: 27.2200, longitude: 88.5200, location_name: "NH-10 Rangpo-Singtam Sector, East Sikkim", reported_by: "Sikkim Transport Wing", status: "Active", created_at: new Date().toISOString(), estimated_restoration: "7 Hours", district_name: "East Sikkim", sync_status: "Synced" }
];

export const FALLBACK_VEHICLES: Vehicle[] = [
  { id: 1, vehicle_number: "AS-01-GC-4412", driver: "Pranab Gogoi", driver_contact: "+91 98765 43210", commodity: "Essential Medicines", origin: "Guwahati", destination: "Dibrugarh", latitude: 26.850, longitude: 93.200, speed: 48.0, status: "Moving", eta: "2h 45m", current_corridor: "NH-27 / NH-37", heading: 90.0, updated_at: new Date().toISOString() },
  { id: 2, vehicle_number: "AS-11-BC-8921", driver: "Ratan Das", driver_contact: "+91 98654 32109", commodity: "Rice & Pulses (FCI)", origin: "Guwahati", destination: "Silchar", latitude: 25.200, longitude: 92.150, speed: 22.0, status: "Delayed", eta: "5h 10m", current_corridor: "NH-6 Hill Corridor", heading: 135.0, updated_at: new Date().toISOString() },
  { id: 3, vehicle_number: "NL-07-A-3319", driver: "Toshi Ao", driver_contact: "+91 98543 21098", commodity: "Cold-Chain Vaccines", origin: "Dimapur", destination: "Kohima", latitude: 25.780, longitude: 93.910, speed: 18.0, status: "At Risk", eta: "1h 50m", current_corridor: "NH-29 Bypass", heading: 110.0, updated_at: new Date().toISOString() },
  { id: 4, vehicle_number: "MN-01-D-5544", driver: "Biren Singh", driver_contact: "+91 98432 10987", commodity: "Baby Food & Formula", origin: "Silchar", destination: "Imphal", latitude: 24.890, longitude: 93.300, speed: 35.0, status: "Moving", eta: "3h 20m", current_corridor: "NH-37 Western Access", heading: 95.0, updated_at: new Date().toISOString() },
  { id: 5, vehicle_number: "AR-01-F-7102", driver: "Dorjee Khandu", driver_contact: "+91 98321 09876", commodity: "Emergency Relief Kits", origin: "Tezpur", destination: "Tawang", latitude: 27.250, longitude: 92.400, speed: 0.0, status: "Stopped", eta: "Delayed (Pass Clear)", current_corridor: "NH-13 Sela Route", heading: 340.0, updated_at: new Date().toISOString() },
  { id: 6, vehicle_number: "ML-05-K-6671", driver: "Bahun Marwein", driver_contact: "+91 98210 98765", commodity: "Hospital Oxygen Cylinders", origin: "Guwahati", destination: "Shillong", latitude: 25.880, longitude: 91.850, speed: 52.0, status: "Moving", eta: "45 mins", current_corridor: "NH-106 4-Lane Highway", heading: 180.0, updated_at: new Date().toISOString() },
  { id: 7, vehicle_number: "MZ-01-H-9011", driver: "Lalremruata", driver_contact: "+91 98109 87654", commodity: "Petroleum Tanker", origin: "Silchar", destination: "Aizawl", latitude: 24.250, longitude: 92.740, speed: 28.0, status: "Delayed", eta: "4h 00m", current_corridor: "NH-306 Corridor", heading: 175.0, updated_at: new Date().toISOString() },
  { id: 8, vehicle_number: "TR-01-B-2245", driver: "Subrata Debbarma", driver_contact: "+91 98098 76543", commodity: "Agricultural Produce", origin: "Agartala", destination: "Udaipur", latitude: 23.680, longitude: 91.380, speed: 55.0, status: "Moving", eta: "30 mins", current_corridor: "NH-8 South Corridor", heading: 140.0, updated_at: new Date().toISOString() },
  { id: 9, vehicle_number: "SK-01-P-1188", driver: "Karma Bhutia", driver_contact: "+91 97987 65432", commodity: "Essential Medicines", origin: "Siliguri", destination: "Gangtok", latitude: 27.180, longitude: 88.510, speed: 15.0, status: "At Risk", eta: "3h 40m", current_corridor: "NH-10 Teesta Valley", heading: 45.0, updated_at: new Date().toISOString() }
];

export const FALLBACK_DELIVERIES: Delivery[] = [
  { id: 1, delivery_code: "DLV-NER-001", commodity: "Essential Medicines", origin: "Guwahati", destination: "Dibrugarh", vehicle_id: 1, vehicle_number: "AS-01-GC-4412", driver: "Pranab Gogoi", priority: "High", status: "In Transit", eta: "Today, 17:30", risk_score: 22.0, notes: "Cold-chain insulin and surgical supplies", created_at: new Date().toISOString() },
  { id: 2, delivery_code: "DLV-NER-002", commodity: "Rice & Pulses (FCI)", origin: "Guwahati", destination: "Silchar", vehicle_id: 2, vehicle_number: "AS-11-BC-8921", driver: "Ratan Das", priority: "Normal", status: "Delayed", eta: "Today, 21:00", risk_score: 48.0, notes: "FCI food buffer replenishment", created_at: new Date().toISOString() },
  { id: 3, delivery_code: "DLV-NER-003", commodity: "Cold-Chain Vaccines", origin: "Dimapur", destination: "Kohima", vehicle_id: 3, vehicle_number: "NL-07-A-3319", driver: "Toshi Ao", priority: "Emergency", status: "At Risk", eta: "Today, 15:45", risk_score: 68.5, notes: "Routine immunization stock", created_at: new Date().toISOString() },
  { id: 4, delivery_code: "DLV-NER-004", commodity: "Baby Food & Formula", origin: "Silchar", destination: "Imphal", vehicle_id: 4, vehicle_number: "MN-01-D-5544", driver: "Biren Singh", priority: "High", status: "In Transit", eta: "Today, 19:15", risk_score: 34.0, notes: "Relief nutrition supply", created_at: new Date().toISOString() },
  { id: 5, delivery_code: "DLV-NER-005", commodity: "Emergency Relief Kits", origin: "Tezpur", destination: "Tawang", vehicle_id: 5, vehicle_number: "AR-01-F-7102", driver: "Dorjee Khandu", priority: "Emergency", status: "Delayed", eta: "Tomorrow, 10:00", risk_score: 82.0, notes: "Disaster shelter kits", created_at: new Date().toISOString() },
  { id: 6, delivery_code: "DLV-NER-006", commodity: "Hospital Oxygen Cylinders", origin: "Guwahati", destination: "Shillong", vehicle_id: 6, vehicle_number: "ML-05-K-6671", driver: "Bahun Marwein", priority: "Emergency", status: "In Transit", eta: "Today, 14:15", risk_score: 18.0, notes: "Green corridor cleared", created_at: new Date().toISOString() }
];

export const FALLBACK_ALERTS: AlertItem[] = [
  { id: 1, title: "NH-13 Sela Pass Complete Blockage", description: "Massive landslide at Km 72; both carriageways blocked. Tawang logistics convoy diverted to alternate transit depot.", severity: "Critical", location: "Tawang / West Kameng border", related_type: "route", related_id: "NH-13", is_read: false, created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 2, title: "Teesta River High Water Alert — NH-10", description: "River scouring near 29th Mile corridor. Heavy goods traffic restricted between Rangpo and Sevoke.", severity: "Critical", location: "Rangpo, East Sikkim", related_type: "route", related_id: "NH-10", is_read: false, created_at: new Date(Date.now() - 35 * 60000).toISOString() },
  { id: 3, title: "Vaccine Express NL-07-A-3319 In Distress Zone", description: "Temperature-controlled vaccine truck delayed near Zubza bridge fissure. Immediate corridor escort dispatched.", severity: "Critical", location: "Kohima-Dimapur Corridor", related_type: "vehicle", related_id: "NL-07-A-3319", is_read: false, created_at: new Date(Date.now() - 50 * 60000).toISOString() },
  { id: 4, title: "Brahmaputra Flood Surging at Bogibeel Link", description: "Water level 0.8m above highway sub-grade. Trucks advised to park at Moranhat holding yard.", severity: "Critical", location: "Dibrugarh, Assam", related_type: "incident", related_id: "INC-002", is_read: false, created_at: new Date(Date.now() - 65 * 60000).toISOString() },
  { id: 5, title: "NH-6 Sonapur Tunnel Mudflow Warning", description: "Continuous heavy rainfall triggering intermittent mud slides. One-way pilot vehicle escorts operational.", severity: "Warning", location: "East Jaintia Hills, Meghalaya", related_type: "route", related_id: "NH-6", is_read: false, created_at: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: 6, title: "Emergency Corridors Health Index: 8 Active Corridors", description: "All designated life-line emergency corridors across 8 states verified with 24/7 telemetry monitoring.", severity: "Information", location: "NER Command Centre", related_type: "system", related_id: "SYS-001", is_read: false, created_at: new Date(Date.now() - 120 * 60000).toISOString() }
];

export const FALLBACK_ROUTES = [
  { id: 1, name: "Guwahati - Shillong Life-Line Expressway (NH-106)", origin: "Guwahati", destination: "Shillong", distance_km: 98.0, estimated_time_mins: 130, risk_score: 16.5, accessibility_score: 92.5, status: "Emergency Corridor", is_emergency_corridor: true, waypoints: [[26.1445, 91.7362], [26.0100, 91.8200], [25.8500, 91.8800], [25.6800, 91.9100], [25.5788, 91.8933]] },
  { id: 2, name: "Guwahati - Tezpur - Dibrugarh Northern Trunk (NH-27 / NH-37)", origin: "Guwahati", destination: "Dibrugarh", distance_km: 440.0, estimated_time_mins: 540, risk_score: 38.0, accessibility_score: 76.5, status: "Caution", is_emergency_corridor: false, waypoints: [[26.1445, 91.7362], [26.4500, 92.4000], [26.6338, 92.7926], [26.7509, 94.2037], [27.4728, 94.9120]] },
  { id: 3, name: "Shillong - Silchar Southern Mountain Lifeline (NH-6)", origin: "Shillong", destination: "Silchar", distance_km: 215.0, estimated_time_mins: 380, risk_score: 48.5, accessibility_score: 68.0, status: "High Risk", is_emergency_corridor: false, waypoints: [[25.5788, 91.8933], [25.4533, 92.2033], [25.1800, 92.4200], [24.9500, 92.6500], [24.8333, 92.7789]] },
  { id: 4, name: "Silchar - Imphal Strategic Lifeline Corridor (NH-37 West)", origin: "Silchar", destination: "Imphal", distance_km: 255.0, estimated_time_mins: 420, risk_score: 35.0, accessibility_score: 80.0, status: "Emergency Corridor", is_emergency_corridor: true, waypoints: [[24.8333, 92.7789], [24.8900, 93.1500], [24.8200, 93.5500], [24.8170, 93.9368]] },
  { id: 5, name: "Dimapur - Kohima - Imphal Central Highway (NH-29 / NH-2)", origin: "Dimapur", destination: "Imphal", distance_km: 208.0, estimated_time_mins: 360, risk_score: 58.0, accessibility_score: 62.0, status: "Caution", is_emergency_corridor: false, waypoints: [[25.9042, 93.7275], [25.7500, 93.9500], [25.6751, 94.1086], [25.2500, 94.0200], [24.8170, 93.9368]] },
  { id: 6, name: "Tezpur - Bhalukpong - Tawang Strategic Frontier Road (NH-13)", origin: "Tezpur", destination: "Tawang", distance_km: 330.0, estimated_time_mins: 560, risk_score: 82.0, accessibility_score: 42.0, status: "Blocked", is_emergency_corridor: false, waypoints: [[26.6338, 92.7926], [27.0200, 92.6000], [27.3500, 92.2500], [27.5020, 92.1030], [27.5861, 91.8594]] }
];

export const FALLBACK_WEATHER: WeatherItem[] = FALLBACK_DISTRICTS.map((d) => ({
  id: d.id,
  district_name: d.name,
  state: d.state,
  temperature: Math.round((22 + (d.latitude - 24) * 1.4) * 10) / 10,
  rainfall_mm: Math.round(d.risk_score * 1.5 * 10) / 10,
  humidity: Math.round(75 + d.risk_score * 0.2),
  wind_speed_kmh: Math.round(12 + d.risk_score * 0.15),
  weather_condition: d.weather_summary,
  risk_level: d.risk_score > 60 ? "High" : (d.risk_score > 35 ? "Medium" : "Low"),
  updated_at: new Date().toISOString()
}));

export const FALLBACK_DASHBOARD: DashboardData = {
  kpis: {
    network_accessibility_pct: 87.4,
    network_accessibility_change: "+2.8% today",
    active_vehicles: 126,
    active_incidents: 23,
    at_risk_routes: 17,
    delayed_deliveries: 31,
    emergency_corridors: 8
  },
  selected_region: "Entire NER",
  accessibility_trend: [
    { day: "Mon", accessibility: 82.4, target: 90.0 },
    { day: "Tue", accessibility: 83.8, target: 90.0 },
    { day: "Wed", accessibility: 85.1, target: 90.0 },
    { day: "Thu", accessibility: 84.6, target: 90.0 },
    { day: "Fri", accessibility: 86.2, target: 90.0 },
    { day: "Sat", accessibility: 87.0, target: 90.0 },
    { day: "Sun", accessibility: 87.4, target: 90.0 }
  ],
  incident_distribution: [
    { name: "Landslide", value: 8 },
    { name: "Flood", value: 5 },
    { name: "Road Damage", value: 6 },
    { name: "Bridge Damage", value: 3 },
    { name: "Traffic", value: 4 },
    { name: "Weather", value: 3 }
  ],
  logistics_status: [
    { status: "Delivered", count: 14 },
    { status: "In Transit", count: 18 },
    { status: "Delayed", count: 5 },
    { status: "At Risk", count: 3 }
  ],
  district_connectivity: [
    { district: "Kamrup Metro", connectivity: 94.2, state: "Assam", status: "High" },
    { district: "West Tripura", connectivity: 93.5, state: "Tripura", status: "High" },
    { district: "Dimapur", connectivity: 92.0, state: "Nagaland", status: "High" },
    { district: "Jorhat", connectivity: 91.2, state: "Assam", status: "High" },
    { district: "Sonitpur", connectivity: 89.0, state: "Assam", status: "High" },
    { district: "East Khasi Hills", connectivity: 88.5, state: "Meghalaya", status: "High" },
    { district: "Imphal West", connectivity: 82.0, state: "Manipur", status: "Moderate" }
  ],
  ai_insights: [
    {
      id: "ins-1",
      title: "Sela Pass & NH-13 Disruption Risk Alert",
      insight: "Continuous mountain runoff and steep soil saturation elevate disruption risk on NH-13 western approach.",
      recommendation: "Activate alternate southern foothill bypass for heavy goods and reroute medicine convoys through designated emergency corridors.",
      severity: "critical",
      category: "Route Intelligence"
    },
    {
      id: "ins-2",
      title: "Cold-Chain Vaccine Escort Prioritization",
      insight: "Vehicle NL-07-A-3319 with cold-chain vaccines is in delayed status near Kohima bridge restriction.",
      recommendation: "Dispatched mobile refrigeration standby unit and prioritized pilot clearance through Zubza bypass.",
      severity: "warning",
      category: "Supply Chain"
    },
    {
      id: "ins-3",
      title: "Favorable Logistics Window in Lower Assam & Tripura",
      insight: "West Tripura and Kamrup Metro corridor accessibility is stable at >93%, with zero road obstructions reported.",
      recommendation: "Accelerate outbound agricultural freight and FCI grain transfers before evening weather change.",
      severity: "info",
      category: "Optimization"
    }
  ],
  critical_alerts: FALLBACK_ALERTS.slice(0, 5),
  recent_incidents: FALLBACK_INCIDENTS.slice(0, 5),
  active_vehicles_sample: FALLBACK_VEHICLES.slice(0, 6)
};

export function calculateOfflineRouteAnalysis(
  origin: string,
  destination: string,
  commodity: string,
  vehicleType: string,
  priority: string
): RouteAnalysisResponse {
  // Deterministic local formula:
  // risk_score = 0.25 * weather_risk + 0.25 * incident_risk + 0.20 * road_condition + 0.15 * traffic_risk + 0.15 * historical_risk
  const isEmergency = priority === "Emergency" || commodity === "Medicine" || commodity === "Emergency Supplies";

  const hubCoords: Record<string, [number, number]> = {
    Guwahati: [26.1445, 91.7362],
    Dibrugarh: [27.4728, 94.9120],
    Silchar: [24.8333, 92.7789],
    Tezpur: [26.6338, 92.7926],
    Jorhat: [26.7509, 94.2037],
    Shillong: [25.5788, 91.8933],
    Tura: [25.5144, 90.2201],
    Jowai: [25.4533, 92.2033],
    Itanagar: [27.0844, 93.6053],
    Tawang: [27.5861, 91.8594],
    Pasighat: [28.0665, 95.3268],
    Imphal: [24.8170, 93.9368],
    Churachandpur: [24.3333, 93.6667],
    Kohima: [25.6751, 94.1086],
    Dimapur: [25.9042, 93.7275],
    Aizawl: [23.7271, 92.7176],
    Lunglei: [22.8800, 92.7300],
    Agartala: [23.8315, 91.2868],
    Udaipur: [23.5333, 91.4833],
    Gangtok: [27.3389, 88.6065],
    Namchi: [27.1667, 88.3500]
  };

  const p1 = hubCoords[origin] || [26.1445, 91.7362];
  const p2 = hubCoords[destination] || [27.4728, 94.9120];

  const genWaypoints = (start: [number, number], end: [number, number], jitter: number): [number, number][] => {
    const pts: [number, number][] = [start];
    for (let i = 1; i <= 6; i++) {
      const r = i / 7;
      const lat = start[0] + r * (end[0] - start[0]) + Math.sin(r * Math.PI) * jitter * 0.15;
      const lng = start[1] + r * (end[1] - start[1]) + Math.sin(r * Math.PI) * jitter * 0.2;
      pts.push([parseFloat(lat.toFixed(4)), parseFloat(lng.toFixed(4))]);
    }
    pts.push(end);
    return pts;
  };

  // Route A (Recommended)
  const wA = 18.0;
  const iA = 15.0;
  const rdA = 16.0;
  const trA = 22.0;
  const hA = 12.0;
  const riskA = parseFloat((0.25 * wA + 0.25 * iA + 0.20 * rdA + 0.15 * trA + 0.15 * hA).toFixed(1));

  const routeA: RouteOption = {
    route_id: "route-a-rec",
    name: `Primary Highway Corridor via ${origin} - Bypass - ${destination}`,
    category: "Recommended",
    distance_km: 245.0,
    estimated_time_mins: 340,
    estimated_delay_mins: 18,
    accessibility_score: parseFloat((100 - riskA).toFixed(1)),
    risk_score: riskA,
    risk_level: riskA < 30 ? "LOW" : (riskA < 55 ? "MEDIUM" : "HIGH"),
    incident_count: 1,
    weather_condition: "Scattered Cloud / Light Fog",
    waypoints: genWaypoints(p1, p2, 0.05),
    status: "Accessible",
    explainability: {
      weather_risk: wA,
      incident_risk: iA,
      road_condition: rdA,
      traffic_risk: trA,
      historical_risk: hA,
      explanation: [
        `Heavy rainfall risk factor: +${(0.25 * wA).toFixed(1)} to overall route risk`,
        `Existing road obstruction factor: +${(0.25 * iA).toFixed(1)} to overall risk`,
        `Terrain & hill slope rating: +${(0.20 * rdA).toFixed(1)} contribution`,
        `Traffic and checkpoint processing: +${(0.15 * trA).toFixed(1)} contribution`,
        `Historical monsoon disruption index: +${(0.15 * hA).toFixed(1)} contribution`,
        isEmergency ? `Prioritized as Lifeline Emergency Corridor for critical ${commodity}` : "Calculated under standard logistics safety threshold"
      ]
    }
  };

  // Route B (Alternate)
  const wB = 38.0;
  const iB = 32.0;
  const rdB = 35.0;
  const trB = 18.0;
  const hB = 28.0;
  const riskB = parseFloat((0.25 * wB + 0.25 * iB + 0.20 * rdB + 0.15 * trB + 0.15 * hB).toFixed(1));

  const routeB: RouteOption = {
    route_id: "route-b-alt",
    name: `State Highway 4 & Valley Bypass (${origin} Sector)`,
    category: "Alternate B",
    distance_km: 285.0,
    estimated_time_mins: 420,
    estimated_delay_mins: 37,
    accessibility_score: parseFloat((100 - riskB).toFixed(1)),
    risk_score: riskB,
    risk_level: "MEDIUM",
    incident_count: 3,
    weather_condition: "Moderate Rain with Hill Fog",
    waypoints: genWaypoints(p1, p2, -0.3),
    status: "Caution",
    explainability: {
      weather_risk: wB,
      incident_risk: iB,
      road_condition: rdB,
      traffic_risk: trB,
      historical_risk: hB,
      explanation: [
        `Moderate rainfall factor: +${(0.25 * wB).toFixed(1)}`,
        `Multiple active road obstructions reported: +${(0.25 * iB).toFixed(1)}`,
        `Curvature & narrow pavement rating: +${(0.20 * rdB).toFixed(1)}`,
        `Bypass diversion adds 40 km distance and 37 min expected delay`
      ]
    }
  };

  // Route C (High Risk)
  const wC = 68.0;
  const iC = 74.0;
  const rdC = 62.0;
  const trC = 15.0;
  const hC = 55.0;
  const riskC = parseFloat((0.25 * wC + 0.25 * iC + 0.20 * rdC + 0.15 * trC + 0.15 * hC).toFixed(1));

  const routeC: RouteOption = {
    route_id: "route-c-alt",
    name: `Interior Hill Ridge Pass via Cutoff`,
    category: "Alternate C",
    distance_km: 220.0,
    estimated_time_mins: 490,
    estimated_delay_mins: 65,
    accessibility_score: parseFloat((100 - riskC).toFixed(1)),
    risk_score: riskC,
    risk_level: "HIGH",
    incident_count: 5,
    weather_condition: "Heavy Downpour / Slag Risk",
    waypoints: genWaypoints(p1, p2, 0.4),
    status: "High Risk",
    explainability: {
      weather_risk: wC,
      incident_risk: iC,
      road_condition: rdC,
      traffic_risk: trC,
      historical_risk: hC,
      explanation: [
        `Heavy downpour alert on high-altitude ridge: +${(0.25 * wC).toFixed(1)}`,
        `Active rockfall & landslide hazard in sector: +${(0.25 * iC).toFixed(1)}`,
        `Steep grade with mud accumulation: +${(0.20 * rdC).toFixed(1)}`,
        `High probability of convoy immobilization: Reroute recommended`
      ]
    }
  };

  return {
    origin,
    destination,
    commodity,
    vehicle_type: vehicleType,
    priority,
    recommended_route: routeA,
    alternate_routes: [routeB, routeC]
  };
}
