import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Region, Language } from '../types';
import {
  Bell,
  Search,
  AlertOctagon,
  Shield,
  Wifi,
  WifiOff,
  Globe,
  Radio,
  User,
  ChevronDown,
  Clock
} from 'lucide-react';

const REGIONS: Region[] = [
  'Entire NER',
  'Arunachal Pradesh',
  'Assam',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura'
];

export const Navbar: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  const {
    selectedRegion,
    setSelectedRegion,
    language,
    setLanguage,
    t,
    isEmergencyMode,
    setIsEmergencyMode,
    isSimulationActive,
    setIsSimulationActive,
    isDemoMode,
    isOffline,
    pendingOfflineCount,
    syncOfflineReports,
    setIsSearchOpen,
    user,
    setCurrentPage
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {/* Emergency Mode Operational Top Ribbon if active */}
      {isEmergencyMode && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-4 py-1.5 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2 font-semibold tracking-wider">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            <AlertOctagon className="h-4 w-4 text-rose-400" />
            <span>NER DISASTER LOGISTICS EMERGENCY PROTOCOL ACTIVE — ALL HEALTH & FOOD SUPPLY CORRIDORS MONITORED</span>
          </div>
          <button
            onClick={() => setIsEmergencyMode(false)}
            className="px-2 py-0.5 rounded bg-rose-800/60 hover:bg-rose-700/80 text-white font-medium text-xs transition"
          >
            Deactivate
          </button>
        </div>
      )}

      {/* Main Navbar Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left: Mobile Menu Toggle + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {t('appTitle')}
                </h1>
                {isDemoMode && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="hidden md:block text-xs text-slate-400 truncate max-w-md">
                {t('appSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Trigger */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition w-64 shadow-inner text-xs"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{t('searchPlaceholder')}</span>
            <kbd className="ml-auto px-1.5 py-0.5 text-[10px] rounded bg-slate-800 border border-slate-700 font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Controls & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Date/Time Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>{currentTime || 'Loading...'}</span>
          </div>

          {/* Region Selector */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as Region)}
              className="appearance-none bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg pl-2.5 pr-8 py-1.5 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {REGIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {reg === 'Entire NER' ? t('entireNER') : reg}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="appearance-none bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg pl-2.5 pr-7 py-1.5 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              title="Change Language"
            >
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
              <option value="as">অসমীয়া</option>
            </select>
            <Globe className="h-3 w-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Offline Sync Status Badge */}
          {isOffline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium">
              <WifiOff className="h-3.5 w-3.5 text-rose-400" />
              <span className="hidden sm:inline">{t('offlineMode')}</span>
            </div>
          ) : pendingOfflineCount > 0 ? (
            <button
              onClick={syncOfflineReports}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-medium animate-pulse"
              title="Click to synchronize offline incident reports"
            >
              <Wifi className="h-3.5 w-3.5 text-amber-400" />
              <span>{pendingOfflineCount} Pending Sync</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs" title="Connected to Central NER Data Hub">
              <Wifi className="h-3 w-3 text-emerald-400" />
              <span className="text-[11px]">Online</span>
            </div>
          )}

          {/* GPS Simulation Toggle Indicator */}
          <button
            onClick={() => setIsSimulationActive(!isSimulationActive)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              isSimulationActive
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle simulated GPS vehicle movement updates"
          >
            <Radio className={`h-3.5 w-3.5 ${isSimulationActive ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
            <span>GPS Sim: {isSimulationActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Emergency Mode Button */}
          <button
            onClick={() => {
              if (isEmergencyMode) {
                setIsEmergencyMode(false);
              } else {
                setIsEmergencyMode(true);
                setCurrentPage('emergency');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              isEmergencyMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-rose-400 border border-rose-500/30'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{isEmergencyMode ? 'EMERGENCY ACTIVE' : 'EMERGENCY'}</span>
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={() => setCurrentPage('alerts')}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="View Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
          </button>

          {/* User Profile / Logout */}
          <button
            onClick={() => setCurrentPage('settings')}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition"
            title="User Profile & Settings"
          >
            <div className="h-7 w-7 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 text-xs font-bold">
              {user ? user.name.charAt(0) : 'A'}
            </div>
            <span className="hidden xl:inline text-xs font-medium text-slate-300 max-w-[100px] truncate">
              {user?.name.split(' ')[0] || 'Admin'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
