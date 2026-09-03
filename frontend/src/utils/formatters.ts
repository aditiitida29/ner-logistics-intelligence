export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m} mins`;
}

export function getRiskColorClass(level: string): string {
  switch (level.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    case 'HIGH':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'MODERATE':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'LOW':
    default:
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
}
