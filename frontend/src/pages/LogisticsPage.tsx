import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Delivery } from '../types';
import { Badge } from '../components/UI/Badge';
import {
  PackageCheck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  X
} from 'lucide-react';

export const LogisticsPage: React.FC = () => {
  const { addToast, setCurrentPage, setInspectedVehicleId } = useApp();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [commodityFilter, setCommodityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Selected delivery modal
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  // New Delivery Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCommodity, setNewCommodity] = useState('Essential Medicines');
  const [newOrigin, setNewOrigin] = useState('Guwahati');
  const [newDestination, setNewDestination] = useState('Imphal');
  const [newPriority, setNewPriority] = useState<'Normal' | 'High' | 'Emergency'>('High');
  const [newEta, setNewEta] = useState('Today, 20:00');
  const [newNotes, setNewNotes] = useState('Critical dispatch for state hospital reserves.');

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await api.getDeliveries();
      setDeliveries(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load supply deliveries.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createDelivery({
        commodity: newCommodity,
        origin: newOrigin,
        destination: newDestination,
        priority: newPriority,
        eta: newEta,
        notes: newNotes
      });
      addToast(`Delivery mission ${created.delivery_code} created successfully!`, 'success');
      setShowNewModal(false);
      loadDeliveries();
    } catch (err: any) {
      console.error(err);
      addToast('Failed to create delivery mission.', 'error');
    }
  };

  const filtered = deliveries.filter(d => {
    const matchesComm = commodityFilter === 'All' || d.commodity.toLowerCase().includes(commodityFilter.toLowerCase());
    const matchesStat = statusFilter === 'All' || d.status === statusFilter;
    const matchesPrio = priorityFilter === 'All' || d.priority === priorityFilter;
    const matchesSearch = !search ||
      d.delivery_code.toLowerCase().includes(search.toLowerCase()) ||
      d.origin.toLowerCase().includes(search.toLowerCase()) ||
      d.destination.toLowerCase().includes(search.toLowerCase()) ||
      d.commodity.toLowerCase().includes(search.toLowerCase());
    return matchesComm && matchesStat && matchesPrio && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Essential Supplies & Logistics Mission Management
            </h1>
            <Badge variant="info" size="sm">Gov Supply Chain</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking essential medicines, FCI food grain convoys, relief baby formula, and disaster emergency kits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Create Delivery Mission</span>
          </button>
          <button
            onClick={loadDeliveries}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search code, commodity, destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Commodity Filter */}
        <select
          value={commodityFilter}
          onChange={(e) => setCommodityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5"
        >
          <option value="All">All Commodities</option>
          <option value="Medicine">Medicines & Vaccines</option>
          <option value="Rice">Rice & Grains</option>
          <option value="Food">Food Supplies</option>
          <option value="Relief">Relief Kits</option>
          <option value="Petroleum">Petroleum Tankers</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5"
        >
          <option value="All">All Statuses</option>
          <option value="In Transit">In Transit</option>
          <option value="Delayed">Delayed</option>
          <option value="At Risk">At Risk</option>
          <option value="Delivered">Delivered</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5"
        >
          <option value="All">All Priorities</option>
          <option value="Emergency">Emergency</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
        </select>
      </div>

      {/* Deliveries Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="px-4 py-3">Delivery ID</th>
                <th className="px-4 py-3">Commodity</th>
                <th className="px-4 py-3">Route Sector</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">ETA</th>
                <th className="px-4 py-3">Risk Index</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelectedDelivery(d)}
                  className="hover:bg-slate-800/50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 font-mono font-bold text-blue-400">{d.delivery_code}</td>
                  <td className="px-4 py-3 font-semibold text-slate-200">{d.commodity}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{d.origin} → {d.destination}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{d.vehicle_number || 'Unassigned'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={d.priority === 'Emergency' ? 'emergency' : (d.priority === 'High' ? 'highRisk' : 'neutral')} size="sm">
                      {d.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">{d.eta}</td>
                  <td className="px-4 py-3 font-mono">
                    <span className={`font-bold ${d.risk_score > 50 ? 'text-rose-400' : (d.risk_score > 25 ? 'text-amber-400' : 'text-emerald-400')}`}>
                      {d.risk_score}/100
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={d.status === 'Delivered' ? 'accessible' : (d.status === 'Delayed' ? 'caution' : (d.status === 'At Risk' ? 'blocked' : 'info'))} size="sm">
                      {d.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDelivery(d);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition text-[11px]"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Details Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">{selectedDelivery.delivery_code}</span>
                <h3 className="text-base font-extrabold text-white">{selectedDelivery.commodity}</h3>
              </div>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400">Sector</p>
                  <p className="font-bold text-slate-200">{selectedDelivery.origin} → {selectedDelivery.destination}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Assigned Convoy</p>
                  <p className="font-mono font-bold text-slate-200">{selectedDelivery.vehicle_number || 'Dedicated Escort'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Priority Level</p>
                  <p className="font-bold text-emerald-400">{selectedDelivery.priority}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Target ETA</p>
                  <p className="font-mono text-slate-200">{selectedDelivery.eta}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-300 mb-1">Operational Protocol Notes</p>
                <p className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-400 leading-relaxed">
                  {selectedDelivery.notes || 'Life-saving consignment authorized by State Logistics Directorate.'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedDelivery(null);
                    setCurrentPage('route-intel');
                  }}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
                >
                  Analyze Alternate Route
                </button>
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Delivery Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white">Create New Logistics Mission</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDelivery} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cargo / Commodity</label>
                <input
                  type="text"
                  required
                  value={newCommodity}
                  onChange={(e) => setNewCommodity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Origin Hub</label>
                  <input
                    type="text"
                    required
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Destination Hub</label>
                  <input
                    type="text"
                    required
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency Lifeline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target ETA</label>
                  <input
                    type="text"
                    required
                    value={newEta}
                    onChange={(e) => setNewEta(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mission Directives</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-white transition shadow-lg mt-2"
              >
                Dispatch Supply Mission
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
