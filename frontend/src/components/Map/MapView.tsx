import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, Circle, useMap } from 'react-leaflet';
import { Incident, Vehicle, District, RouteOption } from '../../types';
import { createIncidentIcon, createVehicleIcon, createDistrictIcon, createUserLocationIcon } from './mapIcons';
import { MapLegend } from './MapLegend';
import { Layers, Eye, ShieldAlert, Truck, AlertTriangle, Building2, CloudRain, WifiOff, Crosshair } from 'lucide-react';
import { Badge } from '../UI/Badge';
import { useApp } from '../../context/AppContext';

interface MapViewProps {
  incidents?: Incident[];
  vehicles?: Vehicle[];
  districts?: District[];
  routes?: any[];
  highlightedRoute?: RouteOption | null;
  height?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onIncidentClick?: (incident: Incident) => void;
  center?: [number, number];
  zoom?: number;
}

// Helper to re-center map if coordinates change or user requests pan to location
const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  userCoords: [number, number] | null;
  panTrigger: number;
}> = ({ center, zoom, userCoords, panTrigger }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  React.useEffect(() => {
    if (panTrigger > 0 && userCoords) {
      map.flyTo(userCoords, 13, { duration: 1.5 });
    }
  }, [panTrigger, userCoords, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  incidents = [],
  vehicles = [],
  districts = [],
  routes = [],
  highlightedRoute = null,
  height = '540px',
  onVehicleClick,
  onIncidentClick,
  center = [26.15, 92.9],
  zoom = 7
}) => {
  const { isOffline, userLocation, syncRealLocation, isLocating } = useApp();
  const [panTrigger, setPanTrigger] = useState(0);

  // Layer controls
  const [layers, setLayers] = useState({
    roads: true,
    incidents: true,
    vehicles: true,
    districts: true,
    emergencyOnly: false,
    weatherRisk: false
  });

  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getRouteColor = (status: string, isEmergency: boolean) => {
    if (isEmergency) return '#3B82F6'; // Blue
    switch (status) {
      case 'Accessible': return '#10B981'; // Green
      case 'Caution': return '#F59E0B'; // Yellow
      case 'High Risk': return '#F97316'; // Orange
      case 'Blocked': return '#EF4444'; // Red
      case 'Emergency Corridor': return '#3B82F6';
      default: return '#64748B';
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950" style={{ height }}>
      {/* Offline Cached Map Indicator */}
      {isOffline && (
        <div className="absolute top-4 left-14 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-amber-500/40 text-amber-300 text-xs font-mono shadow-2xl backdrop-blur-md">
          <WifiOff className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span>OFFLINE CACHED GIS ACTIVE</span>
        </div>
      )}

      {/* Floating Controls: Locate Me & Layer Controls */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2">
        {/* Real GPS "Locate Me" Button */}
        <button
          onClick={() => {
            if (userLocation) {
              setPanTrigger(prev => prev + 1);
            }
            syncRealLocation(true);
          }}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/95 border border-slate-700 text-slate-200 text-xs font-semibold shadow-xl hover:bg-slate-800 hover:text-emerald-400 backdrop-blur-md transition disabled:opacity-50"
          title="Pan to your physical GPS location"
        >
          <Crosshair className={`h-4 w-4 ${isLocating ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
          <span className="hidden sm:inline">{isLocating ? 'Acquiring GPS...' : 'Locate Me'}</span>
          {userLocation && (
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          )}
        </button>

        {/* Floating Layer Controls Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/95 border border-slate-700 text-slate-200 text-xs font-semibold shadow-xl hover:bg-slate-800 backdrop-blur-md transition"
          >
            <Layers className="h-4 w-4 text-blue-400" />
            <span>GIS Layers</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900/95 border border-slate-700 p-3 shadow-2xl backdrop-blur-md space-y-2 z-50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Map Layers</p>
              
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.roads}
                  onChange={() => toggleLayer('roads')}
                  className="rounded bg-slate-800 border-slate-600 text-blue-600"
                />
                <Truck className="h-3.5 w-3.5 text-blue-400" />
                <span>Roads & Corridors</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.incidents}
                  onChange={() => toggleLayer('incidents')}
                  className="rounded bg-slate-800 border-slate-600 text-rose-600"
                />
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span>Incidents ({incidents.length})</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.vehicles}
                  onChange={() => toggleLayer('vehicles')}
                  className="rounded bg-slate-800 border-slate-600 text-emerald-600"
                />
                <Truck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Active Fleet ({vehicles.length})</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.districts}
                  onChange={() => toggleLayer('districts')}
                  className="rounded bg-slate-800 border-slate-600 text-purple-600"
                />
                <Building2 className="h-3.5 w-3.5 text-purple-400" />
                <span>District Hubs</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.emergencyOnly}
                  onChange={() => toggleLayer('emergencyOnly')}
                  className="rounded bg-slate-800 border-slate-600 text-cyan-600"
                />
                <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />
                <span>Emergency Corridors</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.weatherRisk}
                  onChange={() => toggleLayer('weatherRisk')}
                  className="rounded bg-slate-800 border-slate-600 text-amber-600"
                />
                <CloudRain className="h-3.5 w-3.5 text-amber-400" />
                <span>Weather Risk</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController
          center={center}
          zoom={zoom}
          userCoords={userLocation ? [userLocation.latitude, userLocation.longitude] : null}
          panTrigger={panTrigger}
        />

        {/* Dark-themed OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* 1. Road Corridors */}
        {layers.roads && routes.map((r, idx) => {
          if (layers.emergencyOnly && !r.is_emergency_corridor) return null;
          if (!r.waypoints || r.waypoints.length < 2) return null;

          const color = getRouteColor(r.status, r.is_emergency_corridor);
          return (
            <Polyline
              key={`route-${r.id || idx}`}
              positions={r.waypoints}
              pathOptions={{
                color,
                weight: r.is_emergency_corridor ? 5 : 3.5,
                opacity: 0.85,
                dashArray: r.status === 'Blocked' ? '8, 8' : undefined
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs">
                  <p className="font-bold">{r.name}</p>
                  <p>{r.origin} → {r.destination} ({r.distance_km} km)</p>
                  <p>Status: <span style={{ color }}>{r.status}</span></p>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* 2. Highlighted Route if Analyzed */}
        {highlightedRoute && highlightedRoute.waypoints && (
          <Polyline
            positions={highlightedRoute.waypoints}
            pathOptions={{
              color: '#3B82F6',
              weight: 6,
              opacity: 0.95
            }}
          >
            <Tooltip permanent>
              <div className="font-sans text-xs font-bold text-blue-600">
                Recommended: {highlightedRoute.name} ({highlightedRoute.distance_km} km)
              </div>
            </Tooltip>
          </Polyline>
        )}

        {/* 3. Incidents Markers */}
        {layers.incidents && incidents.map((inc) => (
          <Marker
            key={`incident-${inc.id}`}
            position={[inc.latitude, inc.longitude]}
            icon={createIncidentIcon(inc.severity)}
            eventHandlers={{
              click: () => onIncidentClick && onIncidentClick(inc)
            }}
          >
            <Popup>
              <div className="p-1 space-y-1.5 font-sans min-w-[220px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-white">{inc.type}</span>
                  <Badge variant={inc.severity === 'Critical' ? 'blocked' : 'caution'} size="sm">
                    {inc.severity}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-slate-300">{inc.location_name}</p>
                <p className="text-[11px] text-slate-400">{inc.description}</p>
                <div className="pt-1.5 border-t border-slate-700 text-[10px] space-y-0.5 text-slate-300">
                  <p><span className="text-slate-400">Restoration ETA:</span> {inc.estimated_restoration}</p>
                  <p><span className="text-slate-400">Reported By:</span> {inc.reported_by}</p>
                  <p><span className="text-slate-400">Logistics Impact:</span> Convoys restricted; alternate bypass active.</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 4. Active Vehicle Markers */}
        {layers.vehicles && vehicles.map((v) => (
          <Marker
            key={`vehicle-${v.id}`}
            position={[v.latitude, v.longitude]}
            icon={createVehicleIcon(v.status, v.heading)}
            eventHandlers={{
              click: () => onVehicleClick && onVehicleClick(v)
            }}
          >
            <Popup>
              <div className="p-1 space-y-1.5 font-sans min-w-[220px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-blue-400">{v.vehicle_number}</span>
                  <Badge variant={v.status === 'Moving' ? 'accessible' : (v.status === 'Delayed' ? 'caution' : 'highRisk')} size="sm">
                    {v.status}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-slate-200">Cargo: {v.commodity}</p>
                <p className="text-[11px] text-slate-400">{v.origin} → {v.destination}</p>
                <div className="pt-1.5 border-t border-slate-700 text-[10px] space-y-0.5 text-slate-300 font-mono">
                  <p><span className="text-slate-400">Speed:</span> {v.speed} km/h</p>
                  <p><span className="text-slate-400">ETA:</span> {v.eta}</p>
                  <p><span className="text-slate-400">Driver:</span> {v.driver} ({v.driver_contact})</p>
                  <p><span className="text-slate-400">Corridor:</span> {v.current_corridor}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 5. District Markers */}
        {layers.districts && districts.map((d) => (
          <Marker
            key={`district-${d.id}`}
            position={[d.latitude, d.longitude]}
            icon={createDistrictIcon(d.accessibility_score)}
          >
            <Popup>
              <div className="p-1 space-y-1 font-sans min-w-[180px]">
                <p className="font-bold text-xs text-white">{d.name}, {d.state}</p>
                <p className="text-xs text-emerald-400">Accessibility: {d.accessibility_score}%</p>
                <p className="text-[11px] text-slate-400">Weather: {d.weather_summary}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Incidents: {d.incident_count} | Active Vehicles: {d.vehicle_count}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 6. Real Physical User GPS Location Marker */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={Math.max(userLocation.accuracy, 25)}
              pathOptions={{
                color: '#3EB489',
                fillColor: '#3EB489',
                fillOpacity: 0.14,
                weight: 1.5,
                dashArray: '3, 6'
              }}
            />
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={createUserLocationIcon()}
            >
              <Popup>
                <div className="p-1.5 space-y-2 font-sans min-w-[220px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Your Real Location (GPS)
                    </span>
                    <Badge variant="accessible" size="sm">LIVE</Badge>
                  </div>
                  <p className="text-xs font-mono font-semibold text-emerald-300">
                    {userLocation.latitude.toFixed(5)}°N, {userLocation.longitude.toFixed(5)}°E
                  </p>
                  <div className="pt-1.5 border-t border-slate-700 text-[11px] space-y-1 text-slate-300">
                    <p className="flex justify-between">
                      <span className="text-slate-400">GPS Accuracy:</span>
                      <span className="font-mono text-emerald-400 font-semibold">±{userLocation.accuracy} meters</span>
                    </p>
                    {userLocation.speed !== null && userLocation.speed > 0 && (
                      <p className="flex justify-between">
                        <span className="text-slate-400">Ground Speed:</span>
                        <span className="font-mono text-slate-200">{(userLocation.speed * 3.6).toFixed(1)} km/h</span>
                      </p>
                    )}
                    <p className="flex justify-between">
                      <span className="text-slate-400">Acquired At:</span>
                      <span className="font-mono text-slate-400">{new Date(userLocation.timestamp).toLocaleTimeString()}</span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Map Legend */}
      <MapLegend />
    </div>
  );
};
