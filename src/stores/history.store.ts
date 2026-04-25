import { create } from "zustand";
import { persist } from "zustand/middleware";
import { writeListeningHistory } from "@/services/api/discover.service";
import type { Track } from "@/types/track";
import type { Station } from "@/types/station";
import type { PersonalMix } from "@/services/api/discover.service";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import type { BuzzingPlaylist } from "@/components/UI/GenreCard/GenreCard";
import type { MadeForYouItem } from "@/components/UI/MadeForYouCard/MadeForYouCard";

export type HistoryEntry =
  | { type: "track"; item: Track; playedAt: string }
  | { type: "station"; item: Station; playedAt: string }
  | { type: "mix"; item: PersonalMix; playedAt: string }
  | { type: "playlist"; item: PlaylistCardData; playedAt: string }
  | { type: "genre"; item: BuzzingPlaylist; playedAt: string }
  | { type: "madeForYou"; item: MadeForYouItem; playedAt: string };

interface HistoryStore {
  entries: HistoryEntry[];
  addTrack: (track: Track) => void;
  addStation: (station: Station) => void;
  addMix: (mix: PersonalMix) => void;
  addPlaylist: (playlist: PlaylistCardData) => void;
  addGenre: (genre: BuzzingPlaylist) => void;
  addMadeForYou: (item: MadeForYouItem) => void;
  clearHistory: () => Promise<void>;
  hydrateFromBackend: () => Promise<void>;
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

      addTrack: (track) => {
        const playedAt = new Date().toISOString();
        set((s) => ({
          entries: dedupeAndPrepend(s.entries, {
            type: "track",
            item: track,
            playedAt,
          }),
        }));
        writeListeningHistory(String(track.id)).catch(() => {
          // best-effort — don't surface errors to the user
        });
      },

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

      addPlaylist: (playlist) =>
        set((s) => ({
          entries: dedupeAndPrepend(s.entries, {
            type: "playlist",
            item: playlist,
            playedAt: new Date().toISOString(),
          }),
        })),

      addGenre: (genre) =>
        set((s) => ({
          entries: dedupeAndPrepend(s.entries, {
            type: "genre",
            item: genre,
            playedAt: new Date().toISOString(),
          }),
        })),

      addMadeForYou: (item) =>
        set((s) => ({
          entries: dedupeAndPrepend(s.entries, {
            type: "madeForYou",
            item,
            playedAt: new Date().toISOString(),
          }),
        })),

      clearHistory: async () => {
        set({ entries: [] });
        const { default: axiosInstance } = await import("@/services/api/axiosInstance");
        try {
          await axiosInstance.delete("/me/history");
        } catch (e) {
          console.error("Failed to clear backend history", e);
        }
      },

      hydrateFromBackend: async () => {
        try {
          const { getListeningHistory } = await import("@/services/api/discover.service");
          const { mapListeningHistoryEntry } = await import("@/services/api/discover.mapper");
          const res = await getListeningHistory({ limit: 50 });
          
          if (res && res.data) {
            const backendEntries: HistoryEntry[] = res.data.map(entry => {
              const mapped = mapListeningHistoryEntry(entry);
              return {
                type: "track",
                item: mapped,
                playedAt: mapped.playedAt
              };
            });

            set((s) => {
              // Merge local non-track entries with backend track entries
              const localNonTracks = s.entries.filter(e => e.type !== "track");
              const merged = [...backendEntries, ...localNonTracks]
                .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
                .slice(0, MAX_ENTRIES);
              
              return { entries: merged };
            });
          }
        } catch (e) {
          console.error("Failed to hydrate history from backend", e);
        }
      },

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
