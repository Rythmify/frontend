import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Track } from "@/types/track";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import {
  createUserScopedStorage,
  setUserScopedStorageOverride,
} from "@/stores/userScopedStorage";

interface DownloadStore {
  downloadedTracks: Track[];
  isDownloaded: (id: string) => boolean;
  toggleDownload: (track: Track, isPro: boolean) => void;
}

const createEmptyDownloadState = (): Pick<DownloadStore, "downloadedTracks"> => ({
  downloadedTracks: [],
});

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      ...createEmptyDownloadState(),

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
      storage: createJSONStorage(() => createUserScopedStorage("rythmify-downloads")),
      partialize: (s) => ({ downloadedTracks: s.downloadedTracks }),
    },
  ),
);

let downloadAuthSyncInitialized = false;

function initDownloadAuthSync() {
  if (downloadAuthSyncInitialized) return;
  downloadAuthSyncInitialized = true;

  useAuthStore.subscribe((state, prev) => {
    const nextScope = state.user?.id || state.user?.username || "guest";
    const prevScope = prev.user?.id || prev.user?.username || "guest";

    if (nextScope === prevScope) return;

    setUserScopedStorageOverride(`transient:${nextScope}`);
    useDownloadStore.setState(createEmptyDownloadState());
    setUserScopedStorageOverride(nextScope);
    void useDownloadStore.persist.rehydrate();
  });
}

initDownloadAuthSync();
