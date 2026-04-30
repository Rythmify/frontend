import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/types/track";
import { toast } from "sonner";

interface DownloadStore {
  downloadedTracks: Track[];
  isDownloaded: (id: string) => boolean;
  toggleDownload: (track: Track, isPro: boolean) => void;
}

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      downloadedTracks: [],

      isDownloaded: (id: string) =>
        get().downloadedTracks.some((t) => t.id === id),

      toggleDownload: (track: Track, isPro: boolean) => {
        if (!isPro) {
          toast.error(
            "Upgrade to Premium to download tracks for offline listening",
          );
          return;
        }

        const already = get().isDownloaded(track.id);

        if (already) {
          set((s) => ({
            downloadedTracks: s.downloadedTracks.filter(
              (t) => t.id !== track.id,
            ),
          }));
          toast.success(`"${track.title}" removed from downloads`);
        } else {
          set((s) => ({
            downloadedTracks: [...s.downloadedTracks, track],
          }));
          toast.success(`"${track.title}" saved for offline listening`);
        }
      },
    }),
    {
      name: "downloaded-tracks",
      partialize: (s) => ({ downloadedTracks: s.downloadedTracks }),
    },
  ),
);
