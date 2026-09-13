import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { OfflineQueueModal } from './components/OfflineQueueModal';
import { ToastContainer } from './components/UI/Toast';
import { CinematicIntro } from './components/CinematicIntro';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { RouteIntelligencePage } from './pages/RouteIntelligencePage';
import { VehicleTrackingPage } from './pages/VehicleTrackingPage';
import { IncidentReportsPage } from './pages/IncidentReportsPage';
import { AlertsPage } from './pages/AlertsPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { DistrictIntelligencePage } from './pages/DistrictIntelligencePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DriverPortalPage } from './pages/DriverPortalPage';
import { UserDashboardPage } from './pages/UserDashboardPage';

const AppContent: React.FC = () => {
  const { currentPage, isOfflineQueueOpen, setIsOfflineQueueOpen, showCinematicIntro, setShowCinematicIntro, user } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isNormalUser = (user?.role || '').toLowerCase() === 'normal_user';

  // Render current page based on routing state with RBAC protection
  const renderPage = () => {
    // Normal User Route Guards: redirect restricted admin views to commuter dashboard
    if (isNormalUser) {
      const adminOnlyPages = ['vehicles', 'deliveries', 'analytics', 'driver-portal'];
      if (adminOnlyPages.includes(currentPage)) {
        return <UserDashboardPage />;
      }
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage />;
      case 'user-dashboard':
        return <UserDashboardPage />;
      case 'live-map':
        return <LiveMapPage />;
      case 'route-intel':
        return <RouteIntelligencePage />;
      case 'vehicles':
        return <VehicleTrackingPage />;
      case 'incidents':
        return <IncidentReportsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'deliveries':
        return <LogisticsPage />;
      case 'districts':
        return <DistrictIntelligencePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'driver-portal':
        return <DriverPortalPage />;
      case 'dashboard':
      default:
        return isNormalUser ? <UserDashboardPage /> : <DashboardPage />;
    }
  };

  // Login page layout without sidebar/navbar if user explicitly requested login view
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        {/* Cinematic Opening Animation */}
        {showCinematicIntro && (
          <CinematicIntro onComplete={() => setShowCinematicIntro(false)} />
        )}

        <Navbar onMenuToggle={() => setIsSidebarOpen(true)} />
        <main className="flex-1 flex items-center justify-center">
          <LoginPage />
        </main>
        <footer className="py-4 border-t border-slate-800 bg-slate-950 text-center text-[11px] text-slate-400 font-mono">
          NER LOGISTICS • Northeast Route Intelligence • Smart India Hackathon 2026
        </footer>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Cinematic Opening Animation (played on load/reload/open or replayed on demand) */}
      {showCinematicIntro && (
        <CinematicIntro onComplete={() => setShowCinematicIntro(false)} />
      )}

      {/* Sidebar (Persistent on Desktop, Drawer on Mobile) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setIsSidebarOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>

        {/* Command Center Footer */}
        <footer className="border-t border-slate-800 bg-slate-950/95 px-6 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span className="font-medium text-slate-200">
              NER Logistics Route Intelligence Command Network
            </span>
            <span>•</span>
            <span>All 8 North Eastern States Active</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Ministry of Development of North Eastern Region (MDoNER)</span>
            <span>•</span>
            <span className="text-emerald-400">SIH 2026</span>
          </div>
        </footer>
      </div>

      {/* Global Modals & Notifications */}
      <GlobalSearchModal />
      <OfflineQueueModal isOpen={isOfflineQueueOpen} onClose={() => setIsOfflineQueueOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
