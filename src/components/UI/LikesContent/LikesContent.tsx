import { useState } from "react";
import GridTrackCard from "@/components/UI/card/Card";
import WaveformTrackCard from "@/components/track/TrackCard";
import type { Track } from "@/types/track";
import { useLikesViewStore } from "@/stores/likesView.store";

// ─── Props ────────────────────────────────────────────────

interface LikesContentProps {
  tracks: Track[];
  showControls?: boolean;
  maxItems?: number;
  widthClassName?: string;
}

// ─── Component ────────────────────────────────────────────

export default function LikesContent({ tracks, showControls = true, maxItems, widthClassName = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]" }: LikesContentProps) {
  const CARD_WIDTH = widthClassName;
  const { view, setView } = useLikesViewStore();
  const [filter, setFilter] = useState("");

  const filtered = filter.trim()
    ? tracks.filter(t =>
        t.title.toLowerCase().includes(filter.toLowerCase()) ||
        t.artistName.toLowerCase().includes(filter.toLowerCase()))
    : tracks;

  const displayed = maxItems ? filtered.slice(0, maxItems) : filtered;

  return (
    <div className="flex flex-col gap-6 w-full">
      {showControls && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-white text-sm sm:text-lg font-semibold shrink-0">Hear the tracks you've liked:</p>
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2">
              <div className="text-sm sm:text-base">View</div>
              <button onClick={() => setView("grid")}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded transition-colors ${view === "grid" ? "bg-input-bg text-accent" : "bg-input-bg text-text-secondary hover:text-white"}`}
                data-test="likes-view-grid">
                <i className="fa-solid fa-border-all text-sm sm:text-lg" />
              </button>
              <button onClick={() => setView("list")}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded transition-colors ${view === "list" ? "bg-input-bg text-accent" : "bg-input-bg text-text-secondary hover:text-white"}`}
                data-test="likes-view-list">
                <i className="fa-solid fa-list text-sm sm:text-lg" />
              </button>
            </div>
            <input type="text" placeholder="Filter" value={filter} onChange={(e) => setFilter(e.target.value)}
              className="bg-input-bg text-white text-sm placeholder-gray-500 rounded px-3 py-2 w-full sm:w-40 md:w-56 lg:w-80 focus:outline-none focus:ring-1 focus:ring-gray-600"
              data-test="likes-filter" />
          </div>
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-white font-bold text-lg sm:text-2xl">
            {filter ? "No results found." : "You have no likes yet."}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="flex flex-wrap gap-6">
          {displayed.map((track) => (
            <GridTrackCard key={track.id} track={track} widthClassName={CARD_WIDTH} />
          ))}
          {maxItems && Array.from({ length: Math.max(0, maxItems - displayed.length) }).map((_, i) => (
            <div key={`empty-${i}`} className={`flex flex-col ${CARD_WIDTH}`}>
              <div className="w-full aspect-square rounded-md bg-input-bg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col">
          {displayed.map((track) => (
            <WaveformTrackCard key={track.id} track={track} />
          ))}
        </div>
      )}
    </div>
  );
}
