import { useState } from "react";
import { useHistoryStore } from "@/stores/history.store";
import TrackCard from "@/components/UI/card/Card";
import StationCard from "@/components/UI/StationCard/StationCard";
import MadeForYouCard from "@/components/UI/MadeForYouCard/MadeForYouCard";
import WaveformTrackCard from "@/components/track/TrackCard";
import type { PersonalMix } from "@/services/api/discover.service";
import type { MadeForYouItem } from "@/components/UI/MadeForYouCard/MadeForYouCard";

// ─── Constants ────────────────────────────────────────────

const CARD_WIDTH = "w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px]";

// ─── Helpers ──────────────────────────────────────────────

function mixToCard(mix: PersonalMix): MadeForYouItem {
  const words = (mix.label ?? "").trim().split(/\s+/);
  return {
    id: mix.id,
    title: mix.label ?? "",
    subtitle:
      mix.flavor === "listening_history"
        ? "Based on listening history"
        : "Based on your taste",
    coverUrl: mix.cover_image ?? "https://picsum.photos/200/200?random=99",
    badgeWords: [
      (words[0] ?? "MIX").toUpperCase(),
      (words[1] ?? "1").toUpperCase(),
    ],
    badgeBg: mix.flavor === "listening_history" ? "#1a237e" : "#1b5e20",
  };
}

// ─── Page ─────────────────────────────────────────────────

export default function HistoryPage() {
  const { entries, clearHistory } = useHistoryStore();
  const [filter, setFilter] = useState("");

  const q = filter.trim().toLowerCase();

  const recentFiltered = entries.filter((e) => {
    if (!q) return true;
    if (e.type === "track")
      return (
        e.item.title.toLowerCase().includes(q) ||
        e.item.artistName.toLowerCase().includes(q)
      );
    if (e.type === "station") return e.item.name.toLowerCase().includes(q);
    if (e.type === "mix") return (e.item.label ?? "").toLowerCase().includes(q);
    return true;
  });

  const tracksFiltered = recentFiltered
    .filter((e) => e.type === "track")
    .map((e) => (e as Extract<typeof e, { type: "track" }>).item);

  return (
    <div className="flex flex-col gap-10" data-test="history-page">
      {/* ── Recently played ─────────────────────────────────── */}
      <div className="flex flex-col gap-4" data-test="history-recently-played">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-white font-semibold text-[19px]"
            data-test="history-recently-played-title"
          >
            Recently played:
          </h2>
          <div className="flex items-center gap-3">
            <button
              data-test="history-clear-all"
              onClick={clearHistory}
              className="text-white text-sm font-semibold cursor-pointer hover:opacity-70 transition-opacity"
            >
              Clear all history
            </button>
            <input
              data-test="history-filter"
              type="text"
              placeholder="Filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-input-bg text-white text-sm placeholder-gray-500 rounded px-3 py-2 w-52 focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
          </div>
        </div>

        {/* Cards row */}
        {recentFiltered.length === 0 ? (
          <p
            className="text-text-secondary text-sm py-6"
            data-test="history-empty"
          >
            {filter ? "No results found." : "You haven't played anything yet."}
          </p>
        ) : (
          <div
            className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide"
            data-test="history-recently-played-cards"
          >
            {recentFiltered.map((entry, i) => {
              if (entry.type === "track")
                return (
                  <TrackCard
                    key={`track-${entry.item.id}`}
                    track={entry.item}
                    widthClassName={CARD_WIDTH}
                    contextQueue={tracksFiltered}
                  />
                );
              if (entry.type === "station")
                return (
                  <StationCard
                    key={`station-${entry.item.id}`}
                    station={entry.item}
                    widthClassName={CARD_WIDTH}
                    colorIndex={i}
                  />
                );
              if (entry.type === "mix")
                return (
                  <MadeForYouCard
                    key={`mix-${entry.item.id}`}
                    item={mixToCard(entry.item)}
                    widthClassName={CARD_WIDTH}
                  />
                );
              return null;
            })}
          </div>
        )}
      </div>

      {/* ── Tracks played ───────────────────────────────────── */}
      {tracksFiltered.length > 0 && (
        <div
          className="flex flex-col gap-4"
          data-test="history-tracks-played"
        >
          <h2
            className="text-white font-semibold text-[19px]"
            data-test="history-tracks-played-title"
          >
            Hear the tracks you've played:
          </h2>
          <div
            className="flex flex-col"
            data-test="history-tracks-played-list"
          >
            {tracksFiltered.map((track) => (
              <WaveformTrackCard key={track.id} track={track} contextQueue={tracksFiltered} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
