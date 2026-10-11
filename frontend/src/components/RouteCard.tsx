import type { RouteResult } from "../types/route";

interface RouteCardProps {
  route: RouteResult;
  index: number;
  selected: boolean;
  onSelect: () => void;
}

function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours} hr ${remaining} min` : `${hours} hr`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function RouteCard({ route, index, selected, onSelect }: RouteCardProps) {
  return (
    <button type="button" onClick={onSelect} className={`w-full rounded-2xl border p-4 text-left transition ${selected ? "border-cyan-400 bg-cyan-950/40" : "border-slate-800 bg-slate-900 hover:border-slate-600"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Route {index + 1}</p>
          <p className="mt-2 text-xl font-semibold text-white">{formatDuration(route.durationSeconds)}</p>
          <p className="mt-1 text-sm text-slate-400">{formatDistance(route.distanceMeters)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selected ? "bg-cyan-300 text-slate-950" : "bg-slate-800 text-slate-300"}`}>{selected ? "Selected" : "View route"}</span>
      </div>
      {route.notices.length > 0 && <p className="mt-3 text-xs text-amber-300">{route.notices.join(" ")}</p>}
    </button>
  );
}
