import { useState } from "react";
import TrackCard from "@/components/UI/card/Card";
import type { Track } from "@/types/track";
import { usePlayerStore } from "@/stores/player.store";
import { useLikesViewStore } from "@/stores/likesView.store";

// ─── Constants ────────────────────────────────────────────

const CARD_WIDTH = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]";

// ─── List Item ────────────────────────────────────────────

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

function ListItem({ track }: { track: Track }) {
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTrack?.id === track.id) togglePlay();
    else setTrack(track);
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#2a2a2a] group cursor-pointer hover:bg-[#1a1a1a] px-2 rounded-md transition-colors">
      <div className="relative w-14 h-14 shrink-0 rounded-md overflow-hidden bg-input-bg">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-200"
        />
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <i
            className={`fa-sharp fa-solid ${isThisTrackPlaying ? "fa-pause" : "fa-play"} text-white text-sm pl-0.5`}
          />
        </button>
      </div>

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className="text-white text-sm font-semibold truncate">{track.title}</p>
        <p className="text-gray-400 text-xs truncate">{track.artistName}</p>
      </div>

      <div className="flex items-center gap-4 text-gray-400 text-xs shrink-0">
        <span className="flex items-center gap-1">
          <i className="fa-solid fa-play text-[10px]" />
          {formatCount(track.playCount)}
        </span>
        <span className="flex items-center gap-1">
          <i className="fa-solid fa-heart text-[10px]" />
          {formatCount(track.likeCount)}
        </span>
        <span className="hidden sm:block">{track.duration}</span>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────

interface LikesContentProps {
  tracks: Track[];
  /** Show the view toggle + filter bar. True on the Likes page, false in Overview. */
  showControls?: boolean;
  /** Limit how many tracks to render (used by Overview). */
  maxItems?: number;
}

// ─── Component ────────────────────────────────────────────

export default function LikesContent({
  tracks,
  showControls = true,
  maxItems,
}: LikesContentProps) {
  const { view, setView } = useLikesViewStore();
  const [filter, setFilter] = useState("");

  const filtered = filter.trim()
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(filter.toLowerCase()) ||
          t.artistName.toLowerCase().includes(filter.toLowerCase()),
      )
    : tracks;

  const displayed = maxItems ? filtered.slice(0, maxItems) : filtered;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between">
          <p className="text-white text-sm font-semibold">
            Hear the tracks you've liked:
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setView("grid")}
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                  view === "grid"
                    ? "bg-accent text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                data-test="likes-view-grid"
              >
                <i className="fa-solid fa-grid-2 text-xs" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                  view === "list"
                    ? "bg-accent text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                data-test="likes-view-list"
              >
                <i className="fa-solid fa-list text-xs" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-input-bg text-white text-sm placeholder-gray-500 rounded px-3 py-1.5 w-40 focus:outline-none focus:ring-1 focus:ring-gray-600"
              data-test="likes-filter"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {displayed.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-white font-bold text-2xl">
            {filter ? "No results found." : "You have no likes yet."}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="flex flex-wrap gap-6">
          {displayed.map((track) => (
            <TrackCard key={track.id} track={track} widthClassName={CARD_WIDTH} />
          ))}
          {maxItems &&
            Array.from({ length: Math.max(0, maxItems - displayed.length) }).map((_, i) => (
              <div key={`empty-${i}`} className={`flex flex-col ${CARD_WIDTH}`}>
                <div className="w-full aspect-square rounded-md bg-input-bg" />
              </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col">
          {displayed.map((track) => (
            <ListItem key={track.id} track={track} />
          ))}
        </div>
      )}
    </div>
  );
}
