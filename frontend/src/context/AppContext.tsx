import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, Region, Language, AlertItem } from '../types';
import { translations } from './translations';
import { api } from '../services/api';
import { OfflineSyncService } from '../services/offlineSync';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isEmergencyMode: boolean;
  setIsEmergencyMode: (active: boolean) => void;
  isSimulationActive: boolean;
  setIsSimulationActive: (active: boolean) => void;
  isDemoMode: boolean;
  setIsDemoMode: (active: boolean) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  pendingOfflineCount: number;
  syncOfflineReports: () => Promise<void>;
  isOfflineQueueOpen: boolean;
  setIsOfflineQueueOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  inspectedVehicleId: number | null;
  setInspectedVehicleId: (id: number | null) => void;
  inspectedIncidentId: number | null;
  setInspectedIncidentId: (id: number | null) => void;
  inspectedDistrictId: number | null;
  setInspectedDistrictId: (id: number | null) => void;
  lastUpdated: string;
  setLastUpdated: (time: string) => void;
  userLocation: UserLocation | null;
  isLocating: boolean;
  syncRealLocation: (notify?: boolean) => Promise<void>;
  showCinematicIntro: boolean;
  setShowCinematicIntro: (show: boolean) => void;
  unreadAlertCount: number;
  alerts: AlertItem[];
  refreshAlerts: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    return api.getCurrentUser() || {
      id: 1,
      name: 'Director (NER Logistics)',
      email: 'admin@nerlogistics.gov.in',
      role: 'admin',
      department: 'North Eastern Council & MoRTH'
    };
  });
  
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedRegion, setSelectedRegion] = useState<Region>('Entire NER');
  const [language, setLanguage] = useState<Language>('en');
  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(false);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(() => OfflineSyncService.getPendingCount());
  const [isOfflineQueueOpen, setIsOfflineQueueOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [inspectedVehicleId, setInspectedVehicleId] = useState<number | null>(null);
  const [inspectedIncidentId, setInspectedIncidentId] = useState<number | null>(null);
  const [inspectedDistrictId, setInspectedDistrictId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showCinematicIntro, setShowCinematicIntro] = useState<boolean>(true);
  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(0);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const knownAlertIdsRef = useRef<Set<number>>(new Set());
  const isInitialAlertLoadRef = useRef<boolean>(true);

  // Sync real physical device GPS location
  const syncRealLocation = async (notify: boolean = false): Promise<void> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      if (notify) addToast('Device does not support Geolocation API.', 'warning');
      return;
    }

    setIsLocating(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: UserLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp
          };
          setUserLocation(loc);
          setIsLocating(false);
          if (notify) {
            addToast(`🛰️ GPS synchronized: ${loc.latitude.toFixed(4)}°N, ${loc.longitude.toFixed(4)}°E (±${loc.accuracy}m)`, 'success');
          }
          resolve();
        },
        (err) => {
          console.warn('Geolocation access:', err.message);
          setIsLocating(false);
          if (notify) {
            addToast('Physical GPS access denied or unavailable. Fallback to NER headquarters.', 'info');
          }
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // Continuous background location watcher + initial acquisition
  useEffect(() => {
    syncRealLocation(false);

    let watchId: number | null = null;
    if (typeof window !== 'undefined' && navigator.geolocation) {
      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy),
              speed: pos.coords.speed,
              heading: pos.coords.heading,
              timestamp: pos.timestamp
            });
          },
          (err) => {
            console.warn('GPS continuous watch error:', err.message);
          },
          { enableHighAccuracy: true, maximumAge: 10000 }
        );
      } catch (e) {
        // graceful fallback
      }
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Translation helper
  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  // Toast notification system
  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync offline reports
  const syncOfflineReports = async () => {
    const count = await OfflineSyncService.syncAllPending(
      (synced) => {
        addToast(`Reports synchronized successfully (${synced} items).`, 'success');
        setPendingOfflineCount(OfflineSyncService.getPendingCount());
      },
      () => {
        addToast(`Failed to sync some offline reports.`, 'error');
      }
    );
    setPendingOfflineCount(OfflineSyncService.getPendingCount());
  };

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      addToast('Internet connection restored. Synchronizing...', 'success');
      syncOfflineReports();
    };
    const handleOffline = () => {
      setIsOffline(true);
      addToast('Offline Mode active. Reports will be saved locally.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setPendingOfflineCount(OfflineSyncService.getPendingCount());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic GPS Simulation ticker (every 12 seconds if active)
  useEffect(() => {
    if (!isSimulationActive) return;

    const interval = setInterval(async () => {
      try {
        await api.simulateVehicleStep();
        setLastUpdated('Updated just now');
      } catch {
        // graceful offline fallback
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isSimulationActive]);

  // Real-Time Alert Polling: Dispatches instant alert toasts for new hazards AND clearance resolutions
  const pollAlerts = async () => {
    try {
      const liveAlerts = await api.getAlerts();
      setAlerts(liveAlerts);
      setUnreadAlertCount(liveAlerts.filter(a => !a.is_read).length);

      if (isInitialAlertLoadRef.current) {
        liveAlerts.forEach(a => knownAlertIdsRef.current.add(a.id));
        isInitialAlertLoadRef.current = false;
        return;
      }

      // Check for newly broadcast alerts
      for (const a of liveAlerts) {
        if (!knownAlertIdsRef.current.has(a.id)) {
          knownAlertIdsRef.current.add(a.id);

          // Broadcast real-time toast to the user
          const isClearance = a.title.toLowerCase().includes('clearance') || a.title.toLowerCase().includes('resolved');
          if (isClearance) {
            addToast(`🟢 ROAD CLEARANCE: ${a.title.replace('✅ ', '')} — Route reopened!`, 'success');
          } else {
            addToast(`🚨 HAZARD ALERT: ${a.title.replace('🚨 ', '')}`, a.severity === 'Critical' ? 'error' : 'warning');
          }

          // Trigger view reload in listening components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ner:alerts-updated', { detail: a }));
          }
        }
      }
    } catch {
      // graceful offline fallback
    }
  };

  useEffect(() => {
    pollAlerts();
    const alertInterval = setInterval(pollAlerts, 4000);
    return () => clearInterval(alertInterval);
  }, []);

  const refreshAlerts = async () => {
    await pollAlerts();
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      currentPage,
      setCurrentPage,
      selectedRegion,
      setSelectedRegion,
      language,
      setLanguage,
      t,
      isEmergencyMode,
      setIsEmergencyMode,
      isSimulationActive,
      setIsSimulationActive,
      isDemoMode,
      setIsDemoMode,
      isOffline,
      setIsOffline,
      pendingOfflineCount,
      syncOfflineReports,
      isOfflineQueueOpen,
      setIsOfflineQueueOpen,
      toasts,
      addToast,
      removeToast,
      isSearchOpen,
      setIsSearchOpen,
      inspectedVehicleId,
      setInspectedVehicleId,
      inspectedIncidentId,
      setInspectedIncidentId,
      inspectedDistrictId,
      setInspectedDistrictId,
      lastUpdated,
      setLastUpdated,
      userLocation,
      isLocating,
      syncRealLocation,
      showCinematicIntro,
      setShowCinematicIntro,
      unreadAlertCount,
      alerts,
      refreshAlerts
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
