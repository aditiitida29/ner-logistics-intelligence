import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { OfflineSyncService } from '../services/offlineSync';
import { Incident, IncidentType, IncidentSeverity } from '../types';
import { Badge } from '../components/UI/Badge';
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
  X
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
    isOffline,
    pendingOfflineCount,
    syncOfflineReports,
    inspectedIncidentId,
    setInspectedIncidentId,
    addToast
  } = useApp();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [type, setType] = useState<IncidentType>('Landslide');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('High');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<string>('27.5020');
  const [longitude, setLongitude] = useState<string>('92.1030');
  const [reportedBy, setReportedBy] = useState('PWD Highway Patrol Officer');
  const [estimatedRestoration, setEstimatedRestoration] = useState('6-8 Hours');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [search, setSearch] = useState('');

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

  // HTML5 "Use My Location"
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      addToast('Browser geolocation not supported. Please input coordinates manually.', 'warning');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(5));
        setLongitude(pos.coords.longitude.toFixed(5));
        setLocationName('Field GPS Captured Location');
        addToast('Current GPS coordinates applied!', 'success');
      },
      (err) => {
        console.warn(err);
        addToast('Unable to access device GPS. Defaulting to regional NER coordinates.', 'info');
        setLatitude('26.1445');
        setLongitude('91.7362');
        setLocationName('Guwahati Sector (Fallback)');
      }
    );
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
    if (!description || !locationName) {
      addToast('Please provide both location and description.', 'warning');
      return;
    }

    setSubmitting(true);

    // If offline, save locally
    if (isOffline) {
      OfflineSyncService.saveOfflineReport({
        type,
        description,
        severity,
        latitude: parseFloat(latitude) || 26.1445,
        longitude: parseFloat(longitude) || 91.7362,
        location_name: locationName,
        reported_by: reportedBy,
        estimated_restoration: estimatedRestoration
      });
      addToast('Report saved locally in Offline Mode. Will auto-sync when online.', 'warning');
      resetForm();
      setSubmitting(false);
      return;
    }

    // Online submission
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('description', description);
      formData.append('severity', severity);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('location_name', locationName);
      formData.append('reported_by', reportedBy);
      formData.append('estimated_restoration', estimatedRestoration);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await api.createIncident(formData);
      addToast(`Incident #${res.id} submitted successfully and broadcast to command center!`, 'success');
      resetForm();
      loadIncidents();
    } catch (err: any) {
      console.error(err);
      // Fallback to offline store
      OfflineSyncService.saveOfflineReport({
        type,
        description,
        severity,
        latitude: parseFloat(latitude) || 26.1445,
        longitude: parseFloat(longitude) || 91.7362,
        location_name: locationName,
        reported_by: reportedBy,
        estimated_restoration: estimatedRestoration
      });
      addToast('Network error: Incident saved locally to offline queue.', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setLocationName('');
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const filteredIncidents = incidents.filter(i => {
    const matchesType = filterType === 'All' || i.type === filterType;
    const matchesSev = filterSeverity === 'All' || i.severity === filterSeverity;
    const matchesSearch = !search ||
      i.location_name.toLowerCase().includes(search.toLowerCase()) ||
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
              Incident & Field Disruption Reporting
            </h1>
            <Badge variant="caution" size="sm">Field Telemetry</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Submit geo-tagged field observations with photos. Works seamlessly in remote low-connectivity and offline areas.
          </p>
        </div>

        {/* Offline Status & Sync Banner */}
        <div className="flex items-center gap-2">
          {isOffline ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 font-semibold">
              <WifiOff className="h-4 w-4 text-rose-400" />
              <span>OFFLINE MODE ACTIVE</span>
            </div>
          ) : pendingOfflineCount > 0 ? (
            <button
              onClick={syncOfflineReports}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-xs text-amber-300 font-bold animate-pulse"
            >
              <Wifi className="h-4 w-4 text-amber-400" />
              <span>{pendingOfflineCount} Pending Reports — Sync Now</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="h-4 w-4" />
              <span>All Reports Synced</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Submission Form (Left) & Active Incidents List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">Submit Geo-Tagged Incident</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Type & Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as IncidentType)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                >
                  {INCIDENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical (Auto-Alert)</option>
                </select>
              </div>
            </div>

            {/* Location Name & "Use My Location" */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Highway / Corridor Location</label>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <MapPin className="h-3 w-3" />
                  <span>Use My Location</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g., NH-13 Km 42 near Sela Pass"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Coordinates Lat / Lng */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Field Observations</label>
              <textarea
                rows={3}
                required
                placeholder="Describe road blockage extent, landslide width, water depth, single-lane bypass feasibility..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Photo Upload with Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Photograph Evidence</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-700 hover:border-slate-500 bg-slate-950 cursor-pointer text-xs text-slate-400 hover:text-white transition">
                  <Camera className="h-4 w-4 text-blue-400" />
                  <span>{photoFile ? photoFile.name : 'Upload JPG/PNG Photo'}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-0 right-0 p-0.5 bg-slate-900/80 text-white rounded-bl"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Restoration & Reporter */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Est. Restoration</label>
                <input
                  type="text"
                  value={estimatedRestoration}
                  onChange={(e) => setEstimatedRestoration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Officer Name</label>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Broadcasting Report...' : 'SUBMIT INCIDENT'}
            </button>
          </form>
        </div>

        {/* Incidents Directory Column */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden flex flex-col justify-between">
          {/* Top Filter Bar */}
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Live Disruption Reports ({filteredIncidents.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search incident..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-7 pr-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 w-36"
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

          {/* Incidents Scrollable List */}
          <div className="p-4 overflow-y-auto max-h-[620px] space-y-3">
            {filteredIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setInspectedIncidentId(inc.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row items-start justify-between gap-3 ${
                  inspectedIncidentId === inc.id
                    ? 'border-blue-500 bg-blue-950/20'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{inc.type}</span>
                    <Badge variant={inc.severity === 'Critical' ? 'blocked' : (inc.severity === 'High' ? 'highRisk' : 'caution')} size="sm">
                      {inc.severity}
                    </Badge>
                    <span className="text-[10px] text-slate-500 font-mono">#{inc.id}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">{inc.location_name}</p>
                  <p className="text-xs text-slate-400">{inc.description}</p>
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span>Restoration: {inc.estimated_restoration}</span>
                    <span>•</span>
                    <span>Reported by: {inc.reported_by}</span>
                    <span>•</span>
                    <span>{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {inc.image_path && (
                  <div className="h-16 w-20 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                    <img
                      src={`http://127.0.0.1:8000${inc.image_path}`}
                      alt="Incident proof"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Critical incidents automatically alert police escort hubs and convoys</span>
            <button onClick={loadIncidents} className="text-blue-400 hover:text-white font-medium">
              Refresh Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
