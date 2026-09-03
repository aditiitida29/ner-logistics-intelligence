import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { RouteAnalysisResponse, RouteOption } from '../types';
import { MapView } from '../components/Map/MapView';
import { Badge } from '../components/UI/Badge';
import {
  Navigation,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';

const NER_HUBS = [
  'Guwahati',
  'Dibrugarh',
  'Silchar',
  'Tezpur',
  'Jorhat',
  'Shillong',
  'Tura',
  'Jowai',
  'Itanagar',
  'Tawang',
  'Pasighat',
  'Imphal',
  'Churachandpur',
  'Kohima',
  'Dimapur',
  'Aizawl',
  'Lunglei',
  'Agartala',
  'Udaipur',
  'Gangtok',
  'Namchi'
];

const COMMODITIES = [
  'Medicine',
  'Food',
  'Construction Material',
  'Agricultural Produce',
  'Emergency Supplies',
  'Other'
];

const VEHICLE_TYPES = [
  'Truck',
  'Mini Truck',
  'Ambulance',
  'Utility Vehicle',
  'Other'
];

export const RouteIntelligencePage: React.FC = () => {
  const { addToast } = useApp();
  const [origin, setOrigin] = useState('Guwahati');
  const [destination, setDestination] = useState('Tawang');
  const [commodity, setCommodity] = useState('Medicine');
  const [vehicleType, setVehicleType] = useState('Truck');
  const [priority, setPriority] = useState('High');

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RouteAnalysisResponse | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (origin === destination) {
      addToast('Origin and Destination cannot be identical.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.analyzeRoute({
        origin,
        destination,
        commodity,
        vehicle_type: vehicleType,
        priority
      });
      setAnalysisResult(res);
      setSelectedRoute(res.recommended_route);
      addToast(`AI Route recommendation generated for ${origin} → ${destination}.`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to run AI route intelligence. Please check backend connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            AI-Powered Route Disruption & Accessibility Intelligence
          </h1>
          <Badge variant="info" size="sm">Decision Engine</Badge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Deterministic multi-factor risk scoring factoring monsoon weather, road subsidence, landslide density, and security checkpoints.
        </p>
      </div>

      {/* Inputs Configuration Form */}
      <form onSubmit={handleAnalyze} className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Origin */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Origin Hub</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
            >
              {NER_HUBS.map((hub) => (
                <option key={`orig-${hub}`} value={hub}>{hub}</option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Hub</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
            >
              {NER_HUBS.map((hub) => (
                <option key={`dest-${hub}`} value={hub}>{hub}</option>
              ))}
            </select>
          </div>

          {/* Commodity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Commodity Carried</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
            >
              {COMMODITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Classification</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mission Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
            >
              <option value="Normal">Normal</option>
              <option value="High">High Priority</option>
              <option value="Emergency">Emergency Lifeline</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
            Model: Weighted Risk Formulation (Weather 25%, Incidents 25%, Road 20%, Traffic 15%, Historical 15%)
          </span>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg disabled:opacity-50 ml-auto"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>ANALYZE ROUTE</span>
          </button>
        </div>
      </form>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6 animate-fade-in">
          {/* 3+ Route Options Comparison Cards */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white tracking-wide flex items-center justify-between">
              <span>Evaluated Route Corridors ({1 + analysisResult.alternate_routes.length} Computed)</span>
              <span className="text-xs text-slate-400 font-normal">Click a card to inspect and highlight on map</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Route A - Recommended */}
              <div
                onClick={() => setSelectedRoute(analysisResult.recommended_route)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between shadow-xl ${
                  selectedRoute?.route_id === analysisResult.recommended_route.route_id
                    ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                      Route A — Recommended
                    </span>
                    <Badge variant={analysisResult.recommended_route.risk_level === 'LOW' ? 'accessible' : 'caution'} size="sm">
                      {analysisResult.recommended_route.risk_level} RISK
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{analysisResult.recommended_route.name}</h3>
                  <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-center">
                    <div>
                      <p className="text-[10px] text-slate-400">Distance</p>
                      <p className="text-xs font-bold text-white">{analysisResult.recommended_route.distance_km} km</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Delay</p>
                      <p className="text-xs font-bold text-emerald-400">+{analysisResult.recommended_route.estimated_delay_mins} min</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Accessibility</p>
                      <p className="text-xs font-bold text-blue-400">{analysisResult.recommended_route.accessibility_score}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">ETA: {Math.floor(analysisResult.recommended_route.estimated_time_mins / 60)}h {analysisResult.recommended_route.estimated_time_mins % 60}m</span>
                  <span className="font-bold text-blue-400 flex items-center gap-1">
                    Selected <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* Alternates B & C */}
              {analysisResult.alternate_routes.map((alt, idx) => (
                <div
                  key={alt.route_id}
                  onClick={() => setSelectedRoute(alt)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between shadow-xl ${
                    selectedRoute?.route_id === alt.route_id
                      ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold">
                        Route {idx === 0 ? 'B' : 'C'} — Alternate
                      </span>
                      <Badge variant={alt.risk_level === 'MEDIUM' ? 'caution' : 'highRisk'} size="sm">
                        {alt.risk_level} RISK
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">{alt.name}</h3>
                    <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-center">
                      <div>
                        <p className="text-[10px] text-slate-400">Distance</p>
                        <p className="text-xs font-bold text-white">{alt.distance_km} km</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Delay</p>
                        <p className="text-xs font-bold text-amber-400">+{alt.estimated_delay_mins} min</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Accessibility</p>
                        <p className="text-xs font-bold text-slate-300">{alt.accessibility_score}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">ETA: {Math.floor(alt.estimated_time_mins / 60)}h {alt.estimated_time_mins % 60}m</span>
                    <span className="text-slate-400 hover:text-white transition">
                      View on Map →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Explainability Card & Map Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Explainability Breakdown Panel */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Responsible AI Explainability</h3>
              </div>
              <p className="text-xs text-slate-400">
                Transparent factor attribution detailing why <span className="text-white font-semibold">{selectedRoute?.name}</span> scored <span className="font-mono text-emerald-400 font-bold">{selectedRoute?.risk_score}/100</span> ({selectedRoute?.risk_level}).
              </p>

              {/* Factors Stack */}
              <div className="space-y-2">
                {selectedRoute?.explainability.explanation.map((exp, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span>{exp}</span>
                  </div>
                ))}
              </div>

              {/* Risk Weighting Summary */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                <p>• Weather Severity Rating: {selectedRoute?.explainability.weather_risk}/100</p>
                <p>• Active Road Obstruction Rating: {selectedRoute?.explainability.incident_risk}/100</p>
                <p>• Pavement & Slag Rating: {selectedRoute?.explainability.road_condition}/100</p>
                <p>• Historical Disruption Index: {selectedRoute?.explainability.historical_risk}/100</p>
              </div>
            </div>

            {/* Interactive GIS Preview Map with Path */}
            <div className="lg:col-span-2 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
              <MapView
                height="450px"
                highlightedRoute={selectedRoute}
                center={selectedRoute?.waypoints[0] || [26.15, 92.9]}
                zoom={8}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
