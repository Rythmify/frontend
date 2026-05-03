export type InsightsTab = "Rythmify" | "All Platforms" | "Fans";

interface Props {
  active: InsightsTab;
  onChange: (tab: InsightsTab) => void;
}

const TABS: { key: InsightsTab; badge?: React.ReactNode }[] = [
  { key: "Rythmify" },
  {
    key: "All Platforms",
    badge: (
      <span className="text-[15px] font-bold text-text-hover px-1.5 py-0.5 leading-none">
        Coming soon
      </span>
    ),
  },
  {
    key: "Fans",
    badge: (
      <>
        <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-sm leading-none">
          NEW
        </span>
        <span className="text-[15px] font-bold text-text-hover px-0.5 py-0.5 leading-none">
          Coming soon
        </span>
      </>
    ),
  },
];

export function InsightsTabs({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-4 md:gap-6 mb-6 overflow-x-auto scrollbar-hide">
      {TABS.map(({ key, badge }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`shrink-0 flex items-center gap-2 pb-3 text-base md:text-lg tracking-tighter font-semibold transition-colors cursor-pointer border-b-2 ${
            active === key
              ? "border-white text-white"
              : "border-transparent text-text hover:text-text-hover"
          }`}
          data-test={`insights-tab-${key.toLowerCase().replace(" ", "-")}`}
        >
          {key}
          {badge}
        </button>
      ))}
    </div>
  );
}
