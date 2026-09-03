import React from 'react';

export const MapLegend: React.FC<{ isCompact?: boolean }> = ({ isCompact = false }) => {
  const items = [
    { label: 'Accessible (Score >80%)', color: 'bg-emerald-500' },
    { label: 'Caution / Delay', color: 'bg-amber-500' },
    { label: 'High Risk Corridor', color: 'bg-orange-500' },
    { label: 'Blocked / Critical Incident', color: 'bg-rose-500' },
    { label: 'Emergency Corridor', color: 'bg-blue-500' },
  ];

  if (isCompact) {
    return (
      <div className="flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-md shadow-lg">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${it.color}`} />
            <span>{it.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-[400] p-3 rounded-xl bg-slate-900/95 border border-slate-800 text-xs shadow-2xl backdrop-blur-md max-w-xs pointer-events-auto">
      <p className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-2">GIS Corridor Legend</p>
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 text-slate-300 text-[11px]">
            <span className={`h-2.5 w-2.5 rounded-full ${it.color} shrink-0`} />
            <span>{it.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
        Markers: 🚨 Incidents | 🚚 Vehicles | 🏛 Districts
      </div>
    </div>
  );
};
