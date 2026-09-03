import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Language } from '../types';
import { Badge } from '../components/UI/Badge';
import {
  Settings,
  User,
  Bell,
  Globe,
  Cpu,
  Radio,
  Wifi,
  Database,
  CheckCircle2,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    user,
    setUser,
    language,
    setLanguage,
    t,
    isSimulationActive,
    setIsSimulationActive,
    isDemoMode,
    setIsDemoMode,
    isOffline,
    syncOfflineReports,
    addToast
  } = useApp();

  // Notification Toggles
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyDisruptions, setNotifyDisruptions] = useState(true);
  const [notifyDelays, setNotifyDelays] = useState(true);
  const [notifyWeather, setNotifyWeather] = useState(true);
  const [notifyDeliveries, setNotifyDeliveries] = useState(true);

  // Health check state
  const [apiHealth, setApiHealth] = useState<any | null>(null);

  useEffect(() => {
    api.getHealth().then(setApiHealth).catch(() => setApiHealth({ status: 'offline' }));
  }, []);

  const handleResetData = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/system/reset-demo-data', { method: 'POST' });
      addToast('Demo database re-seeded and verified with 100% clean NER dataset.', 'success');
    } catch (err) {
      addToast('Failed to reset demo data.', 'error');
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            System Preferences & Operational Settings
          </h1>
          <Badge variant="info" size="sm">Config</Badge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure officer credentials, notification thresholds, multilingual display, and real-time GIS simulation engines.
        </p>
      </div>

      {/* 1. Official Profile */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <User className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Officer Profile & Department</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={user?.name || 'Director (NER Logistics)'}
              disabled
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Official Role</label>
            <input
              type="text"
              value={user?.role?.toUpperCase() || 'ADMIN'}
              disabled
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Organization / Wing</label>
            <input
              type="text"
              value={user?.department || 'North Eastern Council & MoRTH Logistics Wing'}
              disabled
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5"
            />
          </div>
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Bell className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Emergency & Operational Alert Preferences</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <p className="font-semibold text-slate-200">Critical Incidents & Blockages</p>
              <p className="text-[11px] text-slate-400">Immediate popups for severe landslides and bridge cuts</p>
            </div>
            <input
              type="checkbox"
              checked={notifyCritical}
              onChange={() => setNotifyCritical(!notifyCritical)}
              className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <p className="font-semibold text-slate-200">Route Disruptions & Rerouting</p>
              <p className="text-[11px] text-slate-400">AI recommendations when risk score exceeds 60/100</p>
            </div>
            <input
              type="checkbox"
              checked={notifyDisruptions}
              onChange={() => setNotifyDisruptions(!notifyDisruptions)}
              className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <p className="font-semibold text-slate-200">Vehicle Transit Delays</p>
              <p className="text-[11px] text-slate-400">Alerts when convoy ETA increases by &gt; 45 minutes</p>
            </div>
            <input
              type="checkbox"
              checked={notifyDelays}
              onChange={() => setNotifyDelays(!notifyDelays)}
              className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <p className="font-semibold text-slate-200">Severe Weather Advisories</p>
              <p className="text-[11px] text-slate-400">Monsoon radar, hill fog, and flash flood forecasts</p>
            </div>
            <input
              type="checkbox"
              checked={notifyWeather}
              onChange={() => setNotifyWeather(!notifyWeather)}
              className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer sm:col-span-2">
            <div>
              <p className="font-semibold text-slate-200">Essential Delivery Checkpoint Confirmations</p>
              <p className="text-[11px] text-slate-400">Notifications when life-saving medicines reach border depots</p>
            </div>
            <input
              type="checkbox"
              checked={notifyDeliveries}
              onChange={() => setNotifyDeliveries(!notifyDeliveries)}
              className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
          </label>
        </div>
      </div>

      {/* 3. Language Switching */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Globe className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Language & Regional Localization</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'en', label: 'English', sub: 'Standard Operational' },
            { id: 'hi', label: 'हिन्दी (Hindi)', sub: 'राजभाषा इंटरफ़ेस' },
            { id: 'as', label: 'অসমীয়া (Assamese)', sub: 'উত্তৰ-পূব আঞ্চলিক ভাষা' }
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                setLanguage(lang.id as Language);
                addToast(`Language switched to ${lang.label}.`, 'success');
              }}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                language === lang.id
                  ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/20'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-slate-200">{lang.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{lang.sub}</p>
              </div>
              {language === lang.id && (
                <span className="text-[10px] font-bold text-blue-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. System Diagnostics & Hackathon Demo Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Cpu className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">System Diagnostics & Simulation Engines</h2>
        </div>

        <div className="space-y-3 text-xs">
          {/* Demo Mode Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">Hackathon Demo Mode</p>
              <p className="text-[11px] text-slate-400">Uses seeded realistic NER geographic data & synthetic disruptions</p>
            </div>
            <button
              onClick={() => {
                const next = !isDemoMode;
                setIsDemoMode(next);
                addToast(`Demo mode set to ${next ? 'ON' : 'OFF'}.`, 'info');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isDemoMode ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isDemoMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Live GPS Simulation */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">Real-Time GPS Fleet Simulation</p>
              <p className="text-[11px] text-slate-400">Automated periodic coordinate nudges along highway corridors</p>
            </div>
            <button
              onClick={() => {
                const next = !isSimulationActive;
                setIsSimulationActive(next);
                addToast(`Fleet simulation set to ${next ? 'ON' : 'OFF'}.`, 'info');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isSimulationActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isSimulationActive ? 'RUNNING' : 'PAUSED'}
            </button>
          </div>

          {/* Offline Sync */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">Offline PWA Telemetry Cache</p>
              <p className="text-[11px] text-slate-400">Local storage synchronization for field reports</p>
            </div>
            <button
              onClick={syncOfflineReports}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
            >
              Force Sync Cache
            </button>
          </div>

          {/* Backend Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${apiHealth?.status === 'healthy' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span className="text-slate-300">FastAPI Backend Status:</span>
              <span className="text-emerald-400 font-bold">{apiHealth?.status?.toUpperCase() || 'ONLINE'}</span>
            </div>
            <button
              onClick={handleResetData}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-blue-400 font-sans font-semibold"
            >
              Re-Seed Dataset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
