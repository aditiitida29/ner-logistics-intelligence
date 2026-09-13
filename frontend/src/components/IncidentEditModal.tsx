import React, { useState, useEffect } from 'react';
import { Incident, IncidentSeverity, IncidentType } from '../types';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Save,
  Route,
  MapPin,
  Clock
} from 'lucide-react';

interface IncidentEditModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: Partial<Incident>) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export const IncidentEditModal: React.FC<IncidentEditModalProps> = ({
  incident,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  if (!isOpen || !incident) return null;

  const [type, setType] = useState<IncidentType>(incident.type);
  const [locationName, setLocationName] = useState(incident.location_name);
  const [affectedRoute, setAffectedRoute] = useState(incident.affected_route || '');
  const [severity, setSeverity] = useState<IncidentSeverity>(incident.severity);
  const [status, setStatus] = useState(incident.status || 'Active');
  const [estimatedRestoration, setEstimatedRestoration] = useState(incident.estimated_restoration);
  const [description, setDescription] = useState(incident.description);
  const [latitude, setLatitude] = useState(incident.latitude.toString());
  const [longitude, setLongitude] = useState(incident.longitude.toString());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (incident) {
      setType(incident.type);
      setLocationName(incident.location_name);
      setAffectedRoute(incident.affected_route || '');
      setSeverity(incident.severity);
      setStatus(incident.status || 'Active');
      setEstimatedRestoration(incident.estimated_restoration);
      setDescription(incident.description);
      setLatitude(incident.latitude.toString());
      setLongitude(incident.longitude.toString());
    }
  }, [incident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(incident.id, {
        type,
        location_name: locationName,
        affected_route: affectedRoute,
        severity,
        status,
        estimated_restoration: estimatedRestoration,
        description,
        latitude: parseFloat(latitude) || incident.latitude,
        longitude: parseFloat(longitude) || incident.longitude
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleQuickResolve = async () => {
    setSaving(true);
    try {
      await onSave(incident.id, {
        status: 'Resolved',
        estimated_restoration: 'Cleared & Reopened'
      });
      setStatus('Resolved');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-blue-500/40 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Super Admin: Edit Landslide / Incident</h3>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                  #{incident.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Updating will automatically synchronize the public GIS map and alert feed for all users.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Status & Quick Resolve Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Current Clearance Status</span>
              <span className={`text-xs font-bold ${status.toLowerCase() === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {status.toUpperCase()}
              </span>
            </div>
            {status.toLowerCase() !== 'resolved' && (
              <button
                type="button"
                onClick={handleQuickResolve}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 self-start sm:self-auto transition disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>One-Click: Mark Incident as Resolved</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Incident Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IncidentType)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="Landslide">Landslide</option>
                <option value="Flood">Flood</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Bridge Damage">Bridge Damage</option>
                <option value="Traffic">Traffic</option>
                <option value="Weather">Weather</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical (Triggers Red Alert)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Location Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location Name</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                placeholder="e.g. NH-13 Sela Pass Sector"
              />
            </div>

            {/* Affected Road / Route */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Affected Road / Route</label>
              <input
                type="text"
                value={affectedRoute}
                onChange={(e) => setAffectedRoute(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500 font-mono"
                placeholder="e.g. NH-13, NH-29, NH-6"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Status Dropdown */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="Active">Active (Carriageway Blocked)</option>
                <option value="In Progress">In Progress (Clearing Underway)</option>
                <option value="Diverted">Diverted (Alternate Route Active)</option>
                <option value="Resolved">Resolved (Corridor Reopened)</option>
              </select>
            </div>

            {/* Estimated Restoration */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estimated Clearance Time</label>
              <input
                type="text"
                value={estimatedRestoration}
                onChange={(e) => setEstimatedRestoration(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                placeholder="e.g. 4-6 Hours or Reopened"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Field Description & Road Advisory</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Provide road conditions, rockfall size, single-lane feasibility, diversion details..."
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm(`Permanently delete incident #${incident.id}?`)) {
                    await onDelete(incident.id);
                    onClose();
                  }
                }}
                disabled={saving}
                className="px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-medium text-xs flex items-center gap-1.5 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Incident</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? 'Updating...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
