import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Incident, AlertItem, WeatherItem } from '../types';
import { MapView } from '../components/Map/MapView';
import { Badge } from '../components/UI/Badge';
import { AlertDetailModal, AlertDetailData } from '../components/AlertDetailModal';
import {
  AlertTriangle,
  AlertOctagon,
  Shield,
  MapPin,
  Clock,
  Calendar,
  Compass,
  Navigation,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  CloudRain,
  ShieldAlert
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { setCurrentPage, addToast } = useApp();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [weather, setWeather] = useState<WeatherItem[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Selected Alert for Details Modal
  const [selectedAlert, setSelectedAlert] = useState<AlertDetailData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Live Precision Chronometer
  const [liveDateTime, setLiveDateTime] = useState<{
    timeStr: string;
    seconds: string;
    hoursMinutes: string;
    dayName: string;
    formattedDate: string;
  }>(() => {
    const now = new Date();
    return {
      timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      seconds: now.getSeconds().toString().padStart(2, '0'),
      hoursMinutes: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      dayName: now.toLocaleDateString('en-IN', { weekday: 'short' }),
      formattedDate: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveDateTime({
        timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        seconds: now.getSeconds().toString().padStart(2, '0'),
        hoursMinutes: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        dayName: now.toLocaleDateString('en-IN', { weekday: 'short' }),
        formattedDate: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [incData, alData, wData, distData, routeData] = await Promise.all([
        api.getIncidents(),
        api.getAlerts(),
        api.getWeather(),
        api.getDistricts(),
        api.getRoutes()
      ]);
      setIncidents(incData);
      setAlerts(alData);
      setWeather(wData);
      setDistricts(distData);
      setRoutes(routeData);
    } catch (err) {
      console.error(err);
      addToast('Failed to load public route telemetry.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleAlertsUpdated = () => {
      loadData();
    };
    window.addEventListener('ner:alerts-updated', handleAlertsUpdated);
    return () => window.removeEventListener('ner:alerts-updated', handleAlertsUpdated);
  }, []);

  const openIncidentModal = (inc: Incident) => {
    setSelectedAlert({
      id: inc.id,
      title: `${inc.severity.toUpperCase()} ${inc.type.toUpperCase()}: ${inc.location_name}`,
      description: inc.description,
      severity: inc.severity,
      location: inc.location_name,
      affected_route: inc.affected_route,
      status: inc.status,
      estimated_restoration: inc.estimated_restoration,
      created_at: inc.created_at,
      reported_by: inc.reported_by,
      latitude: inc.latitude,
      longitude: inc.longitude,
      image_path: inc.image_path,
      related_type: 'incident',
      related_id: String(inc.id)
    });
    setIsDetailOpen(true);
  };

  const openAlertModal = (al: AlertItem) => {
    const matchedInc = incidents.find(i => i.id.toString() === al.related_id);
    setSelectedAlert({
      id: al.id,
      title: al.title,
      description: al.description,
      severity: al.severity,
      location: al.location,
      affected_route: al.affected_route || matchedInc?.affected_route,
      status: matchedInc?.status || 'Active',
      estimated_restoration: matchedInc?.estimated_restoration || 'Assessment in progress',
      created_at: al.created_at,
      latitude: matchedInc?.latitude,
      longitude: matchedInc?.longitude,
      image_path: matchedInc?.image_path,
      related_type: al.related_type,
      related_id: al.related_id
    });
    setIsDetailOpen(true);
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter(i => {
    const matchesType = selectedType === 'All' || i.type.toLowerCase() === selectedType.toLowerCase();
    const matchesSev = selectedSeverity === 'All' || i.severity.toLowerCase() === selectedSeverity.toLowerCase();
    const matchesStatus = selectedStatus === 'All' ||
      (selectedStatus === 'Active' && i.status.toLowerCase() !== 'resolved') ||
      (selectedStatus === 'Resolved' && i.status.toLowerCase() === 'resolved');
    const matchesSearch = !search ||
      i.location_name.toLowerCase().includes(search.toLowerCase()) ||
      (i.affected_route || '').toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSev && matchesStatus && matchesSearch;
  });

  const activeLandslides = incidents.filter(i => i.type === 'Landslide' && i.status.toLowerCase() !== 'resolved');
  
  // Route clearances / resolved hazard alerts sent to Normal Users
  const clearanceAlerts = alerts.filter(a => 
    a.title.toLowerCase().includes('clearance') || 
    a.title.toLowerCase().includes('resolved')
  );
  const resolvedIncidents = incidents.filter(i => i.status.toLowerCase() === 'resolved');
  const criticalCount = incidents.filter(i => i.severity === 'Critical' && i.status.toLowerCase() !== 'resolved').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Tactical Chronometer Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Citizen & Commuter Road Advisory • Live GIS Network
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Northeast Highway & Landslide Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time verified road conditions, landslide blockages, emergency corridors, and clearance updates across all 8 North Eastern states.
          </p>
        </div>

        {/* Chronometer Widget */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/30">
            <span className="text-[10px] font-bold text-blue-400 uppercase font-mono">{liveDateTime.dayName}</span>
            <span className="text-xs font-black text-white tracking-tight">{liveDateTime.formattedDate}</span>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-lg font-black text-emerald-400 tracking-wider">
                {liveDateTime.hoursMinutes}
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400 animate-pulse">
                :{liveDateTime.seconds}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase ml-1">IST</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Telemetry Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Landslide Alert Banner (if critical incidents exist) */}
      {activeLandslides.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 shadow-lg space-y-2.5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-rose-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Active Landslide Alerts ({activeLandslides.length} Sectors Disrupted)
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30">
              HIGH PRIORITY ADVISORY
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {activeLandslides.slice(0, 3).map((ls) => (
              <div
                key={ls.id}
                onClick={() => openIncidentModal(ls)}
                className="p-3 rounded-lg bg-slate-900/90 border border-rose-500/30 hover:border-rose-400 cursor-pointer transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold font-mono">
                      {ls.affected_route || 'High-Risk Highway'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Restoration: {ls.estimated_restoration}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-rose-300 transition line-clamp-1">
                    {ls.location_name}
                  </h3>
                  <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                    {ls.description}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-rose-400 font-medium">
                  <span>Click to open full advisory</span>
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Route Clearance Notices & Resolved Hazards (Sent to Normal Users upon Super Admin resolution) */}
      {(clearanceAlerts.length > 0 || resolvedIncidents.length > 0) && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 shadow-lg space-y-2.5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Route Clearance Notices ({clearanceAlerts.length || resolvedIncidents.length} Hazards Resolved)
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
              CORRIDOR RESTORED • SAFE TO TRANSIT
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {clearanceAlerts.length > 0 ? (
              clearanceAlerts.slice(0, 3).map((cl) => (
                <div
                  key={cl.id}
                  onClick={() => openAlertModal(cl)}
                  className="p-3 rounded-lg bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
                        {cl.affected_route || 'Restored Corridor'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Cleared
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                      {cl.title.replace('✅ CLEARANCE NOTICE: ', '')}
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                      {cl.description}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-emerald-400 font-medium">
                    <span>Click to open clearance advisory</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))
            ) : (
              resolvedIncidents.slice(0, 3).map((ri) => (
                <div
                  key={ri.id}
                  onClick={() => openIncidentModal(ri)}
                  className="p-3 rounded-lg bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
                        {ri.affected_route || 'Cleared Road'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                      {ri.location_name}
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                      {ri.description}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-emerald-400 font-medium">
                    <span>Click to open clearance advisory</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* GIS Interactive Map Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Live GIS Corridor & Landslide Map</h2>
              <p className="text-[11px] text-slate-400">
                Visualizing active roadblocks, landslides, and open emergency corridors.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('live-map')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
            <span>Open Fullscreen Map</span>
          </button>
        </div>

        <div className="h-[380px] rounded-xl overflow-hidden border border-slate-800">
          <MapView
            districts={districts}
            incidents={incidents}
            routes={routes}
            onIncidentClick={(inc) => openIncidentModal(inc)}
          />
        </div>
      </div>

      {/* Active Incidents & Road Hazard Feed (Read-Only Directory) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span>Verified Road Hazards & Disruptions Directory</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Updates published and authorized by District Logistics Command and Border Roads Organizations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
              title="Refresh road telemetry"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search highway (e.g., NH-13, NH-29), location, or description..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Disruption Types</option>
              <option value="Landslide">Landslide Only</option>
              <option value="Flood">Flood</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Bridge Damage">Bridge Damage</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Hazards</option>
              <option value="Resolved">Resolved & Cleared</option>
            </select>
          </div>
        </div>

        {/* Incident Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIncidents.map((inc) => {
            const isCritical = inc.severity === 'Critical';
            const isWarning = inc.severity === 'High';
            const isResolved = inc.status.toLowerCase() === 'resolved';

            return (
              <div
                key={inc.id}
                onClick={() => openIncidentModal(inc)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-lg ${
                  isResolved
                    ? 'border-emerald-500/30 bg-slate-900/60 opacity-80 hover:opacity-100'
                    : isCritical
                    ? 'border-rose-500/40 bg-rose-950/20 hover:border-rose-400'
                    : isWarning
                    ? 'border-amber-500/40 bg-amber-950/20 hover:border-amber-400'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={isCritical ? 'blocked' : (isWarning ? 'caution' : 'info')} size="sm">
                        {inc.severity}
                      </Badge>
                      <span className="text-xs font-bold text-slate-200">{inc.type}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                      isResolved
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {inc.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1 leading-snug">
                    {inc.location_name}
                  </h3>

                  {inc.affected_route && (
                    <div className="inline-block px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold font-mono mb-2">
                      Corridor: {inc.affected_route}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">
                    {inc.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>Clearance: {inc.estimated_restoration}</span>
                  </div>
                  <span className="text-blue-400 font-bold hover:underline flex items-center gap-0.5">
                    <span>Inspect</span>
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onViewOnMap={(lat, lng) => {
          setCurrentPage('live-map');
        }}
      />
    </div>
  );
};
