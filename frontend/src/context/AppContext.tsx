import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Region, Language } from '../types';
import { translations } from './translations';
import { api } from '../services/api';
import { OfflineSyncService } from '../services/offlineSync';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
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
      setLastUpdated
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
