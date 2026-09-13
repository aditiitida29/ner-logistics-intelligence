import React, { ReactNode } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { OfflineQueueModal } from '../components/OfflineQueueModal';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { useApp } from '../context/AppContext';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const {
    isOffline,
    pendingOfflineCount,
    isOfflineQueueOpen,
    setIsOfflineQueueOpen
  } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-500">
      {/* Offline Status Warning Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse" />
            <span>OFFLINE MODE: No internet connection detected. Reports and updates are cached locally in IndexedDB/Storage.</span>
          </div>
          {pendingOfflineCount > 0 && (
            <button
              onClick={() => setIsOfflineQueueOpen(true)}
              className="px-2 py-0.5 rounded bg-slate-950 text-amber-400 text-xs font-semibold hover:bg-slate-900 transition"
            >
              {pendingOfflineCount} Pending Sync
            </button>
          )}
        </div>
      )}

      {/* Top Navigation */}
      <Navbar onMenuToggle={() => setIsSidebarOpen(prev => !prev)} />

      {/* Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Modals */}
      <OfflineQueueModal
        isOpen={isOfflineQueueOpen}
        onClose={() => setIsOfflineQueueOpen(false)}
      />
      <GlobalSearchModal />
    </div>
  );
};
