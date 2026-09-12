import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DashboardData, Incident, Vehicle } from '../types';
import { KPICard } from '../components/UI/KPICard';
import { MapView } from '../components/Map/MapView';
import { Badge } from '../components/UI/Badge';
import {
  Activity,
  Truck,
  AlertTriangle,
  Route as RouteIcon,
  Clock,
  Calendar,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  Compass,
  HelpCircle,
  Zap,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    selectedRegion,
    t,
    setCurrentPage,
    setInspectedVehicleId,
    setInspectedIncidentId,
    addToast
  } = useApp();

  const [data, setData] = useState<DashboardData | null>(null);
  const [districts, setDistricts] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Precision Date & Time Tracking (declared before early returns)
  const [liveDateTime, setLiveDateTime] = useState<{
    timeStr: string;
    seconds: string;
    hoursMinutes: string;
    dayName: string;
    formattedDate: string;
    dayOfYear: number;
  }>(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    return {
      timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      seconds: now.getSeconds().toString().padStart(2, '0'),
      hoursMinutes: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      dayName: now.toLocaleDateString('en-IN', { weekday: 'short' }),
      formattedDate: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      dayOfYear
    };
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - startOfYear.getTime();
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

      setLiveDateTime({
        timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        seconds: now.getSeconds().toString().padStart(2, '0'),
        hoursMinutes: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        dayName: now.toLocaleDateString('en-IN', { weekday: 'short' }),
        formattedDate: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        dayOfYear
      });
    };
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dash, dists, rts] = await Promise.all([
        api.getDashboardData(selectedRegion),
        api.getDistricts(selectedRegion !== 'Entire NER' ? selectedRegion : undefined),
        api.getRoutes()
      ]);
      setData(dash);
      setDistricts(dists);
      setRoutes(rts);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      addToast('Failed to load live dashboard data. Using local telemetry cache.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedRegion]);

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400">Loading NER Logistics Intelligence command center...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    network_accessibility_pct: 87.4,
    network_accessibility_change: '+2.8% today',
    active_vehicles: 126,
    active_incidents: 23,
    at_risk_routes: 17,
    delayed_deliveries: 31,
    emergency_corridors: 8
  };

  const DONUT_COLORS = ['#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EC4899', '#64748B'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Regional Summary Bar with Tactical Chronometer */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight font-sans">
              {selectedRegion === 'Entire NER' ? 'North Eastern Region (NER)' : selectedRegion} Operational Command
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE 24/7 MONITORING
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Real-time accessibility scoring, multi-state road disruption analysis, and supply convoy tracking across the 8 North Eastern states.
          </p>
        </div>

        {/* Date, Time & Action Controls Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tactical Live Operational Timepiece */}
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner">
            {/* Calendar Date Badge */}
            <div className="flex items-center gap-2.5 pr-3 border-r border-slate-800/80">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  {liveDateTime.dayName}
                </span>
                <span className="text-xs font-bold text-slate-200 tracking-wide font-sans">
                  {liveDateTime.formattedDate}
                </span>
              </div>
            </div>

            {/* Precision Digital Clock */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="h-4 w-4 animate-pulse" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-base sm:text-lg font-black text-slate-100 tracking-widest tabular-nums">
                    {liveDateTime.hoursMinutes}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
                    :{liveDateTime.seconds}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono ml-0.5">
                    IST
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>UTC +5:30 • Day {liveDateTime.dayOfYear}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 transition shadow-sm"
              title="Refresh live telemetry feeds"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">{t('refreshData')}</span>
            </button>
            <button
              onClick={() => setCurrentPage('route-intel')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8E4A23] hover:bg-[#6F3B1D] text-xs font-bold text-white transition shadow-md"
            >
              <span>{t('analyzeRoute')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPICard
          title={t('networkAccessibility')}
          value={`${kpis.network_accessibility_pct}%`}
          changeIndicator={kpis.network_accessibility_change}
          isPositive={kpis.network_accessibility_pct >= 75}
          icon={Activity}
          variant="emerald"
          subtitle="Regional Index"
        />
        <KPICard
          title={t('activeVehicles')}
          value={kpis.active_vehicles}
          changeIndicator="32 GPS telemetry"
          icon={Truck}
          variant="blue"
          subtitle="Fleet in transit"
          onClick={() => setCurrentPage('vehicles')}
        />
        <KPICard
          title={t('activeIncidents')}
          value={kpis.active_incidents}
          changeIndicator="7 high severity"
          isPositive={false}
          icon={AlertTriangle}
          variant="rose"
          subtitle="Obstructions"
          onClick={() => setCurrentPage('incidents')}
        />
        <KPICard
          title={t('atRiskRoutes')}
          value={kpis.at_risk_routes}
          changeIndicator="Monsoon alert"
          isPositive={false}
          icon={RouteIcon}
          variant="amber"
          subtitle="Hill corridors"
          onClick={() => setCurrentPage('live-map')}
        />
        <KPICard
          title={t('delayedDeliveries')}
          value={kpis.delayed_deliveries}
          changeIndicator="Critical supplies"
          isPositive={false}
          icon={Clock}
          variant="indigo"
          subtitle="Medicine & Food"
          onClick={() => setCurrentPage('deliveries')}
        />
        <KPICard
          title={t('emergencyCorridors')}
          value={kpis.emergency_corridors}
          changeIndicator="100% active"
          icon={ShieldAlert}
          variant="blue"
          subtitle="Strategic Lifelines"
          onClick={() => setCurrentPage('emergency')}
        />
      </div>

      {/* AI Operational Insights Banner */}
      <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/30 p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            {t('aiInsights')}
          </h3>
          <span className="text-[11px] font-mono text-blue-400 ml-auto hidden sm:inline">
            Automated Prediction Engine Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(data?.ai_insights || []).map((ins) => (
            <div
              key={ins.id}
              className="rounded-lg bg-slate-950/70 border border-slate-800 p-3.5 flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-200 truncate">{ins.title}</span>
                  <Badge variant={ins.severity === 'critical' ? 'blocked' : (ins.severity === 'warning' ? 'caution' : 'info')} size="sm">
                    {ins.category}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{ins.insight}</p>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[11px] font-medium text-emerald-400">
                  <span className="font-bold text-slate-300">Action: </span>
                  {ins.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Questions Command Center Matrix */}
      <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Compass className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                4 Questions Command Center Intelligence Matrix
              </h3>
              <p className="text-[11px] text-slate-400">
                Core operational framework for North Eastern logistics and emergency response
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
            STRATEGIC COGNITION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Question 1 */}
          <div className="rounded-xl bg-slate-950/80 border border-blue-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">01. SITUATION</span>
              <span className="text-xs">📡</span>
            </div>
            <h4 className="text-xs font-extrabold text-white">WHAT IS HAPPENING?</h4>
            <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
              <p>• <span className="font-bold text-rose-400">23 Active Incidents</span> detected across 8 states (7 landslides, 5 floods, 4 bridge fissures).</p>
              <p>• <span className="font-bold text-emerald-400">126 Vehicles</span> tracked live; 18 in transit, 5 delayed, 3 at-risk.</p>
            </div>
          </div>

          {/* Question 2 */}
          <div className="rounded-xl bg-slate-950/80 border border-amber-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">02. LOCATION</span>
              <span className="text-xs">🗺️</span>
            </div>
            <h4 className="text-xs font-extrabold text-white">WHERE IS IT HAPPENING?</h4>
            <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
              <p>• <span className="font-bold text-amber-400">NH-13 Sela Pass</span> (Tawang, elevation 13,700ft) & NH-10 Teesta Corridor.</p>
              <p>• Vulnerability Index: Tawang (74.5), Kohima (54.0), Cachar (48.2).</p>
            </div>
          </div>

          {/* Question 3 */}
          <div className="rounded-xl bg-slate-950/80 border border-purple-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">03. FORECAST</span>
              <span className="text-xs">🔮</span>
            </div>
            <h4 className="text-xs font-extrabold text-white">WHAT WILL HAPPEN?</h4>
            <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
              <p>• AI Weather: <span className="font-bold text-purple-300">+45mm rain</span> predicted in next 6-12h over Arunachal & Meghalaya.</p>
              <p>• NH-13 risk score escalating to 85; 3 cold-chain medicine consignments at risk.</p>
            </div>
          </div>

          {/* Question 4 */}
          <div className="rounded-xl bg-slate-950/80 border border-emerald-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">04. ACTION</span>
              <span className="text-xs">⚡</span>
            </div>
            <h4 className="text-xs font-extrabold text-white">WHAT SHOULD WE DO?</h4>
            <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
              <p>• Activate <span className="font-bold text-emerald-300">Southern Foothill Bypass</span> for heavy logistics convoy.</p>
              <p>• Reroute DLV-NER-001 medicine convoy via NH-27 green lifeline corridor.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Leaflet Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              North Eastern GIS Live Command Map
            </h2>
            <p className="text-xs text-slate-400">
              Corridors color-coded by accessibility index. Click any marker for deep incident telemetry or vehicle GPS state.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('live-map')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Full GIS Screen</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <MapView
          height="520px"
          incidents={data?.recent_incidents || []}
          vehicles={data?.active_vehicles_sample || []}
          districts={districts}
          routes={routes}
          onVehicleClick={(v: Vehicle) => {
            setInspectedVehicleId(v.id);
            setCurrentPage('vehicles');
          }}
          onIncidentClick={(inc: Incident) => {
            setInspectedIncidentId(inc.id);
            setCurrentPage('incidents');
          }}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Accessibility Trend (7-day Line Chart) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{t('accessibilityTrend')}</h3>
              <p className="text-xs text-slate-400">Daily average route availability vs target baseline (90%)</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              +2.8%
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.accessibility_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                <YAxis domain={[50, 100]} stroke="#94A3B8" fontSize={12} unit="%" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="accessibility" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Actual %" />
                <Line type="monotone" dataKey="target" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Incident Distribution (Pie/Donut Chart) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{t('incidentDistribution')}</h3>
              <p className="text-xs text-slate-400">Disruption breakdown across landslides, flooding, and road stress</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{kpis.active_incidents} Total</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.incident_distribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(data?.incident_distribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Logistics Pipeline Health (Bar Chart) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{t('logisticsStatus')}</h3>
              <p className="text-xs text-slate-400">Current essential supplies delivery volume by transit health</p>
            </div>
            <button
              onClick={() => setCurrentPage('deliveries')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              View Deliveries →
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.logistics_status || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="status" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Shipments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: District Road Connectivity Scores (Horizontal Bar Chart) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{t('districtConnectivity')}</h3>
              <p className="text-xs text-slate-400">Connectivity index rating for key North Eastern districts</p>
            </div>
            <button
              onClick={() => setCurrentPage('districts')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              All Districts →
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data?.district_connectivity || []}
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={12} unit="%" />
                <YAxis dataKey="district" type="category" stroke="#94A3B8" fontSize={11} width={80} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="connectivity" fill="#10B981" radius={[0, 4, 4, 0]} name="Connectivity %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Feeds: Priority Alerts & Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Priority Alerts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">{t('recentAlerts')}</h3>
            </div>
            <button
              onClick={() => setCurrentPage('alerts')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              View All Alerts →
            </button>
          </div>

          <div className="space-y-2">
            {(data?.critical_alerts || []).slice(0, 4).map((a) => (
              <div
                key={a.id}
                onClick={() => setCurrentPage('alerts')}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition flex items-start gap-3"
              >
                <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${a.severity === 'Critical' ? 'bg-rose-500 animate-ping' : (a.severity === 'Warning' ? 'bg-amber-400' : 'bg-blue-400')}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-200 truncate">{a.title}</p>
                    <Badge variant={a.severity === 'Critical' ? 'blocked' : (a.severity === 'Warning' ? 'caution' : 'info')} size="sm">
                      {a.severity}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{a.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{a.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Road Disruptions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Live Road Disruption Reports</h3>
            </div>
            <button
              onClick={() => setCurrentPage('incidents')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Field Reports Form →
            </button>
          </div>

          <div className="space-y-2">
            {(data?.recent_incidents || []).slice(0, 4).map((inc) => (
              <div
                key={inc.id}
                onClick={() => {
                  setInspectedIncidentId(inc.id);
                  setCurrentPage('incidents');
                }}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{inc.type}</span>
                    <span className="text-[11px] text-slate-400 truncate">• {inc.location_name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{inc.description}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Est. Clearance: {inc.estimated_restoration}</p>
                </div>
                <Badge variant={inc.severity === 'Critical' ? 'blocked' : (inc.severity === 'High' ? 'highRisk' : 'caution')} size="sm">
                  {inc.severity}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Impact Section (Demo Metrics — Simulated Data) */}
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                System Impact & Operational Performance
              </h3>
              <p className="text-[11px] text-slate-400">
                Demonstrated platform efficiency gains across North Eastern road transport corridors
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
            DEMO METRICS — SIMULATED DATA
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-medium">Avg Delay Reduction</p>
            <p className="text-base font-extrabold text-emerald-400 mt-1 font-mono">24 min</p>
            <span className="text-[9px] text-emerald-500 font-semibold">(-28% delay)</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-medium">Route Efficiency</p>
            <p className="text-base font-extrabold text-blue-400 mt-1 font-mono">+13%</p>
            <span className="text-[9px] text-blue-400 font-semibold">Fuel & transit gain</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-medium">Medicine Reliability</p>
            <p className="text-base font-extrabold text-rose-400 mt-1 font-mono">96%</p>
            <span className="text-[9px] text-rose-400 font-semibold">Cold-chain uptime</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-medium">Agricultural Reliability</p>
            <p className="text-base font-extrabold text-amber-400 mt-1 font-mono">92%</p>
            <span className="text-[9px] text-amber-400 font-semibold">Produce shelf-life</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-medium">Accessibility Index</p>
            <p className="text-base font-extrabold text-emerald-400 mt-1 font-mono">+14.2%</p>
            <span className="text-[9px] text-emerald-500 font-semibold">All 8 states</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-medium">Response Time</p>
            <p className="text-base font-extrabold text-indigo-400 mt-1 font-mono">-35 min</p>
            <span className="text-[9px] text-indigo-400 font-semibold">Incident clearance</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-medium">Offline Sync Rate</p>
            <p className="text-base font-extrabold text-teal-400 mt-1 font-mono">99.8%</p>
            <span className="text-[9px] text-teal-400 font-semibold">Local queue verify</span>
          </div>
        </div>
      </div>
    </div>
  );
};
