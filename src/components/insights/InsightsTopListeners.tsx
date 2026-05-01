import { PERIOD_LABELS } from "./insights.types";
import type { Period } from "./insights.types";

interface Props {
  period: Period;
}

export function InsightsTopListeners({ period }: Props) {
  return (
    <div className="bg-[#111] rounded-xl p-5 relative overflow-hidden" data-test="insights-top-listeners">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-bold">Top listeners</h3>
        <button type="button" className="flex items-center gap-1 text-text text-xs cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          See all
        </button>
      </div>
      <p className="text-text text-xs mb-4">{PERIOD_LABELS[period]}</p>

      <div className="flex flex-col gap-3 blur-sm pointer-events-none select-none" aria-hidden>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-text text-xs w-4 text-right">{i}</span>
            <div className="w-9 h-9 rounded-full bg-[#2a2a2a]" />
            <div className="flex-1 h-3 bg-[#2a2a2a] rounded" style={{ width: `${70 - i * 8}%` }} />
            <div className="w-8 h-3 bg-[#2a2a2a] rounded" />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#555] mb-2" fill="currentColor">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
        </svg>
        <p className="text-white text-sm font-bold">Artist Pro</p>
        <p className="text-text text-xs mt-0.5">Coming Soon</p>
      </div>
    </div>
  );
}
