import { useState, useEffect, useRef } from "react";
import { PERIOD_LABELS } from "./insights.types";
import type { Period } from "./insights.types";

interface Props {
  period: Period;
  onChange: (p: Period) => void;
}

export function InsightsPeriodDropdown({ period, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a1a1a] border border-[#333] text-text-hover text-sm font-semibold hover:border-[#555] transition-colors cursor-pointer"
        data-test="insights-period-btn"
      >
        {PERIOD_LABELS[period]}
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="currentColor"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-44 bg-[#212121] rounded-lg shadow-xl overflow-hidden"
          data-test="insights-period-dropdown"
        >
          {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors cursor-pointer ${
                period === key ? "text-white font-bold" : "text-text-hover hover:bg-[#2a2a2a]"
              }`}
              data-test={`insights-period-${key}`}
            >
              {label}
              {period === key && (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
