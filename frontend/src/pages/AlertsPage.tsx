import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AlertItem } from '../types';
import { Badge } from '../components/UI/Badge';
import {
  Bell,
  CheckCheck,
  Filter,
  RefreshCw,
  AlertOctagon,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  Check,
  ChevronRight
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { addToast, setCurrentPage } = useApp();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load alert feed.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markAlertRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
      addToast('Alert marked as acknowledged.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsRead();
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      addToast('All notifications marked as read.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'All') return true;
    return a.severity === severityFilter;
  });

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Emergency & Situational Alert Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated alerts triggered by critical landslides, vaccine temperature risks, river overflow, and roadblock closures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllAllRead => handleMarkAllRead()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <CheckCheck className="h-4 w-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>
          <button
            onClick={loadAlerts}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 w-fit">
        {['All', 'Critical', 'Warning', 'Information'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              severityFilter === sev
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {sev} ({sev === 'All' ? alerts.length : alerts.filter(a => a.severity === sev).length})
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((a) => {
          const isCritical = a.severity === 'Critical';
          const isWarning = a.severity === 'Warning';

          return (
            <div
              key={a.id}
              className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start justify-between gap-4 shadow-lg ${
                a.is_read
                  ? 'border-slate-800/80 bg-slate-900/60 opacity-80'
                  : isCritical
                  ? 'border-rose-500/40 bg-rose-950/20'
                  : isWarning
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : 'border-blue-500/30 bg-slate-900/90'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">
                  {isCritical ? (
                    <AlertOctagon className="h-5 w-5 text-rose-400 animate-pulse" />
                  ) : isWarning ? (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Info className="h-5 w-5 text-blue-400" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">{a.title}</h3>
                    <Badge variant={isCritical ? 'blocked' : (isWarning ? 'caution' : 'info')} size="sm">
                      {a.severity}
                    </Badge>
                    {!a.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-400" title="Unread Alert" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{a.description}</p>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {a.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                    </span>
                    {a.related_type && (
                      <>
                        <span>•</span>
                        <span className="text-blue-400 uppercase">Target: {a.related_type} ({a.related_id})</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {!a.is_read && (
                  <button
                    onClick={() => handleMarkRead(a.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Acknowledge</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (a.related_type === 'vehicle') setCurrentPage('vehicles');
                    else if (a.related_type === 'incident') setCurrentPage('incidents');
                    else setCurrentPage('live-map');
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  title="Navigate to related corridor"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
