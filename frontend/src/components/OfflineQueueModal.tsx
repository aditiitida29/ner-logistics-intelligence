import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OfflineSyncService } from '../services/offlineSync';
import { OfflineQueueItem, OfflineSyncStatus } from '../types';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  X,
  Plus,
  Send,
  Truck,
  MapPin,
  Package
} from 'lucide-react';
import { Badge } from './UI/Badge';

interface OfflineQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineQueueModal: React.FC<OfflineQueueModalProps> = ({ isOpen, onClose }) => {
  const { isOffline, syncOfflineReports, addToast } = useApp();
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [syncing, setSyncing] = useState(false);

  const reloadQueue = () => {
    setQueue(OfflineSyncService.getQueue());
  };

  useEffect(() => {
    if (isOpen) {
      reloadQueue();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const count = await OfflineSyncService.syncAllPending(
        (synced) => {
          addToast(`${synced} offline records synchronized to central cloud database!`, 'success');
          reloadQueue();
        },
        (err) => {
          addToast(`Some items could not sync: ${err.message}`, 'error');
          reloadQueue();
        }
      );
      if (count === 0) {
        addToast('No pending items to synchronize or already up to date.', 'info');
      }
    } finally {
      setSyncing(false);
      reloadQueue();
    }
  };

  const handleQueueTestIncident = () => {
    const num = Math.floor(Math.random() * 80) + 110;
    OfflineSyncService.queueIncident({
      type: 'Landslide',
      description: `Mountain slope rockfall cleared locally by patrol team at Km ${num}.`,
      severity: 'Medium',
      latitude: 27.2000 + Math.random() * 0.4,
      longitude: 92.3000 + Math.random() * 0.5,
      location_name: `NH-13 Mountain Pass Km ${num}`,
      reported_by: 'Field Officer',
      estimated_restoration: '4 Hours'
    });
    addToast(`Queued Incident #${num} to offline storage. Waiting for network.`, 'info');
    reloadQueue();
  };

  const handleQueueTestGPS = () => {
    const vehNums = ['NL-07-A-3319', 'AS-01-GC-4412', 'MN-01-D-5544', 'SK-01-P-1188'];
    const chosen = vehNums[Math.floor(Math.random() * vehNums.length)];
    OfflineSyncService.queueGPSUpdate({
      vehicle_id: 1,
      vehicle_number: chosen,
      latitude: 25.6800 + (Math.random() - 0.5) * 0.1,
      longitude: 91.9100 + (Math.random() - 0.5) * 0.1,
      speed: Math.floor(25 + Math.random() * 30),
      status: 'Moving'
    });
    addToast(`Recorded offline GPS update for ${chosen}`, 'info');
    reloadQueue();
  };

  const handleClearSynced = () => {
    OfflineSyncService.clearSynced();
    reloadQueue();
    addToast('Cleared synchronized records from cache.', 'info');
  };

  const handleDeleteItem = (id: string) => {
    OfflineSyncService.deleteItem(id);
    reloadQueue();
  };

  const pendingCount = queue.filter(i => i.sync_status === 'Pending' || i.sync_status === 'Failed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isOffline ? 'bg-rose-950/80 border border-rose-500/40 text-rose-400' : 'bg-blue-950/80 border border-blue-500/40 text-blue-400'}`}>
              {isOffline ? <WifiOff className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Offline Field Telemetry & Synchronization Queue
                </h2>
                <Badge variant={isOffline ? 'blocked' : 'accessible'} size="sm">
                  {isOffline ? 'OFFLINE MODE' : 'ONLINE / CONNECTED'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                PWA Local Storage • Automatic synchronization when connectivity returns
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

        {/* Action Toolbar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-300">
              {pendingCount} Pending Sync Items
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{queue.length} Total Cached</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncNow}
              disabled={syncing || pendingCount === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
            <button
              onClick={handleClearSynced}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Clear Synced
            </button>
          </div>
        </div>

        {/* Quick Simulation Row */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/50 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-slate-500 font-mono">DEMO SHORTCUTS:</span>
          <button
            onClick={handleQueueTestIncident}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span>+ Queue Incident</span>
          </button>
          <button
            onClick={handleQueueTestGPS}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <MapPin className="h-3 w-3 text-blue-400" />
            <span>+ Queue GPS Telemetry</span>
          </button>
        </div>

        {/* Queue Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {queue.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle2 className="h-10 w-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold">Offline queue is empty</p>
              <p className="text-xs text-slate-500 mt-1">All field reports and GPS records are synchronized.</p>
            </div>
          ) : (
            queue.map((item) => {
              const isPending = item.sync_status === 'Pending';
              const isSyncing = item.sync_status === 'Syncing';
              const isSynced = item.sync_status === 'Synced';
              const isFailed = item.sync_status === 'Failed';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                    isPending
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : isSyncing
                      ? 'bg-blue-950/20 border-blue-500/40 animate-pulse'
                      : isSynced
                      ? 'bg-emerald-950/10 border-emerald-500/20'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {item.type === 'Incident' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                      {item.type === 'GPS Update' && <Truck className="h-4 w-4 text-blue-400" />}
                      {item.type === 'Delivery Update' && <Package className="h-4 w-4 text-emerald-400" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{item.item_code}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium truncate mt-0.5">{item.title}</p>
                      
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        {item.retry_count > 0 && (
                          <span className="text-rose-400 font-mono">{item.retry_count} retries</span>
                        )}
                        {item.error_message && (
                          <span className="text-rose-400 truncate max-w-xs">{item.error_message}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                        isPending
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : isSyncing
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          : isSynced
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {item.sync_status}
                    </span>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Remove record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-center text-[11px] text-slate-500">
          Background synchronization executes automatically whenever network connectivity is detected.
        </div>
      </div>
    </div>
  );
};
