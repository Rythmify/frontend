import type { Track } from "@/services/api/upload/track.service";
import type { Period, Metric } from "./insights.types";

export function getBarCount(period: Period): number {
  return { today: 24, "7d": 7, "30d": 30, "12m": 12, all: 12 }[period];
}

export function getBarLabels(period: Period): string[] {
  const now = new Date();
  const n = getBarCount(period);

  if (period === "today") {
    return Array.from({ length: n }, (_, i) => (i % 6 === 0 ? `${i}:00` : ""));
  }
  if (period === "7d") {
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (n - 1 - i));
      return d.toLocaleDateString("en", { weekday: "short" });
    });
  }
  if (period === "30d") {
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (n - 1 - i));
      return i % 5 === 0
        ? d.toLocaleDateString("en", { month: "short", day: "2-digit" })
        : "";
    });
  }
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (n - 1 - i));
    return d.toLocaleDateString("en", { month: "short" });
  });
}

export function generateBars(tracks: Track[], period: Period, metric: Metric): number[] {
  const total = tracks.reduce((s, t) => {
    if (metric === "plays") return s + (t.play_count ?? 0);
    if (metric === "likes") return s + (t.like_count ?? 0);
    if (metric === "comments") return s + (t.comment_count ?? 0);
    if (metric === "reposts") return s + (t.repost_count ?? 0);
    return s;
  }, 0);

  const n = getBarCount(period);
  if (total === 0) return Array(n).fill(0);

  const seed = tracks.reduce((s, t) => s + t.id.charCodeAt(0), 1);
  const weights = Array.from({ length: n }, (_, i) => {
    const progress = i / n;
    const recency = progress > 0.55 ? 1 + (progress - 0.55) * 4 : 1;
    const noise = Math.abs(Math.sin(i * 131.7 + seed * 0.41));
    return recency * (0.15 + noise * 0.85);
  });

  const sum = weights.reduce((s, w) => s + w, 0);
  const values = weights.map(w => Math.round((w / sum) * total));
  const drift = total - values.reduce((s, v) => s + v, 0);
  values[values.length - 1] += drift;

  return values;
}
