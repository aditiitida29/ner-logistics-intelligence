import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { District, Region } from '../types';
import { Badge } from '../components/UI/Badge';
import {
  Building2,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Truck,
  CloudRain,
  ChevronRight,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';

export const DistrictIntelligencePage: React.FC = () => {
  const { selectedRegion, setSelectedRegion, addToast } = useApp();
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<keyof District>('accessibility_score');
  const [sortAsc, setSortAsc] = useState(false);

  // Detail Modal
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [districtDetails, setDistrictDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      const data = await api.getDistricts(selectedRegion !== 'Entire NER' ? selectedRegion : undefined);
      setDistricts(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load district intelligence.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistricts();
  }, [selectedRegion]);

  const openDistrictModal = async (d: District) => {
    setSelectedDistrict(d);
    setDetailsLoading(true);
    try {
      const details = await api.getDistrictDetails(d.id);
      setDistrictDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSort = (key: keyof District) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(false);
    }
  };

  const filtered = districts
    .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.state.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const vA = a[sortBy];
      const vB = b[sortBy];
      if (typeof vA === 'number' && typeof vB === 'number') {
        return sortAsc ? vA - vB : vB - vA;
      }
      return sortAsc ? String(vA).localeCompare(String(vB)) : String(vB).localeCompare(String(vA));
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              North Eastern District Accessibility Intelligence
            </h1>
            <Badge variant="emergency" size="sm">8 States Monitored</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            District-level road connectivity scores, active obstructions, logistics demand, and seasonal weather disruption metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDistricts}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* State Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            'Entire NER',
            'Assam',
            'Arunachal Pradesh',
            'Manipur',
            'Meghalaya',
            'Mizoram',
            'Nagaland',
            'Sikkim',
            'Tripura'
          ].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedRegion(st as Region)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedRegion === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Search district name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Sortable District Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 tracking-wider border-b border-slate-800 font-semibold cursor-pointer">
              <tr>
                <th onClick={() => handleSort('name')} className="px-4 py-3 hover:text-white">District Name</th>
                <th onClick={() => handleSort('state')} className="px-4 py-3 hover:text-white">State</th>
                <th onClick={() => handleSort('accessibility_score')} className="px-4 py-3 hover:text-white">Accessibility Score</th>
                <th onClick={() => handleSort('risk_score')} className="px-4 py-3 hover:text-white">Risk Rating</th>
                <th onClick={() => handleSort('incident_count')} className="px-4 py-3 hover:text-white">Active Incidents</th>
                <th onClick={() => handleSort('vehicle_count')} className="px-4 py-3 hover:text-white">Active Vehicles</th>
                <th onClick={() => handleSort('connectivity_level')} className="px-4 py-3 hover:text-white">Connectivity Level</th>
                <th className="px-4 py-3">Weather Condition</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => openDistrictModal(d)}
                  className="hover:bg-slate-800/50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-blue-400" />
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{d.state}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200">{d.accessibility_score}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                        <div
                          className={`h-full ${d.accessibility_score > 80 ? 'bg-emerald-400' : (d.accessibility_score > 65 ? 'bg-amber-400' : 'bg-rose-400')}`}
                          style={{ width: `${d.accessibility_score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className={`font-semibold ${d.risk_score > 50 ? 'text-rose-400' : (d.risk_score > 25 ? 'text-amber-400' : 'text-emerald-400')}`}>
                      {d.risk_score}/100
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${d.incident_count > 2 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-300'}`}>
                      {d.incident_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-400">{d.vehicle_count}</td>
                  <td className="px-4 py-3">
                    <Badge variant={d.connectivity_level === 'High' ? 'accessible' : (d.connectivity_level === 'Moderate' ? 'caution' : 'highRisk')} size="sm">
                      {d.connectivity_level}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                    <CloudRain className="h-3.5 w-3.5 text-blue-400" />
                    {d.weather_summary}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDistrictModal(d);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition text-[11px] font-medium"
                    >
                      Intelligence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* District Detail View Modal */}
      {selectedDistrict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-blue-400">{selectedDistrict.state}</span>
                <h3 className="text-lg font-extrabold text-white">{selectedDistrict.name} District Intelligence</h3>
              </div>
              <button
                onClick={() => setSelectedDistrict(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Accessibility</p>
                <p className="text-lg font-bold text-emerald-400">{selectedDistrict.accessibility_score}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Risk Score</p>
                <p className="text-lg font-bold text-rose-400">{selectedDistrict.risk_score}/100</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Active Vehicles</p>
                <p className="text-lg font-bold text-blue-400">{selectedDistrict.vehicle_count}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Incidents</p>
                <p className="text-lg font-bold text-amber-400">{selectedDistrict.incident_count}</p>
              </div>
            </div>

            {/* 7-Day Trend Chart */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-200">7-Day Accessibility History Trend</h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={districtDetails?.accessibility_trend_7d || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                    <YAxis domain={[40, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ r: 3 }} name="Score %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Incidents in District */}
            {districtDetails?.incidents && districtDetails.incidents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200">Active Obstructions in Sector</h4>
                <div className="space-y-1.5">
                  {districtDetails.incidents.map((inc: any) => (
                    <div key={inc.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{inc.type}: </span>
                        <span className="text-slate-300">{inc.location_name}</span>
                      </div>
                      <Badge variant={inc.severity === 'Critical' ? 'blocked' : 'caution'} size="sm">
                        {inc.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Coordinates: {selectedDistrict.latitude}, {selectedDistrict.longitude}</span>
              <button
                onClick={() => setSelectedDistrict(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
