import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Track } from "../types/track";
import { useAuthStore } from "./auth.store";

// audioService imports this store, so we can't import it at the top level
// without creating a circular dependency. Dynamic import resolves this.
let _seekAudio: ((time: number) => void) | null = null;
function getSeekAudio() {
  if (!_seekAudio) {
    import("../services/audioService").then((m) => {
      _seekAudio = m.seekAudio;
    });
  }
  return _seekAudio;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedSave = (userId: string | undefined, state: any) => {
  if (!userId) return;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    import("../services/api/playback.service").then((m) => {
      m.savePlayerState({
        trackId: state.currentTrack?.id,
        positionSeconds: Math.floor(state.currentTime),
        volume: state.volume,
        queue: state.queue.map((t: any) => t.id),
      });
    });
  }, 2000); // 2 second debounce
};

interface PlayerState {
  // Current track
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;

  // Playback state
  isPlaying: boolean;
  currentTime: number;   // seconds
  duration: number;      // seconds
  volume: number;        // 0-1
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: "none" | "one" | "all";
  isLiked: boolean;

  // Actions
  setTrack: (track: Track, queue?: Track[], startTime?: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  seekTo: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: () => void;
  addToQueue: (track: Track) => void;
  reset: () => void;
  loadFromBackend: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      queueIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      isShuffle: false,
      repeatMode: "none",
      isLiked: false,

      setTrack: (track, queue, startTime) => {
        const newQueue = queue ?? get().queue;
        const index = newQueue.findIndex((t) => t.id === track.id);
        const isSameTrack = get().currentTrack?.id === track.id;

        if (isSameTrack) {
          // Keep the loaded audio, but merge in any missing metadata
          // such as playlist context so downstream UI can reflect the active source.
          set({
            currentTrack: {
              ...(get().currentTrack ?? track),
              ...track,
            },
            queue: newQueue,
            queueIndex: index >= 0 ? index : get().queueIndex,
            isPlaying: true,
            currentTime: startTime ?? get().currentTime,
          });
          return;
        }

        // New track - preserve currentTime only when coming from null state
        // (example hero waveform was interacted with before pressing play)
        // or if a startTime was explicitly provided.
        const isFromNullState = get().currentTrack === null;
        const nextTime = startTime ?? (isFromNullState ? get().currentTime : 0);

        set({
          currentTrack: track,
          queue: newQueue,
          queueIndex: index >= 0 ? index : 0,
          isPlaying: true,
          currentTime: nextTime,
          isLiked: false,
        });

        // Notify backend of play event
        import("../services/track.service").then((m) => {
          m.incrementPlayCount(track.id);
        });
      },

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

      next: () => {
        const { queue, queueIndex, isShuffle } = get();
        if (!queue.length) return;
        let nextIndex: number;
        if (isShuffle) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else {
          nextIndex = (queueIndex + 1) % queue.length;
        }
        set({
          currentTrack: queue[nextIndex],
          queueIndex: nextIndex,
          isPlaying: true,
          currentTime: 0,
        });
      },

      previous: () => {
        const { queue, queueIndex, currentTime } = get();
        if (!queue.length) return;
        // More than 3 seconds in? Restart the current track instead of going back.
        if (currentTime > 3) {
          get().seek(0);
          return;
        }
        const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
        set({
          currentTrack: queue[prevIndex],
          queueIndex: prevIndex,
          isPlaying: true,
          currentTime: 0,
        });
      },

      // Delegates to seekAudio so there is one canonical seek path.
      // Falls back to a store-only update if seekAudio isn't resolved yet.
      seek: (time) => {
        const seekFn = getSeekAudio();
        if (seekFn) {
          seekFn(time);
        } else {
          set({ currentTime: time });
        }
      },

      // seekTo: updates store currentTime only - doesnt touch isPlaying.
      // Use this when the audio element has already been seeked directly
      // (example WaveSurfer interaction, progress bar drag) so the subscriber
      // doesnt fire audio.play() and interrupt the seek.
      seekTo: (time) => {
        set({ currentTime: time });
      },

      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),

      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

      toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),

      toggleRepeat: () =>
        set((s) => ({
          repeatMode:
            s.repeatMode === "none"
              ? "all"
              : s.repeatMode === "all"
                ? "one"
                : "none",
        })),

      toggleLike: () => set((s) => ({ isLiked: !s.isLiked })),

      addToQueue: (track) =>
        set((s) => ({ queue: [...s.queue, track] })),

      reset: () =>
        set({
          currentTrack: null,
          queue: [],
          queueIndex: 0,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          isLiked: false,
        }),

      loadFromBackend: async () => {
        const { getPlayerState } = await import("../services/api/playback.service");
        const backendState = await getPlayerState();
        if (!backendState || !backendState.track_id) return;

        // Note: The backend returns metadata but we might want the full Track object.
        // For now, we construct a partial Track object from the returned metadata.
        const track: Track = {
          id: backendState.track_id,
          title: backendState.track_title || "",
          artistName: backendState.artist_name || "",
          audioUrl: backendState.stream_url || "",
          duration: backendState.duration?.toString() || "0",
          // The rest can be placeholders or retrieved via another service
          artistUsername: "",
          trackSlug: "",
          coverUrl: "",
        };

        set({
          currentTrack: track,
          currentTime: backendState.position_seconds,
          volume: backendState.volume,
          isPlaying: false,
        });
      },
    }),
    {
      name: "rythmify-player-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        queue: state.queue,
        queueIndex: state.queueIndex,
        currentTime: state.currentTime,
        volume: state.volume,
        isMuted: state.isMuted,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
      }),
      // Force isPlaying to false on hydration
      onRehydrateStorage: () => (state) => {
        if (state) state.isPlaying = false;
      },
    }
  )
);

// --- Sync Subscriptions ---

// 1. Save to backend on changes (debounced)
usePlayerStore.subscribe((state, prev) => {
  // We only want to save if the user is authenticated and something important changed.
  // Note: Saving currentTime on every second is too much. 
  // We save if the track changes, volume changes, queue changes, or every 5 seconds of playback.
  const trackChanged = state.currentTrack?.id !== prev.currentTrack?.id;
  const volumeChanged = state.volume !== prev.volume;
  const queueChanged = state.queue.length !== prev.queue.length;
  const progressStepped = Math.floor(state.currentTime / 5) !== Math.floor(prev.currentTime / 5);

  if (trackChanged || volumeChanged || queueChanged || progressStepped) {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated && user) {
      debouncedSave(user.id, state);
    }
  }
});

// 2. Load from backend on login
// This ensures that when a user signs in, their last saved state (across devices)
// overrides the current local guest/cached state.
useAuthStore.subscribe((state, prev) => {
  if (state.isAuthenticated && !prev.isAuthenticated) {
    usePlayerStore.getState().loadFromBackend();
  }
});
