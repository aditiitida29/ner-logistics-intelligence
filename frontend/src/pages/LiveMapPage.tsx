import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Incident, Vehicle, District } from '../types';
import { MapView } from '../components/Map/MapView';
import { Search, Filter, RefreshCw, Truck, AlertTriangle, Building2, ShieldAlert } from 'lucide-react';
import { Badge } from '../components/UI/Badge';

export const LiveMapPage: React.FC = () => {
  const { selectedRegion, setInspectedVehicleId, setInspectedIncidentId, setCurrentPage, addToast } = useApp();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [incidentTypeFilter, setIncidentTypeFilter] = useState('All');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('All');
  const [searchLocation, setSearchLocation] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [incs, vehs, dists, rts] = await Promise.all([
        api.getIncidents(),
        api.getVehicles(),
        api.getDistricts(selectedRegion !== 'Entire NER' ? selectedRegion : undefined),
        api.getRoutes()
      ]);
      setIncidents(incs);
      setVehicles(vehs);
      setDistricts(dists);
      setRoutes(rts);
    } catch (err) {
      console.error(err);
      addToast('Failed to load GIS entities. Using local cache.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRegion]);

  // Apply filters
  const filteredIncidents = incidents.filter(i => {
    const matchesType = incidentTypeFilter === 'All' || i.type === incidentTypeFilter;
    const matchesSearch = !searchLocation || i.location_name.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filteredVehicles = vehicles.filter(v => {
    const matchesStatus = vehicleStatusFilter === 'All' || v.status === vehicleStatusFilter;
    const matchesSearch = !searchLocation ||
      v.origin.toLowerCase().includes(searchLocation.toLowerCase()) ||
      v.destination.toLowerCase().includes(searchLocation.toLowerCase()) ||
      v.vehicle_number.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>NER Full-Screen GIS Monitoring Center</span>
            <Badge variant="emergency" size="sm">Active Radar</Badge>
          </h1>
          <p className="text-xs text-slate-400">
            High-precision geospatial monitoring for roads, bridges, convoy vectors, and environmental hazards across 8 NER states.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search location / highway..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Incident Filter */}
          <select
            value={incidentTypeFilter}
            onChange={(e) => setIncidentTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Incidents</option>
            <option value="Landslide">Landslide</option>
            <option value="Flood">Flood</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Bridge Damage">Bridge Damage</option>
            <option value="Traffic">Traffic</option>
            <option value="Weather">Weather</option>
          </select>

          {/* Vehicle Status Filter */}
          <select
            value={vehicleStatusFilter}
            onChange={(e) => setVehicleStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Vehicles</option>
            <option value="Moving">Moving</option>
            <option value="Delayed">Delayed</option>
            <option value="At Risk">At Risk</option>
            <option value="Stopped">Stopped</option>
          </select>

          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title="Refresh GIS telemetry"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* GIS Metrics Pill Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Active Entities:</span>
        <div className="flex items-center gap-1.5 text-rose-300 font-mono">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
          <span>{filteredIncidents.length} Disruption Markers</span>
        </div>
        <span className="text-slate-700">•</span>
        <div className="flex items-center gap-1.5 text-emerald-300 font-mono">
          <Truck className="h-3.5 w-3.5 text-emerald-400" />
          <span>{filteredVehicles.length} Transiting Vehicles</span>
        </div>
        <span className="text-slate-700">•</span>
        <div className="flex items-center gap-1.5 text-purple-300 font-mono">
          <Building2 className="h-3.5 w-3.5 text-purple-400" />
          <span>{districts.length} NER District Hubs</span>
        </div>
        <span className="text-slate-700">•</span>
        <div className="flex items-center gap-1.5 text-blue-300 font-mono">
          <ShieldAlert className="h-3.5 w-3.5 text-blue-400" />
          <span>{routes.filter(r => r.is_emergency_corridor).length} Strategic Corridors</span>
        </div>
      </div>

      {/* Main Full-Height Map */}
      <MapView
        height="75vh"
        incidents={filteredIncidents}
        vehicles={filteredVehicles}
        districts={districts}
        routes={routes}
        onVehicleClick={(v) => {
          setInspectedVehicleId(v.id);
          setCurrentPage('vehicles');
        }}
        onIncidentClick={(i) => {
          setInspectedIncidentId(i.id);
          setCurrentPage('incidents');
        }}
      />
    </div>
  );
};
