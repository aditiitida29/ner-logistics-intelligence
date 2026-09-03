import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Search, X, Building2, Truck, AlertTriangle, PackageCheck, Navigation, ArrowRight } from 'lucide-react';
import { Badge } from './UI/Badge';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setCurrentPage, setInspectedVehicleId, setInspectedIncidentId, setInspectedDistrictId } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<{
    districts: any[];
    vehicles: any[];
    incidents: any[];
    deliveries: any[];
  }>({
    districts: [],
    vehicles: [],
    incidents: [],
    deliveries: []
  });
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  // Execute search across entities
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults({ districts: [], vehicles: [], incidents: [], deliveries: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [districts, vehicles, incidents, deliveries] = await Promise.all([
          api.getDistricts(undefined, searchTerm),
          api.getVehicles({ search: searchTerm }),
          api.getIncidents({ search: searchTerm }),
          api.getDeliveries({ search: searchTerm })
        ]);

        setResults({
          districts: districts.slice(0, 4),
          vehicles: vehicles.slice(0, 4),
          incidents: incidents.slice(0, 4),
          deliveries: deliveries.slice(0, 4)
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isSearchOpen) return null;

  const handleSelect = (page: string, entityType?: string, id?: number) => {
    if (entityType === 'vehicle' && id) setInspectedVehicleId(id);
    if (entityType === 'incident' && id) setInspectedIncidentId(id);
    if (entityType === 'district' && id) setInspectedDistrictId(id);
    setCurrentPage(page);
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const totalResults =
    results.districts.length +
    results.vehicles.length +
    results.incidents.length +
    results.deliveries.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search districts, vehicles (AS-01...), incidents, deliveries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="text-center py-6 text-xs text-slate-400">
              Searching NER logistics infrastructure...
            </div>
          )}

          {!loading && !searchTerm.trim() && (
            <div className="text-center py-8 text-xs text-slate-400">
              <p>Type keywords such as &quot;Guwahati&quot;, &quot;Landslide&quot;, &quot;Medicine&quot;, &quot;NH-13&quot;, or vehicle numbers.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {['Tawang', 'AS-01-GC-4412', 'Landslide', 'Cold-Chain Vaccines', 'Imphal'].map((quick) => (
                  <button
                    key={quick}
                    onClick={() => setSearchTerm(quick)}
                    className="px-2.5 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 hover:bg-blue-600 hover:text-white transition"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && searchTerm.trim() && totalResults === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching logistics entities found for &quot;{searchTerm}&quot;.
            </div>
          )}

          {/* Districts */}
          {results.districts.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Districts</p>
              <div className="space-y-1">
                {results.districts.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleSelect('districts', 'district', d.id)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-left transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-4 w-4 text-blue-400" />
                      <div>
                        <span className="text-xs font-semibold text-slate-200">{d.name}</span>
                        <span className="text-[11px] text-slate-400 ml-2">({d.state})</span>
                      </div>
                    </div>
                    <Badge variant={d.accessibility_score > 80 ? 'accessible' : 'caution'} size="sm">
                      {d.accessibility_score}% Acc.
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vehicles */}
          {results.vehicles.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Vehicles & Drivers</p>
              <div className="space-y-1">
                {results.vehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleSelect('vehicles', 'vehicle', v.id)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-left transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="h-4 w-4 text-emerald-400" />
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-200">{v.vehicle_number}</span>
                        <span className="text-[11px] text-slate-400 ml-2">• {v.driver} ({v.commodity})</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{v.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Incidents */}
          {results.incidents.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Active Incidents</p>
              <div className="space-y-1">
                {results.incidents.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => handleSelect('incidents', 'incident', i.id)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-left transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <div className="truncate max-w-md">
                        <span className="text-xs font-semibold text-slate-200">{i.type}: </span>
                        <span className="text-xs text-slate-400">{i.location_name}</span>
                      </div>
                    </div>
                    <Badge variant={i.severity === 'Critical' ? 'blocked' : 'caution'} size="sm">
                      {i.severity}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deliveries */}
          {results.deliveries.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Deliveries</p>
              <div className="space-y-1">
                {results.deliveries.map((dlv) => (
                  <button
                    key={dlv.id}
                    onClick={() => handleSelect('deliveries')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-left transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <PackageCheck className="h-4 w-4 text-amber-400" />
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-200">{dlv.delivery_code}</span>
                        <span className="text-xs text-slate-400 ml-2">• {dlv.commodity} ({dlv.origin} → {dlv.destination})</span>
                      </div>
                    </div>
                    <Badge variant={dlv.priority === 'Emergency' ? 'emergency' : 'neutral'} size="sm">
                      {dlv.priority}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 font-mono">ESC</kbd> to exit</span>
          <span>Click any item to inspect directly</span>
        </div>
      </div>
    </div>
  );
};
