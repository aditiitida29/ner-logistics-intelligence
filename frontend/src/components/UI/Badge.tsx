import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accessible' | 'caution' | 'highRisk' | 'blocked' | 'emergency' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false
}) => {
  const variantStyles = {
    accessible: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    caution: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    highRisk: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    blocked: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    emergency: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  const dotStyles = {
    accessible: 'bg-emerald-400',
    caution: 'bg-amber-400',
    highRisk: 'bg-orange-400',
    blocked: 'bg-rose-400 animate-pulse',
    emergency: 'bg-blue-400 animate-pulse',
    info: 'bg-cyan-400',
    neutral: 'bg-slate-400'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
};
