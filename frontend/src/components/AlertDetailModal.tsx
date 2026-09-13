import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Badge } from './UI/Badge';
import {
  X,
  MapPin,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldCheck,
  Compass,
  Navigation,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export interface AlertDetailData {
  id: number;
  title: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Information' | string;
  location: string;
  affected_route?: string | null;
  status?: string;
  estimated_restoration?: string;
  created_at?: string;
  incident_time?: string;
  reported_by?: string;
  latitude?: number;
  longitude?: number;
  image_path?: string | null;
  related_type?: string | null;
  related_id?: string | null;
}

interface AlertDetailModalProps {
  alert: AlertDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  onViewOnMap?: (lat?: number, lng?: number) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  isOpen,
  onClose,
  onViewOnMap
}) => {
  const { user, addToast } = useApp();
  const [resolving, setResolving] = useState(false);

  if (!isOpen || !alert) return null;

  const isSuperAdmin = (user?.role || '').toLowerCase() === 'super_admin' || (user?.role || '').toLowerCase() === 'admin';
  const isClearance = (alert.title || '').toLowerCase().includes('clearance') || (alert.title || '').toLowerCase().includes('resolved') || (alert.status || '').toLowerCase() === 'resolved';
  const isCritical = alert.severity === 'Critical';
  const isWarning = alert.severity === 'Warning';
  const isResolved = isClearance || (alert.status || '').toLowerCase() === 'resolved';

  const handleResolveAlert = async () => {
    if (!alert) return;
    try {
      setResolving(true);
      await api.resolveAlert(alert.id);
      addToast(`Alert #${alert.id} resolved! Clearance Notice broadcast to all commuters.`, 'success');
      onClose();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ner:alerts-updated'));
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to resolve alert.', 'error');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className={`p-5 border-b flex items-start justify-between gap-4 ${
          isClearance
            ? 'border-emerald-500/30 bg-emerald-950/20'
            : isCritical
            ? 'border-rose-500/30 bg-rose-950/20'
            : isWarning
            ? 'border-amber-500/30 bg-amber-950/20'
            : 'border-blue-500/30 bg-blue-950/20'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl border mt-0.5 ${
              isClearance
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : isCritical
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : isWarning
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-blue-500/20 border-blue-500/40 text-blue-400'
            }`}>
              {isClearance ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400 animate-pulse" />
              ) : isCritical ? (
                <AlertOctagon className="h-6 w-6 animate-pulse" />
              ) : isWarning ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <Info className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant={isClearance ? 'accessible' : (isCritical ? 'blocked' : (isWarning ? 'caution' : 'info'))} size="sm">
                  {isClearance ? 'CLEARED & RESOLVED' : `${alert.severity} Severity`}
                </Badge>
                {alert.status && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                    isResolved
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {alert.status.toUpperCase()}
                  </span>
                )}
                {alert.affected_route && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold font-mono">
                    {alert.affected_route}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                {alert.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Location</span>
                <span className="font-semibold text-slate-200">{alert.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Affected Corridor</span>
                <span className="font-semibold text-slate-200">{alert.affected_route || 'State Highway Arterial'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Estimated Clearance</span>
                <span className="font-semibold text-slate-200">{alert.estimated_restoration || 'Assessment in progress'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Reported Date & Time</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {alert.created_at ? new Date(alert.created_at).toLocaleString('en-IN') : 'Active Today'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Observations */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>Ground Incident Description</span>
            </h4>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-300 leading-relaxed text-xs sm:text-sm">
              {alert.description}
            </div>
          </div>

          {/* Photo Preview if available */}
          {alert.image_path && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Field Photo Evidence
              </h4>
              <div className="rounded-xl overflow-hidden border border-slate-800 max-h-48">
                <img
                  src={alert.image_path}
                  alt="Incident Site"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Commuter Safety Advisory */}
          {isClearance ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Verified Route Clearance & Reopening Advisory</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>Obstruction clearance verified by District Logistics & Border Roads Task Force on {alert.affected_route || 'this sector'}.</li>
                <li>Pavement and lane blockages removed. Commercial freight, state buses, and commuter vehicles have resumed regular transit.</li>
                <li>Drive cautiously and respect post-clearance speed advisories on mountain passes.</li>
              </ul>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span>Public Commuter Safety Guidelines</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>High-clearance vehicles and public convoys must follow flagmen directives on {alert.affected_route || 'this sector'}.</li>
                <li>Avoid driving during heavy rainfall hours due to active slope saturation risks.</li>
                <li>Always check alternative corridors on the Live GIS Map before initiating travel.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 font-mono">
            ID: #{alert.id} • Verified by North Eastern Logistics Authority
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && !isResolved && (
              <button
                type="button"
                disabled={resolving}
                onClick={handleResolveAlert}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shadow-md cursor-pointer"
                title="Mark this hazard resolved and broadcast a clearance notice to all Normal Users"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{resolving ? 'Broadcasting Clearance...' : 'Resolve & Broadcast Clearance'}</span>
              </button>
            )}
            {onViewOnMap && (
              <button
                type="button"
                onClick={() => {
                  onViewOnMap(alert.latitude, alert.longitude);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Compass className="h-4 w-4" />
                <span>View on GIS Map</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
