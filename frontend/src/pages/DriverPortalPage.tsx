import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { OfflineSyncService } from '../services/offlineSync';
import { Badge } from '../components/UI/Badge';
import {
  Truck,
  MapPin,
  Navigation,
  AlertTriangle,
  Send,
  WifiOff,
  Wifi,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Layers,
  Sparkles,
  ArrowRight,
  ThermometerSnowflake
} from 'lucide-react';

export const DriverPortalPage: React.FC = () => {
  const { user, isOffline, addToast, setCurrentPage, userLocation, syncRealLocation, isLocating } = useApp();
  const [gpsSending, setGpsSending] = useState(false);
  const [lastGpsSent, setLastGpsSent] = useState<string>('Just now');
  const [currentSpeed, setCurrentSpeed] = useState<number>(48);
  const [currentLat, setCurrentLat] = useState<number>(() => userLocation ? +(userLocation.latitude.toFixed(4)) : 26.850);
  const [currentLng, setCurrentLng] = useState<number>(() => userLocation ? +(userLocation.longitude.toFixed(4)) : 93.200);

  // Sync state if real GPS coordinates become available
  React.useEffect(() => {
    if (userLocation) {
      setCurrentLat(+(userLocation.latitude.toFixed(4)));
      setCurrentLng(+(userLocation.longitude.toFixed(4)));
      if (userLocation.speed !== null && userLocation.speed > 0) {
        setCurrentSpeed(Math.round(userLocation.speed * 3.6));
      }
    }
  }, [userLocation]);

  // Quick hazard report state
  const [hazardType, setHazardType] = useState('Landslide');
  const [hazardDesc, setHazardDesc] = useState('');
  const [submittingHazard, setSubmittingHazard] = useState(false);

  const handleTransmitGPS = async () => {
    setGpsSending(true);
    const newLat = +(currentLat + (Math.random() - 0.5) * 0.02).toFixed(4);
    const newLng = +(currentLng + (Math.random() - 0.5) * 0.02).toFixed(4);
    setCurrentLat(newLat);
    setCurrentLng(newLng);

    if (isOffline) {
      OfflineSyncService.queueGPSUpdate({
        vehicle_id: 1,
        vehicle_number: 'AS-01-GC-4412',
        latitude: newLat,
        longitude: newLng,
        speed: currentSpeed,
        status: 'Moving'
      });
      setLastGpsSent('Queued in offline cache');
      addToast('Offline Mode: GPS position saved to local queue. Will auto-sync when online.', 'warning');
      setGpsSending(false);
      return;
    }

    try {
      await api.updateVehicleGPS(1, {
        latitude: newLat,
        longitude: newLng,
        speed: currentSpeed,
        status: 'Moving'
      });
      setLastGpsSent(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      addToast(`GPS Telemetry transmitted successfully! (${newLat}, ${newLng})`, 'success');
    } catch (err) {
      OfflineSyncService.queueGPSUpdate({
        vehicle_id: 1,
        vehicle_number: 'AS-01-GC-4412',
        latitude: newLat,
        longitude: newLng,
        speed: currentSpeed,
        status: 'Moving'
      });
      addToast('Network error: GPS position cached offline.', 'warning');
    } finally {
      setGpsSending(false);
    }
  };

  const handleQuickHazardReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardDesc) {
      addToast('Please provide a brief hazard description.', 'warning');
      return;
    }

    setSubmittingHazard(true);
    const reportData = {
      type: hazardType as any,
      description: `[Driver Report] ${hazardDesc}`,
      severity: 'High' as any,
      latitude: currentLat,
      longitude: currentLng,
      location_name: `NH-37 Sector (Km 142 near Kaziranga Approach)`,
      reported_by: `${user?.name || 'Driver'} (Convoy AS-01-GC-4412)`,
      estimated_restoration: '3-5 Hours'
    };

    if (isOffline) {
      OfflineSyncService.queueIncident(reportData);
      addToast('Hazard report saved in offline queue! Command center notified upon sync.', 'warning');
      setHazardDesc('');
      setSubmittingHazard(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('type', reportData.type);
      formData.append('description', reportData.description);
      formData.append('severity', reportData.severity);
      formData.append('latitude', reportData.latitude.toString());
      formData.append('longitude', reportData.longitude.toString());
      formData.append('location_name', reportData.location_name);
      formData.append('reported_by', reportData.reported_by);
      formData.append('estimated_restoration', reportData.estimated_restoration);

      await api.createIncident(formData);
      addToast('Disruption alert broadcast to Command Center & incoming fleet!', 'success');
      setHazardDesc('');
    } catch (err) {
      OfflineSyncService.queueIncident(reportData);
      addToast('Network failed: Saved to offline queue.', 'warning');
    } finally {
      setSubmittingHazard(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Driver Console Banner */}
      <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Driver Command & Highway Navigation Console
                </h1>
                <Badge variant="accessible" size="sm">Active Mission</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Driver: <span className="text-white font-semibold">{user?.name || 'Pranab Gogoi'}</span> • Vehicle: <span className="font-mono text-emerald-400 font-bold">AS-01-GC-4412</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOffline ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-xs text-rose-300 font-bold">
                <WifiOff className="h-4 w-4 text-rose-400" />
                <span>OFFLINE MODE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 font-bold">
                <Wifi className="h-4 w-4 text-emerald-400" />
                <span>CONNECTED (4G TELEMETRY)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Assignment Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Assigned Delivery Mission</h2>
            </div>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              MISSION # DLV-NER-001
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium">Consignment Cargo</p>
              <p className="text-xs font-bold text-white mt-1 flex items-center gap-1">
                <ThermometerSnowflake className="h-3.5 w-3.5 text-blue-400" />
                <span>Essential Medicines</span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium">Route Corridor</p>
              <p className="text-xs font-bold text-white mt-1 truncate">Guwahati → Dibrugarh</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium">Mission Priority</p>
              <p className="text-xs font-bold text-rose-400 mt-1">High (Lifeline)</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium">Estimated Arrival</p>
              <p className="text-xs font-bold text-emerald-400 mt-1">Today, 17:30</p>
            </div>
          </div>

          {/* Highway Checkpoint Progress */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-blue-400" />
              <span>Recommended Corridor: NH-27 / NH-37 Northern Trunk</span>
            </h3>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                <p className="text-[10px] text-emerald-300">Origin</p>
                <p className="font-bold truncate">Guwahati</p>
                <span className="text-[9px] text-emerald-500">Passed ✓</span>
              </div>
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                <p className="text-[10px] text-emerald-300">CP 1</p>
                <p className="font-bold truncate">Nagaon</p>
                <span className="text-[9px] text-emerald-500">Passed ✓</span>
              </div>
              <div className="p-2 rounded bg-blue-950/60 border border-blue-500/50 text-blue-300 animate-pulse">
                <p className="text-[10px] text-blue-200">Current</p>
                <p className="font-bold truncate">Kaziranga</p>
                <span className="text-[9px] text-blue-400 font-bold">In Transit</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                <p className="text-[10px] text-slate-500">Destination</p>
                <p className="font-bold truncate">Dibrugarh</p>
                <span className="text-[9px] text-slate-500">2h 45m</span>
              </div>
            </div>
          </div>

          {/* Active Warnings for this route */}
          <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>LIVE HIGHWAY WARNING: Heavy Rainfall & River Backwater</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              Brahmaputra flood monitoring active near Bogibeel Link (Km 390). Heavy vehicles advised to maintain caution speed 35 km/h. Alternate Kaziranga South Bypass is open if water rises.
            </p>
          </div>
        </div>

        {/* Driver Telemetry & GPS Transmitter (Right Column) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Live GPS Beacon</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Auto-Beacon: Active</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Latitude:</span>
                <span className="text-white font-bold">{currentLat} °N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Longitude:</span>
                <span className="text-white font-bold">{currentLng} °E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ground Speed:</span>
                <span className="text-emerald-400 font-bold">{currentSpeed} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Telemetry Sent:</span>
                <span className="text-slate-300">{lastGpsSent}</span>
              </div>
            </div>

            {/* Real GPS Sync Action */}
            <button
              type="button"
              onClick={() => syncRealLocation(true)}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#142013] border border-[#263824] hover:border-[#436B3B] text-xs font-semibold text-[#F0F7EE] transition"
            >
              <Navigation className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin text-[#34D399]' : 'text-[#34D399]'}`} />
              <span>{isLocating ? 'Acquiring Device GPS...' : 'Sync Device GPS Location'}</span>
              {userLocation && (
                <span className="text-[10px] text-[#A7F3D0] font-mono">
                  (±{userLocation.accuracy}m)
                </span>
              )}
            </button>

            <button
              onClick={handleTransmitGPS}
              disabled={gpsSending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg disabled:opacity-50"
            >
              <Send className={`h-4 w-4 ${gpsSending ? 'animate-spin' : ''}`} />
              <span>{gpsSending ? 'Transmitting...' : 'Transmit Current GPS Position'}</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              Works offline! GPS coordinates are queued locally if connection drops.
            </p>
          </div>

          {/* Quick Disruption Report Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">One-Tap Hazard Report</h3>
            </div>
            <p className="text-xs text-slate-400">
              Encountered a rockfall, bridge failure or fallen tree? Report instantly to alert fleet and emergency response.
            </p>

            <form onSubmit={handleQuickHazardReport} className="space-y-2.5">
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="Landslide">Landslide / Rockfall</option>
                <option value="Flood">Waterlogging / Flash Flood</option>
                <option value="Road Damage">Road Crater / Subsidence</option>
                <option value="Bridge Damage">Bridge Restriction</option>
                <option value="Traffic">Overturned Vehicle / Blockage</option>
              </select>

              <input
                type="text"
                required
                placeholder="Brief description (e.g. mud on left lane)"
                value={hazardDesc}
                onChange={(e) => setHazardDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={submittingHazard}
                className="w-full py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs transition shadow disabled:opacity-50"
              >
                {submittingHazard ? 'Submitting...' : 'Broadcast Disruption'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
