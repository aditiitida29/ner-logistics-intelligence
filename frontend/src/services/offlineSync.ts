import { OfflineIncidentReport, OfflineQueueItem, OfflineItemType, OfflineSyncStatus } from '../types';
import { api } from './api';

const QUEUE_STORAGE_KEY = 'ner_offline_unified_queue';

export class OfflineSyncService {
  static getQueue(): OfflineQueueItem[] {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (!stored) {
        return this.seedInitialDemoQueue();
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static saveQueue(queue: OfflineQueueItem[]): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save offline queue to localStorage', e);
    }
  }

  static seedInitialDemoQueue(): OfflineQueueItem[] {
    const demoQueue: OfflineQueueItem[] = [
      {
        id: 'q-inc-104',
        item_code: 'Incident #104',
        type: 'Incident',
        title: 'Landslide on NH-13 Km 48 (Sela Pass)',
        data: {
          type: 'Landslide',
          description: 'Earth slip with debris blocking uphill carriageway near pass elevation 13,700ft.',
          severity: 'High',
          latitude: 27.5020,
          longitude: 92.1030,
          location_name: 'NH-13 Sela Pass Sector, Tawang',
          reported_by: 'Field Patrol Officer',
          estimated_restoration: '6-8 Hours'
        },
        created_at: new Date(Date.now() - 25 * 60000).toISOString(),
        sync_status: 'Pending',
        retry_count: 0
      },
      {
        id: 'q-gps-782',
        item_code: 'GPS Update #782',
        type: 'GPS Update',
        title: 'Vehicle NL-07-A-3319 Telemetry',
        data: {
          vehicle_id: 3,
          vehicle_number: 'NL-07-A-3319',
          latitude: 25.7920,
          longitude: 93.9240,
          speed: 18.5,
          status: 'At Risk'
        },
        created_at: new Date(Date.now() - 12 * 60000).toISOString(),
        sync_status: 'Pending',
        retry_count: 0
      },
      {
        id: 'q-dlv-55',
        item_code: 'Delivery Update #55',
        type: 'Delivery Update',
        title: 'Mission DLV-NER-003 Checkpoint Milestone',
        data: {
          delivery_id: 3,
          delivery_code: 'DLV-NER-003',
          status: 'At Risk'
        },
        created_at: new Date(Date.now() - 5 * 60000).toISOString(),
        sync_status: 'Pending',
        retry_count: 0
      }
    ];
    this.saveQueue(demoQueue);
    return demoQueue;
  }

  // Queue a new field incident report
  static queueIncident(report: Omit<OfflineIncidentReport, 'id' | 'timestamp' | 'synced'>): OfflineQueueItem {
    const queue = this.getQueue();
    const count = queue.filter(q => q.type === 'Incident').length + 105;
    const item: OfflineQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      item_code: `Incident #${count}`,
      type: 'Incident',
      title: `${report.type} at ${report.location_name}`,
      data: report,
      created_at: new Date().toISOString(),
      sync_status: 'Pending',
      retry_count: 0
    };
    queue.unshift(item);
    this.saveQueue(queue);
    return item;
  }

  // Queue GPS update from driver/field officer
  static queueGPSUpdate(data: { vehicle_id?: number; vehicle_number?: string; latitude: number; longitude: number; speed?: number; status?: string }): OfflineQueueItem {
    const queue = this.getQueue();
    const count = queue.filter(q => q.type === 'GPS Update').length + 783;
    const item: OfflineQueueItem = {
      id: `queue-gps-${Date.now()}`,
      item_code: `GPS Update #${count}`,
      type: 'GPS Update',
      title: `GPS: ${data.vehicle_number || 'Vehicle'} @ (${data.latitude.toFixed(3)}, ${data.longitude.toFixed(3)})`,
      data,
      created_at: new Date().toISOString(),
      sync_status: 'Pending',
      retry_count: 0
    };
    queue.unshift(item);
    this.saveQueue(queue);
    return item;
  }

  // Queue delivery status update
  static queueDeliveryUpdate(data: { delivery_id: number; delivery_code: string; status: string }): OfflineQueueItem {
    const queue = this.getQueue();
    const count = queue.filter(q => q.type === 'Delivery Update').length + 56;
    const item: OfflineQueueItem = {
      id: `queue-dlv-${Date.now()}`,
      item_code: `Delivery Update #${count}`,
      type: 'Delivery Update',
      title: `${data.delivery_code} status → ${data.status}`,
      data,
      created_at: new Date().toISOString(),
      sync_status: 'Pending',
      retry_count: 0
    };
    queue.unshift(item);
    this.saveQueue(queue);
    return item;
  }

  // Synchronize all pending items
  static async syncAllPending(
    onSuccess?: (syncedCount: number) => void,
    onError?: (err: any) => void
  ): Promise<number> {
    const queue = this.getQueue();
    const pendingItems = queue.filter(i => i.sync_status === 'Pending' || i.sync_status === 'Failed');
    if (pendingItems.length === 0) return 0;

    let syncedCount = 0;

    for (const item of queue) {
      if (item.sync_status === 'Pending' || item.sync_status === 'Failed') {
        item.sync_status = 'Syncing';
        this.saveQueue(queue);

        try {
          if (item.type === 'Incident') {
            const formData = new FormData();
            formData.append('type', item.data.type);
            formData.append('description', item.data.description);
            formData.append('severity', item.data.severity);
            formData.append('latitude', item.data.latitude.toString());
            formData.append('longitude', item.data.longitude.toString());
            formData.append('location_name', item.data.location_name);
            formData.append('reported_by', item.data.reported_by || 'Field Officer');
            formData.append('estimated_restoration', item.data.estimated_restoration || '4-6 Hours');
            if (item.data.district_name) {
              formData.append('district_name', item.data.district_name);
            }
            await api.createIncident(formData);
          } else if (item.type === 'GPS Update') {
            const vehId = item.data.vehicle_id || 1;
            await api.updateVehicleGPS(vehId, {
              latitude: item.data.latitude,
              longitude: item.data.longitude,
              speed: item.data.speed,
              status: item.data.status
            });
          } else if (item.type === 'Delivery Update') {
            await api.updateDeliveryStatus(item.data.delivery_id, item.data.status);
          }

          item.sync_status = 'Synced';
          item.error_message = undefined;
          syncedCount++;
        } catch (err: any) {
          item.sync_status = 'Failed';
          item.retry_count += 1;
          item.error_message = err?.message || 'Network unreachable';
        }
        this.saveQueue(queue);
      }
    }

    if (syncedCount > 0 && onSuccess) {
      onSuccess(syncedCount);
    }
    const remainingFailed = queue.filter(i => i.sync_status === 'Failed').length;
    if (remainingFailed > 0 && onError) {
      onError(new Error(`${remainingFailed} items could not be synchronized.`));
    }

    return syncedCount;
  }

  static getPendingCount(): number {
    return this.getQueue().filter(i => i.sync_status === 'Pending' || i.sync_status === 'Failed').length;
  }

  static deleteItem(id: string): void {
    const queue = this.getQueue().filter(i => i.id !== id);
    this.saveQueue(queue);
  }

  static clearSynced(): void {
    const queue = this.getQueue().filter(i => i.sync_status !== 'Synced');
    this.saveQueue(queue);
  }

  static clearAll(): void {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  // Compatibility helpers
  static getPendingReports(): OfflineIncidentReport[] {
    return this.getQueue()
      .filter(q => q.type === 'Incident')
      .map(q => ({
        id: q.id,
        ...q.data,
        timestamp: q.created_at,
        synced: q.sync_status === 'Synced'
      }));
  }

  static saveOfflineReport(report: Omit<OfflineIncidentReport, 'id' | 'timestamp' | 'synced'>): OfflineIncidentReport {
    const item = this.queueIncident(report);
    return {
      id: item.id,
      ...report,
      timestamp: item.created_at,
      synced: false
    };
  }
}
