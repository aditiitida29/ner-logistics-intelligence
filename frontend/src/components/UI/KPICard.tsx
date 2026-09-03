import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  changeIndicator?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'indigo' | 'slate';
  subtitle?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  changeIndicator,
  isPositive = true,
  icon: Icon,
  variant = 'slate',
  subtitle,
  onClick
}) => {
  const borderStyles = {
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 bg-gradient-to-br from-slate-900/90 to-emerald-950/20',
    amber: 'border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-br from-slate-900/90 to-amber-950/20',
    rose: 'border-rose-500/20 hover:border-rose-500/40 bg-gradient-to-br from-slate-900/90 to-rose-950/20',
    blue: 'border-blue-500/20 hover:border-blue-500/40 bg-gradient-to-br from-slate-900/90 to-blue-950/20',
    indigo: 'border-indigo-500/20 hover:border-indigo-500/40 bg-gradient-to-br from-slate-900/90 to-indigo-950/20',
    slate: 'border-slate-800 hover:border-slate-700 bg-slate-900/80'
  };

  const iconStyles = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    slate: 'text-slate-300 bg-slate-800 border-slate-700'
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 sm:p-5 transition-all duration-200 shadow-lg backdrop-blur-sm ${borderStyles[variant]} ${onClick ? 'cursor-pointer transform hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">{value}</span>
            {changeIndicator && (
              <span className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {changeIndicator}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg border ${iconStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
