export type Period = "today" | "7d" | "30d" | "12m" | "all";
export type Metric = "plays" | "likes" | "comments" | "reposts" | "downloads";

export const PERIOD_LABELS: Record<Period, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "12m": "Last 12 months",
  all: "All time",
};

export const PERIOD_SUFFIX: Record<Period, string> = {
  today: "today",
  "7d": "last 7 days",
  "30d": "last 30 days",
  "12m": "last 12 months",
  all: "since 2026",
};
