import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Shield, Lock, Mail, CheckCircle2, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setUser, setCurrentPage, addToast } = useApp();
  const [email, setEmail] = useState('admin@nerlogistics.gov.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      addToast(`Welcome back, ${res.user.name}!`, 'success');
      if (res.user.role === 'normal_user') {
        setCurrentPage('user-dashboard');
      } else if (res.user.role === 'driver') {
        setCurrentPage('driver-portal');
      } else {
        setCurrentPage('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const directDemoLogin = async (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('admin123');
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(roleEmail, 'admin123');
      setUser(res.user);
      addToast(`Authenticated as ${res.user.name} (${res.user.role.toUpperCase()})!`, 'success');
      if (res.user.role === 'normal_user') {
        setCurrentPage('user-dashboard');
      } else if (res.user.role === 'driver') {
        setCurrentPage('driver-portal');
      } else if (res.user.role === 'field_officer') {
        setCurrentPage('incidents');
      } else {
        setCurrentPage('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            NER Logistics & Landslide Intelligence
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Government of India • Ministry of Development of North Eastern Region
          </p>
        </div>

        {/* 2 Connected Primary User Roles Section */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Select Role (1-Click Instant Demo Login)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Password: admin123</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Super Admin Primary Card */}
            <button
              type="button"
              onClick={() => directDemoLogin('admin@nerlogistics.gov.in')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-blue-950/50 border-2 border-blue-500/60 hover:border-blue-400 text-left transition shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-black text-white group-hover:text-blue-300 transition flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-blue-400" />
                    <span>SUPER ADMIN</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-mono font-bold">
                    Full Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Create, edit, resolve landslides, manage emergency corridors & full command center.
                </p>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-2 pt-1 border-t border-slate-800 truncate">
                admin@nerlogistics.gov.in
              </p>
            </button>

            {/* Normal User Primary Card */}
            <button
              type="button"
              onClick={() => directDemoLogin('citizen@nerlogistics.gov.in')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-emerald-950/50 border-2 border-emerald-500/60 hover:border-emerald-400 text-left transition shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-black text-white group-hover:text-emerald-300 transition flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>NORMAL USER</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-mono font-bold">
                    Commuter
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Public dashboard, live GIS map, real-time landslide alerts & detailed hazard inspection.
                </p>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-2 pt-1 border-t border-slate-800 truncate">
                citizen@nerlogistics.gov.in
              </p>
            </button>
          </div>

          {/* Secondary supporting demo accounts */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              Supporting Operational Roles:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => directDemoLogin('state@nerlogistics.gov.in')}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left text-[10px] text-slate-300 transition truncate"
                title="State Logistics Director"
              >
                State Admin
              </button>
              <button
                type="button"
                onClick={() => directDemoLogin('field@nerlogistics.gov.in')}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left text-[10px] text-slate-300 transition truncate"
                title="Field Incident Officer"
              >
                Field Officer
              </button>
              <button
                type="button"
                onClick={() => directDemoLogin('logistics@nerlogistics.gov.in')}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left text-[10px] text-slate-300 transition truncate"
                title="Fleet Dispatch Operator"
              >
                Logistics Op.
              </button>
              <button
                type="button"
                onClick={() => directDemoLogin('driver@nerlogistics.gov.in')}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left text-[10px] text-slate-300 transition truncate"
                title="Highway Convoy Driver"
              >
                Driver Portal
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Official Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="officer@nerlogistics.gov.in or citizen@nerlogistics.gov.in"
              />
              <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Secure Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-bold text-sm transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500">
          Encrypted Gov-Grade Session • Smart India Hackathon 2026
        </div>
      </div>
    </div>
  );
};
