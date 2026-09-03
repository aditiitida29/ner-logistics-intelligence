import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { OfflineQueueModal } from './components/OfflineQueueModal';
import { ToastContainer } from './components/UI/Toast';

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
import { EmergencyModePage } from './pages/EmergencyModePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DriverPortalPage } from './pages/DriverPortalPage';

const AppContent: React.FC = () => {
  const { currentPage, isOfflineQueueOpen, setIsOfflineQueueOpen } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Render current page based on routing state
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage />;
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
      case 'emergency':
        return <EmergencyModePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'driver-portal':
        return <DriverPortalPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  // Login page layout without sidebar/navbar if user explicitly requested login view
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Navbar onMenuToggle={() => setIsSidebarOpen(true)} />
        <main className="flex-1 flex items-center justify-center">
          <LoginPage />
        </main>
        <footer className="py-4 border-t border-slate-900 bg-slate-950 text-center text-[11px] text-slate-500 font-mono">
          NER Logistics Intelligence Platform • Smart India Hackathon 2026
        </footer>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar (Persistent on Desktop, Drawer on Mobile) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setIsSidebarOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>

        {/* Command Center Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-slate-400">
              NER Logistics Intelligence Command Network
            </span>
            <span>•</span>
            <span>All 8 North Eastern States Active</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Ministry of Development of North Eastern Region (MDoNER)</span>
            <span>•</span>
            <span className="text-blue-400">SIH 2026</span>
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
