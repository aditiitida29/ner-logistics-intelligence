import { useState, useEffect, useCallback } from 'react';
import { OfflineSyncService } from '../services/offlineSync';
import { OfflineQueueItem } from '../types';

export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshQueue = useCallback(() => {
    const q = OfflineSyncService.getQueue();
    setQueue(q);
    setPendingCount(OfflineSyncService.getPendingCount());
  }, []);

  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, 5000);
    return () => clearInterval(interval);
  }, [refreshQueue]);

  const syncNow = async () => {
    setIsSyncing(true);
    try {
      const synced = await OfflineSyncService.syncAllPending();
      refreshQueue();
      return synced;
    } finally {
      setIsSyncing(false);
    }
  };

  return { queue, pendingCount, isSyncing, syncNow, refreshQueue };
}
