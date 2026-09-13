import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { OfflineSyncService } from '../services/offlineSync';
import { Incident, IncidentType, IncidentSeverity } from '../types';
import { Badge } from '../components/UI/Badge';
import { IncidentEditModal } from '../components/IncidentEditModal';
import { AlertDetailModal, AlertDetailData } from '../components/AlertDetailModal';
import {
  AlertTriangle,
  Upload,
  MapPin,
  Camera,
  CheckCircle2,
  WifiOff,
  Wifi,
  Search,
  RefreshCw,
  Clock,
  User,
  Image as ImageIcon,
  X,
  Radio,
  Edit,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  PlusCircle
} from 'lucide-react';

const INCIDENT_TYPES: IncidentType[] = [
  'Landslide',
  'Flood',
  'Road Damage',
  'Bridge Damage',
  'Traffic',
  'Weather',
  'Other'
];

export const IncidentReportsPage: React.FC = () => {
  const {
    user,
    isOffline,
    pendingOfflineCount,
    syncOfflineReports,
    setIsOfflineQueueOpen,
    inspectedIncidentId,
    setInspectedIncidentId,
    addToast,
    userLocation,
    syncRealLocation,
    isLocating,
    setCurrentPage
  } = useApp();

  const isSuperAdmin = (user?.role || '').toLowerCase() === 'super_admin' || (user?.role || '').toLowerCase() === 'admin';

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State (Super Admin)
  const [type, setType] = useState<IncidentType>('Landslide');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('High');
  const [locationName, setLocationName] = useState('');
  const [affectedRoute, setAffectedRoute] = useState('NH-13');
  const [latitude, setLatitude] = useState<string>(() => userLocation ? userLocation.latitude.toFixed(5) : '27.5020');
  const [longitude, setLongitude] = useState<string>(() => userLocation ? userLocation.longitude.toFixed(5) : '92.1030');
  const [reportedBy, setReportedBy] = useState('Super Admin Incident Desk');
  const [estimatedRestoration, setEstimatedRestoration] = useState('6-8 Hours');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [inspectingAlert, setInspectingAlert] = useState<AlertDetailData | null>(null);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load incident reports.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleUseMyLocation = async () => {
    if (userLocation) {
      setLatitude(userLocation.latitude.toFixed(5));
      setLongitude(userLocation.longitude.toFixed(5));
      setLocationName(`GPS Ground Location (±${userLocation.accuracy}m)`);
      addToast(`Real GPS applied: ${userLocation.latitude.toFixed(4)}°N, ${userLocation.longitude.toFixed(4)}°E`, 'success');
      return;
    }
    await syncRealLocation(true);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      addToast('Unauthorized: Only Super Admin can report new incidents.', 'error');
      return;
    }

    if (!description || !locationName) {
      addToast('Please provide both location and description.', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('description', description);
      formData.append('severity', severity);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('location_name', locationName);
      formData.append('affected_route', affectedRoute);
      formData.append('reported_by', reportedBy);
      formData.append('estimated_restoration', estimatedRestoration);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await api.createIncident(formData);
      addToast(`Incident #${res.id} submitted & alert broadcast!`, 'success');
      resetForm();
      loadIncidents();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to submit incident.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (id: number, data: Partial<Incident>) => {
    try {
      await api.updateIncident(id, data);
      addToast(`Incident #${id} successfully updated. Alerts synchronized.`, 'success');
      loadIncidents();
    } catch (err: any) {
      addToast(err.message || 'Failed to update incident.', 'error');
    }
  };

  const handleQuickResolve = async (id: number) => {
    try {
      await api.updateIncidentStatus(id, 'Resolved');
      addToast(`Incident #${id} resolved! Clearance alert broadcast to commuters.`, 'success');
      loadIncidents();
    } catch (err: any) {
      addToast(err.message || 'Failed to resolve incident.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteIncident(id);
      addToast(`Incident #${id} deleted.`, 'info');
      loadIncidents();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete incident.', 'error');
    }
  };

  const resetForm = () => {
    setDescription('');
    setLocationName('');
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const openInspection = (inc: Incident) => {
    setInspectingAlert({
      id: inc.id,
      title: `${inc.severity.toUpperCase()} ${inc.type.toUpperCase()}: ${inc.location_name}`,
      description: inc.description,
      severity: inc.severity,
      location: inc.location_name,
      affected_route: inc.affected_route,
      status: inc.status,
      estimated_restoration: inc.estimated_restoration,
      created_at: inc.created_at,
      reported_by: inc.reported_by,
      latitude: inc.latitude,
      longitude: inc.longitude,
      image_path: inc.image_path
    });
  };

  const filteredIncidents = incidents.filter(i => {
    const matchesType = filterType === 'All' || i.type === filterType;
    const matchesSev = filterSeverity === 'All' || i.severity === filterSeverity;
    const matchesSearch = !search ||
      i.location_name.toLowerCase().includes(search.toLowerCase()) ||
      (i.affected_route || '').toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Incident & Landslide Management
            </h1>
            <Badge variant={isSuperAdmin ? 'info' : 'caution'} size="sm">
              {isSuperAdmin ? 'Super Admin Mode' : 'Normal User (Read-Only)'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isSuperAdmin
              ? 'Create, update, resolve, and manage mountain roadblocks, landslides, and highway disruptions.'
              : 'Live verified landslide and disruption advisories. Modification is restricted to authorized Super Admins.'}
          </p>
        </div>

        {/* Action / Sync bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadIncidents}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className={`grid grid-cols-1 ${isSuperAdmin ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6`}>
        {/* Left Column: Form (Super Admin only) */}
        {isSuperAdmin && (
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <PlusCircle className="h-5 w-5 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Report Landslide / Incident</h2>
                <p className="text-[10px] text-slate-400">Broadcasts instant alerts across all 8 NER states.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Type & Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Incident Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as IncidentType)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  >
                    {INCIDENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (Auto Red Alert)</option>
                  </select>
                </div>
              </div>

              {/* Location Name & Affected Route */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Location Name</label>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 disabled:opacity-50 transition"
                  >
                    <MapPin className={`h-3 w-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. NH-13 Sela Pass Sector, Tawang"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Affected Road / Route</label>
                <input
                  type="text"
                  placeholder="e.g. NH-13, NH-29, NH-6, NH-10"
                  value={affectedRoute}
                  onChange={(e) => setAffectedRoute(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Field Observations</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe road blockage extent, rockfall size, single-lane bypass status..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Restoration Estimate */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Estimated Clearance Time</label>
                <input
                  type="text"
                  value={estimatedRestoration}
                  onChange={(e) => setEstimatedRestoration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 6-8 Hours"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Broadcasting Alert...' : 'SUBMIT & PUBLISH ALERT'}
              </button>
            </form>
          </div>
        )}

        {/* Right Column: Directory List */}
        <div className={`${isSuperAdmin ? 'lg:col-span-7' : 'lg:col-span-12'} rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden flex flex-col justify-between`}>
          {/* Top Filter Bar */}
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Active Mountain Incidents ({filteredIncidents.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search route or place..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-7 pr-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 w-44"
                />
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1"
              >
                <option value="All">All Types</option>
                {INCIDENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Incidents List */}
          <div className="p-4 overflow-y-auto max-h-[620px] space-y-3">
            {filteredIncidents.map((inc) => {
              const isResolved = (inc.status || '').toLowerCase() === 'resolved';

              return (
                <div
                  key={inc.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start justify-between gap-3.5 shadow-md ${
                    isResolved
                      ? 'border-emerald-500/30 bg-slate-950/50 opacity-75'
                      : inc.severity === 'Critical'
                      ? 'border-rose-500/40 bg-rose-950/20'
                      : 'border-slate-800 bg-slate-950/80'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white">{inc.type}</span>
                      <Badge variant={inc.severity === 'Critical' ? 'blocked' : (inc.severity === 'High' ? 'highRisk' : 'caution')} size="sm">
                        {inc.severity}
                      </Badge>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold font-mono border ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {inc.status.toUpperCase()}
                      </span>
                      {inc.affected_route && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
                          {inc.affected_route}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-slate-100">{inc.location_name}</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{inc.description}</p>

                    <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>Clearance: {inc.estimated_restoration}</span>
                      <span>•</span>
                      <span>Reported: {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                    </div>
                  </div>

                  {/* Right side actions */}
                  <div className="flex flex-col sm:items-end gap-2 self-stretch sm:self-auto justify-between shrink-0">
                    <button
                      type="button"
                      onClick={() => openInspection(inc)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
                    >
                      <span>Full Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    {/* Super Admin Actions */}
                    {isSuperAdmin && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {!isResolved && (
                          <button
                            type="button"
                            onClick={() => handleQuickResolve(inc.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1"
                            title="Mark as Resolved"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Resolve</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingIncident(inc)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Edit Incident"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete incident #${inc.id}?`)) {
                              handleDelete(inc.id);
                            }
                          }}
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition"
                          title="Delete Incident"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Verified road intelligence across 8 NER states</span>
            <span className="font-mono text-emerald-400">Telemetry Synchronized</span>
          </div>
        </div>
      </div>

      {/* Super Admin Edit Modal */}
      {editingIncident && (
        <IncidentEditModal
          incident={editingIncident}
          isOpen={true}
          onClose={() => setEditingIncident(null)}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Alert / Incident Detail Modal */}
      <AlertDetailModal
        alert={inspectingAlert}
        isOpen={inspectingAlert !== null}
        onClose={() => setInspectingAlert(null)}
        onViewOnMap={() => setCurrentPage('live-map')}
      />
    </div>
  );
};
