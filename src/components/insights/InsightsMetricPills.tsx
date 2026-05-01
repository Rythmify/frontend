import type { Metric } from "./insights.types";

interface PillItem {
  key: Metric;
  label: string;
  value: number;
  icon: React.ReactNode;
}

interface Props {
  metrics: PillItem[];
  active: Metric;
  onSelect: (m: Metric) => void;
}

export function InsightsMetricPills({ metrics, active, onSelect }: Props) {
  return (
    <div className="flex items-center gap-2 mb-10 flex-wrap">
      {metrics.map(m => (
        <button
          key={m.key}
          type="button"
          onClick={() => onSelect(m.key)}
          data-test={`insights-metric-${m.key}`}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
            active === m.key
              ? "bg-white text-black"
              : "bg-[#1a1a1a] border border-[#333] text-text-hover hover:border-[#555]"
          }`}
        >
          {m.icon}
          {m.value.toLocaleString()} {m.label}
        </button>
      ))}
    </div>
  );
}
