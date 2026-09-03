import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Shield, Lock, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

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
      setCurrentPage('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoRole = (roleEmail: string, roleName: string) => {
    setEmail(roleEmail);
    setPassword('admin123');
    addToast(`${roleName} credentials selected (${roleEmail}). Click Sign In to proceed.`, 'info');
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
      if (res.user.role === 'driver') {
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-7 rounded-2xl border border-slate-800 bg-slate-900/95 p-7 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            NER Logistics Intelligence
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Government of India • Ministry of Development of North Eastern Region
          </p>
        </div>

        {/* 5 RBAC Roles Quick Switcher */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Role-Based Access Control (RBAC) Accounts</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Password: admin123</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Select an official role to experience how the interface dynamically adapts per permission level:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => directDemoLogin('admin@nerlogistics.gov.in')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/50 text-left transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white">Super Admin</p>
                <p className="text-[10px] text-slate-400 truncate">admin@nerlogistics.gov.in</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Full</span>
            </button>

            <button
              type="button"
              onClick={() => directDemoLogin('state@nerlogistics.gov.in')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/50 text-left transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white">State Admin</p>
                <p className="text-[10px] text-slate-400 truncate">state@nerlogistics.gov.in</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">State</span>
            </button>

            <button
              type="button"
              onClick={() => directDemoLogin('field@nerlogistics.gov.in')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-amber-950/40 border border-slate-700/80 hover:border-amber-500/50 text-left transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white">Field Officer</p>
                <p className="text-[10px] text-slate-400 truncate">field@nerlogistics.gov.in</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Field</span>
            </button>

            <button
              type="button"
              onClick={() => directDemoLogin('logistics@nerlogistics.gov.in')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-purple-950/40 border border-slate-700/80 hover:border-purple-500/50 text-left transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white">Logistics Operator</p>
                <p className="text-[10px] text-slate-400 truncate">logistics@nerlogistics.gov.in</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">Fleet</span>
            </button>

            <button
              type="button"
              onClick={() => directDemoLogin('driver@nerlogistics.gov.in')}
              className="sm:col-span-2 p-2 rounded-lg bg-slate-900 hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/50 text-left transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white">Driver (Highway Convoy)</p>
                <p className="text-[10px] text-slate-400 truncate">driver@nerlogistics.gov.in (AS-01-GC-4412)</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Driver Portal</span>
            </button>
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
                placeholder="officer@nerlogistics.gov.in"
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
            {loading ? 'Authenticating...' : 'Sign In to Command Center'}
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
