import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/types/track";
import type { Station } from "@/types/station";
import type { PersonalMix } from "@/services/api/discover.service";

export type HistoryEntry =
  | { type: "track"; item: Track; playedAt: string }
  | { type: "station"; item: Station; playedAt: string }
  | { type: "mix"; item: PersonalMix; playedAt: string };

interface HistoryStore {
  entries: HistoryEntry[];
  addTrack: (track: Track) => void;
  addStation: (station: Station) => void;
  addMix: (mix: PersonalMix) => void;
  getRecentTracks: () => Track[];
  getRecentStations: () => Station[];
}

const MAX_ENTRIES = 50;

function dedupeAndPrepend(entries: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const filtered = entries.filter(
    (e) => !(e.type === entry.type && e.item.id === entry.item.id),
  );
  return [entry, ...filtered].slice(0, MAX_ENTRIES);
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addTrack: (track) =>
        set((s) => ({
          entries: dedupeAndPrepend(s.entries, {
            type: "track",
            item: track,
            playedAt: new Date().toISOString(),
          }),
        })),

      addStation: (station) =>
        set((s) => ({
          entries: dedupeAndPrepend(s.entries, {
            type: "station",
            item: station,
            playedAt: new Date().toISOString(),
          }),
        })),

      addMix: (mix) =>
        set((s) => ({
          entries: dedupeAndPrepend(s.entries, {
            type: "mix",
            item: mix,
            playedAt: new Date().toISOString(),
          }),
        })),

      getRecentTracks: () =>
        get()
          .entries.filter((e) => e.type === "track")
          .map((e) => (e as { type: "track"; item: Track; playedAt: string }).item),

      getRecentStations: () =>
        get()
          .entries.filter((e) => e.type === "station")
          .map((e) => (e as { type: "station"; item: Station; playedAt: string }).item),
    }),
    { name: "rythmify-history" },
  ),
);
