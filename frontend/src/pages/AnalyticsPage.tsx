import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Badge } from '../components/UI/Badge';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Truck,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Layers,
  PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { addToast } = useApp();
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalytics(timeframe);
      setAnalyticsData(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load analytics dashboard.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Logistics & Road Resilience Analytics
            </h1>
            <Badge variant="info" size="sm">Intelligence Hub</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical disruption analysis, average delay rankings, corridor risk trends, and commodity throughput metrics.
          </p>
        </div>

        {/* 7d vs 30d Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                timeframe === '7d' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                timeframe === '30d' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={loadAnalytics}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase">Average Convoy Transit Delay</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-amber-400">42 mins</span>
            <span className="text-xs text-emerald-400 font-medium">-15m vs last week</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Due to alternate ridge bypass clearance</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase">Resilience Index (NER)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-emerald-400">84.6%</span>
            <span className="text-xs text-emerald-400 font-medium">+3.2% gain</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Multi-corridor redundancy operational</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Commodity Volume</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-blue-400">14,850 T</span>
            <span className="text-xs text-blue-400 font-medium">Active dispatch</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Essential foods, medicines & fuels</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Accessibility Trend (7d / 30d) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Network Accessibility Resilience Trend ({timeframe.toUpperCase()})
              </h3>
              <p className="text-xs text-slate-400">Regional road network open percentage</p>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.accessibility_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
                <YAxis domain={[60, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="accessibility" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} name="Accessibility %" />
                <Line type="monotone" dataKey="target" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" name="Target (90%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Incident Trend vs Resolved */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Daily Incident Occurrences vs PWD Clearances
              </h3>
              <p className="text-xs text-slate-400">Rate of new road obstructions vs restoration speed</p>
            </div>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.incident_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="incidents" fill="#EF4444" radius={[4, 4, 0, 0]} name="New Incidents" />
                <Bar dataKey="resolved" fill="#10B981" radius={[4, 4, 0, 0]} name="Cleared" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Average Delay by District */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Average Travel Delay by District Corridor
              </h3>
              <p className="text-xs text-slate-400">Delay minutes incurred by freight vehicles per 100km</p>
            </div>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={analyticsData?.average_delay_by_district || []}
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} unit=" min" />
                <YAxis dataKey="district" type="category" stroke="#94A3B8" fontSize={11} width={80} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="avg_delay_mins" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Avg Delay (Mins)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Commodity Movement Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Supply Chain Share by Cargo Category
              </h3>
              <p className="text-xs text-slate-400">Throughput distribution across priority logistics sectors</p>
            </div>
            <Truck className="h-4 w-4 text-blue-400" />
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.commodity_movement || []}
                  dataKey="shipments"
                  nameKey="commodity"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  label={({ commodity, share_pct }) => `${commodity.split(' ')[0]} ${share_pct}%`}
                  labelLine={false}
                >
                  {(analyticsData?.commodity_movement || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
