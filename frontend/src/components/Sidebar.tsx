import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Map as MapIcon,
  Navigation,
  Truck,
  AlertTriangle,
  Bell,
  PackageCheck,
  Building2,
  AlertOctagon,
  BarChart3,
  Settings,
  LogIn,
  LogOut,
  X,
  Radio,
  FileCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    currentPage,
    setCurrentPage,
    isEmergencyMode,
    t,
    pendingOfflineCount,
    user,
    setUser,
    setIsOfflineQueueOpen
  } = useApp();

  const role = user?.role || 'super_admin';

  // Base list of all items
  const allNavItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard, roles: ['super_admin', 'admin', 'state_admin', 'logistics_operator', 'field_officer'] },
    { id: 'driver-portal', label: 'Driver Console', icon: Truck, roles: ['driver', 'super_admin', 'admin'] },
    { id: 'live-map', label: t('navLiveMap'), icon: MapIcon, roles: ['super_admin', 'admin', 'state_admin', 'field_officer', 'logistics_operator', 'driver'] },
    { id: 'route-intel', label: t('navRouteIntel'), icon: Navigation, roles: ['super_admin', 'admin', 'state_admin', 'logistics_operator', 'field_officer', 'driver'] },
    { id: 'vehicles', label: t('navVehicleTracking'), icon: Truck, roles: ['super_admin', 'admin', 'state_admin', 'logistics_operator'] },
    {
      id: 'incidents',
      label: role === 'driver' ? 'Report Road Hazard' : t('navIncidents'),
      icon: AlertTriangle,
      badge: pendingOfflineCount > 0 ? `${pendingOfflineCount} sync` : undefined,
      roles: ['super_admin', 'admin', 'state_admin', 'field_officer', 'driver']
    },
    { id: 'alerts', label: t('navAlerts'), icon: Bell, roles: ['super_admin', 'admin', 'state_admin', 'field_officer', 'logistics_operator', 'driver'] },
    { id: 'deliveries', label: t('navDeliveries'), icon: PackageCheck, roles: ['super_admin', 'admin', 'state_admin', 'logistics_operator'] },
    { id: 'districts', label: t('navDistricts'), icon: Building2, roles: ['super_admin', 'admin', 'state_admin', 'field_officer'] },
    {
      id: 'emergency',
      label: t('navEmergency'),
      icon: AlertOctagon,
      highlight: isEmergencyMode,
      roles: ['super_admin', 'admin', 'state_admin', 'logistics_operator']
    },
    { id: 'analytics', label: t('navAnalytics'), icon: BarChart3, roles: ['super_admin', 'admin', 'state_admin', 'logistics_operator'] },
    { id: 'settings', label: t('navSettings'), icon: Settings, roles: ['super_admin', 'admin'] },
    { id: 'login', label: t('login'), icon: LogIn, roles: ['super_admin', 'admin', 'state_admin', 'field_officer', 'logistics_operator', 'driver'] }
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  const handleNav = (id: string) => {
    setCurrentPage(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              NER
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide">LOGISTICS INTEL</span>
              <p className="text-[10px] text-blue-400 font-medium">Gov. of India Initiative</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  item.highlight
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Telemetry, Queue & User */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2">
          <button
            onClick={() => setIsOfflineQueueOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition"
          >
            <span className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-blue-400" />
              <span>Offline Queue</span>
            </span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              pendingOfflineCount > 0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {pendingOfflineCount} items
            </span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Central Node: Online
            </span>
            <span className="font-mono">v1.0.0 MVP</span>
          </div>
          {user && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div className="truncate pr-2">
                <p className="text-xs font-medium text-slate-300 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.role.toUpperCase()} • NIC</p>
              </div>
              <button
                onClick={() => {
                  setUser(null);
                  setCurrentPage('login');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title={t('logout')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
