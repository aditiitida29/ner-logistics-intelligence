import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AlertItem } from '../types';
import { Badge } from '../components/UI/Badge';
import { AlertDetailModal, AlertDetailData } from '../components/AlertDetailModal';
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
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { addToast, setCurrentPage } = useApp();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedAlert, setSelectedAlert] = useState<AlertDetailData | null>(null);

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

  const handleMarkRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
            Real-time automated alerts triggered by landslides, road blockages, river overflow, and freight emergencies across Northeast India.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <CheckCheck className="h-4 w-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>
          <button
            onClick={loadAlerts}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
            title="Refresh alerts"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
              onClick={() => setSelectedAlert({
                id: a.id,
                title: a.title,
                description: a.description,
                severity: a.severity,
                location: a.location,
                affected_route: a.affected_route,
                created_at: a.created_at,
                related_type: a.related_type,
                related_id: a.related_id
              })}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row items-start justify-between gap-4 shadow-lg hover:border-slate-600 ${
                a.is_read
                  ? 'border-slate-800/80 bg-slate-900/60 opacity-80 hover:opacity-100'
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
                    {a.affected_route && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                        {a.affected_route}
                      </span>
                    )}
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
              <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                {!a.is_read && (
                  <button
                    onClick={(e) => handleMarkRead(a.id, e)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Acknowledge</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlert({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    severity: a.severity,
                    location: a.location,
                    affected_route: a.affected_route,
                    created_at: a.created_at,
                    related_type: a.related_type,
                    related_id: a.related_id
                  })}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium flex items-center gap-1 transition"
                  title="View full alert details"
                >
                  <span>Details</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={selectedAlert !== null}
        onClose={() => setSelectedAlert(null)}
        onViewOnMap={() => setCurrentPage('live-map')}
      />
    </div>
  );
};
