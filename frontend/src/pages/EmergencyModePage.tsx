import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { MapView } from '../components/Map/MapView';
import { Badge } from '../components/UI/Badge';
import {
  AlertOctagon,
  ShieldAlert,
  Truck,
  AlertTriangle,
  PackageCheck,
  Building2,
  Navigation,
  CheckCircle2,
  Phone,
  RefreshCw
} from 'lucide-react';

export const EmergencyModePage: React.FC = () => {
  const { isEmergencyMode, setIsEmergencyMode, addToast, setCurrentPage } = useApp();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEmergencyData = async () => {
    try {
      setLoading(true);
      const res = await api.getEmergencyOverview();
      setData(res);
    } catch (err) {
      console.error(err);
      addToast('Failed to load emergency logistics data.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencyData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Emergency War-Room Header Banner */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-2xl ${
        isEmergencyMode
          ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950/80 border-rose-500/60 ring-2 ring-rose-500/30'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border ${isEmergencyMode ? 'bg-rose-600/30 border-rose-500 text-rose-300 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    NER Disaster Logistics & Emergency Continuity Command
                  </h1>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                    isEmergencyMode
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isEmergencyMode ? 'WAR-ROOM ACTIVE' : 'STANDBY MODE'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Strategic life-line corridor prioritization for essential medical convoys, food grains, and NDRF relief.
                </p>
              </div>
            </div>
          </div>

          {/* Big Action Button */}
          <button
            onClick={() => {
              const next = !isEmergencyMode;
              setIsEmergencyMode(next);
              addToast(
                next
                  ? '🚨 EMERGENCY MODE ACTIVATED: Priority corridor routing and convoy escort overrides initiated!'
                  : 'Emergency mode deactivated. Normal operational dashboard restored.',
                next ? 'error' : 'info'
              );
            }}
            className={`px-6 py-3 rounded-xl font-black text-sm tracking-wider uppercase transition shadow-2xl flex items-center justify-center gap-2.5 ${
              isEmergencyMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-rose-700 hover:bg-rose-600 text-white border border-rose-500/40'
            }`}
          >
            <AlertOctagon className="h-5 w-5 shrink-0" />
            <span>{isEmergencyMode ? 'DEACTIVATE EMERGENCY MODE' : 'ACTIVATE EMERGENCY MODE'}</span>
          </button>
        </div>
      </div>

      {/* 4 Emergency Status Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-blue-500/30 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Safe Emergency Corridors</span>
            <ShieldAlert className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-mono font-black text-blue-400">{data?.summary?.monitored_emergency_corridors || 4}</p>
          <p className="text-[11px] text-emerald-400 mt-1">100% telemetry verified</p>
        </div>

        <div className="p-4 rounded-xl border border-rose-500/30 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Critical Road Blockages</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-mono font-black text-rose-400">{data?.summary?.critical_disruptions || 7}</p>
          <p className="text-[11px] text-rose-400 mt-1">Convoys rerouted to bypass</p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Priority Supply Convoys</span>
            <Truck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-mono font-black text-emerald-400">{data?.summary?.priority_supply_transits || 6}</p>
          <p className="text-[11px] text-slate-400 mt-1">Vaccines, Blood, Oxygen, Food</p>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/30 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Disaster Logistics Hubs</span>
            <Building2 className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-mono font-black text-purple-400">{data?.summary?.shelters_ready || 5}</p>
          <p className="text-[11px] text-purple-400 mt-1">1,600T buffer capacity</p>
        </div>
      </div>

      {/* Safe Emergency Corridors Table */}
      <div className="rounded-xl border border-blue-500/30 bg-slate-900/90 shadow-xl overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              SAFE EMERGENCY CORRIDORS (PRIORITIZED FOR DISASTER RELIEF)
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">Continuous Escort Patrol</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="px-4 py-3">Corridor Name</th>
                <th className="px-4 py-3">Origin → Destination</th>
                <th className="px-4 py-3">Distance</th>
                <th className="px-4 py-3">Estimated Time</th>
                <th className="px-4 py-3">Accessibility</th>
                <th className="px-4 py-3">Risk Level</th>
                <th className="px-4 py-3">Corridor Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {(data?.safe_emergency_corridors || []).map((cor: any) => (
                <tr key={cor.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 font-bold text-white font-sans flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    {cor.name}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{cor.origin} → {cor.destination}</td>
                  <td className="px-4 py-3 font-bold">{cor.distance_km} km</td>
                  <td className="px-4 py-3">{cor.estimated_time}</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">{cor.accessibility}</td>
                  <td className="px-4 py-3">
                    <Badge variant={cor.risk === 'LOW' ? 'accessible' : 'caution'} size="sm">
                      {cor.risk}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold">
                      {cor.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setCurrentPage('live-map')}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans text-[11px] font-bold"
                    >
                      Route Convoy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Map & Critical Incident Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Map */}
        <div className="rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-200">
            <span>Critical Disruption & Emergency Vector Radar</span>
            <span className="text-rose-400 font-mono">Real-Time</span>
          </div>
          <MapView
            height="420px"
            incidents={data?.critical_incidents || []}
            vehicles={data?.emergency_vehicles || []}
          />
        </div>

        {/* Priority Deliveries in Risk Zones */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Delayed Life-Saving Medical & Food Supplies
            </h3>
            <Badge variant="blocked" size="sm">High Attention</Badge>
          </div>

          <div className="space-y-2.5">
            {(data?.priority_deliveries || []).map((dlv: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400">{dlv.code}</span>
                    <span className="font-semibold text-white">• {dlv.commodity}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                    {dlv.origin} → {dlv.destination} | ETA: {dlv.eta}
                  </p>
                </div>
                <Badge variant={dlv.status === 'At Risk' ? 'blocked' : 'caution'} size="sm">
                  {dlv.status}
                </Badge>
              </div>
            ))}
          </div>

          {/* Staging Shelters */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Activated Forward Staging Depots
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(data?.emergency_shelters || []).slice(0, 4).map((sh: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                  <p className="font-bold text-slate-200 truncate">{sh.name}</p>
                  <p className="text-slate-400 font-mono">{sh.location} ({sh.capacity_tonnes}T cap)</p>
                  <p className="text-emerald-400 flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3" /> {sh.contact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
