import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Vehicle } from '../types';
import { MapView } from '../components/Map/MapView';
import { Badge } from '../components/UI/Badge';
import {
  Truck,
  Radio,
  Search,
  RefreshCw,
  Phone,
  Navigation,
  Clock,
  Gauge,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export const VehicleTrackingPage: React.FC = () => {
  const {
    isSimulationActive,
    setIsSimulationActive,
    inspectedVehicleId,
    setInspectedVehicleId,
    addToast
  } = useApp();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const loadVehicles = async () => {
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch vehicle fleet data.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // Poll for simulated telemetry updates when simulation is active
  useEffect(() => {
    if (!isSimulationActive) return;
    const interval = setInterval(() => {
      loadVehicles();
    }, 6000);
    return () => clearInterval(interval);
  }, [isSimulationActive]);

  const filteredVehicles = vehicles.filter(v => {
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesSearch = !search ||
      v.vehicle_number.toLowerCase().includes(search.toLowerCase()) ||
      v.driver.toLowerCase().includes(search.toLowerCase()) ||
      v.commodity.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const inspectedVehicle = vehicles.find(v => v.id === inspectedVehicleId) || null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Real-Time Fleet & Essential Supply Convoy Telemetry
            </h1>
            <Badge variant="accessible" size="sm">GPS Active</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Live GPS vehicle monitoring with automated speed variance, delay detection, and distress zone alerts.
          </p>
        </div>

        {/* Live Simulation Control Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
            <Radio className={`h-4 w-4 ${isSimulationActive ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold text-slate-300">Live Simulation:</span>
            <button
              onClick={() => {
                const next = !isSimulationActive;
                setIsSimulationActive(next);
                addToast(`Live GPS Simulation turned ${next ? 'ON' : 'OFF'}.`, 'info');
              }}
              className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                isSimulationActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isSimulationActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <button
            onClick={loadVehicles}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
            title="Refresh fleet telemetry"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Map & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Interactive GPS Map */}
        <div className="lg:col-span-2">
          <MapView
            height="460px"
            vehicles={filteredVehicles}
            onVehicleClick={(v) => setInspectedVehicleId(v.id)}
            center={inspectedVehicle ? [inspectedVehicle.latitude, inspectedVehicle.longitude] : [26.15, 92.9]}
            zoom={inspectedVehicle ? 9 : 7}
          />
        </div>

        {/* Detailed Vehicle Inspection Drawer */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between space-y-4">
          {inspectedVehicle ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inspected Asset</span>
                  <h3 className="text-lg font-extrabold font-mono text-white">{inspectedVehicle.vehicle_number}</h3>
                </div>
                <button
                  onClick={() => setInspectedVehicleId(null)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cargo Type:</span>
                  <span className="font-bold text-slate-200">{inspectedVehicle.commodity}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Telemetry Status:</span>
                  <Badge variant={inspectedVehicle.status === 'Moving' ? 'accessible' : (inspectedVehicle.status === 'Delayed' ? 'caution' : 'highRisk')} size="sm">
                    {inspectedVehicle.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Velocity:</span>
                  <span className="font-mono font-bold text-emerald-400">{inspectedVehicle.speed} km/h</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Est. Arrival (ETA):</span>
                  <span className="font-mono text-slate-300">{inspectedVehicle.eta}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Navigation className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Route: {inspectedVehicle.origin} → {inspectedVehicle.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>Corridor: {inspectedVehicle.current_corridor}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Driver: {inspectedVehicle.driver} ({inspectedVehicle.driver_contact})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                  <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>GPS Lat: {inspectedVehicle.latitude.toFixed(4)}, Lng: {inspectedVehicle.longitude.toFixed(4)}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/30 text-[11px] text-blue-300">
                Route Security Clearance: Verified for inter-state highway green passage.
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <Truck className="h-10 w-10 text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-300">No Vehicle Selected</p>
              <p className="text-[11px] text-slate-500">
                Click any vehicle row or map marker to inspect real-time GPS telemetry, speed, and driver communications.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fleet Data Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">Active Fleet Directory ({filteredVehicles.length})</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search number, driver..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44"
              />
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Moving">Moving</option>
              <option value="Delayed">Delayed</option>
              <option value="At Risk">At Risk</option>
              <option value="Stopped">Stopped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="px-4 py-3">Vehicle ID</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Commodity</th>
                <th className="px-4 py-3">Origin → Destination</th>
                <th className="px-4 py-3">Speed</th>
                <th className="px-4 py-3">ETA</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVehicles.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setInspectedVehicleId(v.id)}
                  className={`hover:bg-slate-800/50 cursor-pointer transition ${
                    inspectedVehicleId === v.id ? 'bg-blue-950/30' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-bold text-white flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-blue-400" />
                    {v.vehicle_number}
                  </td>
                  <td className="px-4 py-3">{v.driver}</td>
                  <td className="px-4 py-3 font-medium text-slate-200">{v.commodity}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{v.origin} → {v.destination}</td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">{v.speed} km/h</td>
                  <td className="px-4 py-3 font-mono">{v.eta}</td>
                  <td className="px-4 py-3">
                    <Badge variant={v.status === 'Moving' ? 'accessible' : (v.status === 'Delayed' ? 'caution' : 'highRisk')} size="sm">
                      {v.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectedVehicleId(v.id);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition text-[11px] font-medium"
                    >
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
