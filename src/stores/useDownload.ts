import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/types/track";
import { getOfflineDownloadUrl } from "@/services/offline.service";
import { toast } from "sonner";

interface DownloadStore {
  downloadedTracks: Track[];
  downloading: Record<string, boolean>; // trackId → loading state
  isDownloaded: (id: string) => boolean;
  isDownloading: (id: string) => boolean;
  toggleDownload: (track: Track) => Promise<void>;
}

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      downloadedTracks: [],
      downloading: {},

      isDownloaded: (id: string) =>
        get().downloadedTracks.some((t) => t.id === id),

      isDownloading: (id: string) => !!get().downloading[id],

      toggleDownload: async (track: Track) => {
        const already = get().isDownloaded(track.id);

        // ── Remove ──────────────────────────────────────────
        if (already) {
          set((s) => ({
            downloadedTracks: s.downloadedTracks.filter(
              (t) => t.id !== track.id,
            ),
          }));
          toast.success(`"${track.title}" removed from downloads`);
          return;
        }

        // ── Download: validate with backend first ────────────
        set((s) => ({
          downloading: { ...s.downloading, [track.id]: true },
        }));

        try {
          await getOfflineDownloadUrl(track.id);

          // Backend confirmed entitlement — mark as downloaded
          set((s) => ({
            downloadedTracks: [...s.downloadedTracks, track],
            downloading: { ...s.downloading, [track.id]: false },
          }));

          toast.success(`"${track.title}" saved for offline listening`);
        } catch (err: any) {
          set((s) => ({
            downloading: { ...s.downloading, [track.id]: false },
          }));

          const code = err?.response?.data?.error?.code;
          const message = err?.response?.data?.error?.message;

          if (err?.response?.status === 403) {
            toast.error(
              message ?? "Upgrade to Premium to download tracks offline",
            );
          } else if (err?.response?.status === 202) {
            toast.error("Track is still processing, try again shortly");
          } else {
            toast.error(message ?? "Failed to download track");
          }
        }
      },
    }),
    {
      name: "downloaded-tracks",
      // Only persist the track list — not the transient loading state
      partialize: (s) => ({ downloadedTracks: s.downloadedTracks }),
    },
  ),
);
