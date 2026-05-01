import { useState, useEffect } from "react";
import { getMyTracks, type Track } from "@/services/api/upload/track.service";
import Spinner from "@/components/UI/Spinner";
import { InsightsEmptyState } from "@/components/insights/InsightsEmptyState";
import { InsightsTabs } from "@/components/insights/InsightsTabs";
import { InsightsPeriodDropdown } from "@/components/insights/InsightsPeriodDropdown";
import { InsightsMetricPills } from "@/components/insights/InsightsMetricPills";
import { InsightsChart } from "@/components/insights/InsightsChart";
import { InsightsTopTracks } from "@/components/insights/InsightsTopTracks";
import { InsightsTopListeners } from "@/components/insights/InsightsTopListeners";
import { InsightsAllPlatformsState } from "@/components/insights/InsightsAllPlatformsState";
import { InsightsFansState } from "@/components/insights/InsightsFansState";
import { PERIOD_SUFFIX } from "@/components/insights/insights.types";
import { generateBars, getBarLabels } from "@/components/insights/insights.helpers";
import type { Period, Metric } from "@/components/insights/insights.types";
import type { InsightsTab } from "@/components/insights/InsightsTabs";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";

const METRICS: { key: Metric; label: string; icon: React.ReactNode }[] = [
  {
    key: "plays", label: "plays",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
  },
  {
    key: "likes", label: "likes",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>,
  },
  {
    key: "comments", label: "comments",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>,
  },
  {
    key: "reposts", label: "reposts",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg>,
  },
  {
    key: "downloads", label: "downloads",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>,
  },
];

function getMetricTotal(tracks: Track[], metric: Metric): number {
  if (metric === "plays")    return tracks.reduce((s, t) => s + (t.play_count    ?? 0), 0);
  if (metric === "likes")    return tracks.reduce((s, t) => s + (t.like_count    ?? 0), 0);
  if (metric === "comments") return tracks.reduce((s, t) => s + (t.comment_count ?? 0), 0);
  if (metric === "reposts")  return tracks.reduce((s, t) => s + (t.repost_count  ?? 0), 0);
  return 0;
}

export default function InsightsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<InsightsTab>("Rythmify");
  const [period, setPeriod] = useState<Period>("30d");
  const [metric, setMetric] = useState<Metric>("plays");

  useEffect(() => {
    getMyTracks()
      .then(res => setTracks(res.data as unknown as Track[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const pillMetrics = METRICS.map(m => ({
    ...m,
    value: getMetricTotal(tracks, m.key),
  }));

  const chartBars = generateBars(tracks, period, metric);
  const barLabels = getBarLabels(period);
  const topTracks = [...tracks]
    .sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0))
    .slice(0, 5);

  function renderTabContent() {
    if (tab === "All Platforms") return <InsightsAllPlatformsState />;
    if (tab === "Fans") return <InsightsFansState />;

    // Rythmify tab
    return tracks.length === 0 ? (
      <InsightsEmptyState />
    ) : (
      <>
        <div className="mb-10">
          <h2 className="text-white font-extrabold text-5xl tracking-tighter">
            {getMetricTotal(tracks, metric).toLocaleString()}{" "}
            <span className="font-extrabold">{metric}</span>{" "}
            <span className="text-[#81C784] text-5xl font-extrabold">{PERIOD_SUFFIX[period]}</span>
          </h2>
        </div>

        <InsightsMetricPills metrics={pillMetrics} active={metric} onSelect={setMetric} />

        <InsightsChart bars={chartBars} labels={barLabels} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InsightsTopTracks tracks={topTracks} period={period} />
          <InsightsTopListeners period={period} />
        </div>
      </>
    );
  }

  return (
    <div className="container pt-6 pb-24 px-4 md:px-8 lg:px-12 xl:px-20" data-test="insights-page">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white font-extrabold text-4xl tracking-tight">Insights</h1>
        {tab === "Rythmify" && (
          <InsightsPeriodDropdown period={period} onChange={setPeriod} />
        )}
      </div>

      <InsightsTabs active={tab} onChange={setTab} />

      {renderTabContent()}

      <GuestPageFooter />
    </div>
  );
}
