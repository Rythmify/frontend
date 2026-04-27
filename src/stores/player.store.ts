import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Track } from "../types/track";
import { useAuthStore } from "./auth.store";
import { savePlayerState, getPlayerState } from "../services/api/playback.service";

// Debounced helper to avoid spamming the backend
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(userId: string, state: PlayerState) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    savePlayerState({
      trackId: state.currentTrack?.id,
      positionSeconds: state.currentTime,
      volume: state.volume,
      queue: state.queue.map((t) => t.id),
    });
  }, 2000);
}

// Dynamic import for audioService to avoid circular dependencies
let _seekAudio: ((time: number) => void) | null = null;
function getSeekAudio() {
  if (!_seekAudio) {
    import("../services/audioService").then((m) => {
      _seekAudio = m.seekAudio;
    });
  }
  return _seekAudio;
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: "none" | "one" | "all";
  isLiked: boolean;
  isAutoplay: boolean;

  // Actions
  setTrack: (track: Track, queue?: Track[], startTime?: number) => void;
  playContext: (sourceType: string, sourceId: string | null, fallbackTrack: Track, startTime?: number) => Promise<void>;
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
  toggleAutoplay: () => void;
  addToQueue: (track: Track) => void;
  addTracksToQueue: (tracks: Track[]) => void;
  addNextInQueue: (track: Track) => void;
  addTracksNext: (tracks: Track[]) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
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
      volume: 1,
      isMuted: false,
      isShuffle: false,
      repeatMode: "none",
      isLiked: false,
      isAutoplay: true,

      setTrack: (track, queue, startTime) => {
        const newQueue = queue ?? get().queue;
        const index = newQueue.findIndex((t) => t.id === track.id);
        const isSameTrack = get().currentTrack?.id === track.id;

        if (isSameTrack) {
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
      },

      playContext: async (sourceType, sourceId, fallbackTrack, startTime) => {
        // Optimistically play the track immediately
        set({
          currentTrack: fallbackTrack,
          queue: [fallbackTrack],
          queueIndex: 0,
          isPlaying: true,
          currentTime: startTime || 0
        });
        
        try {
          const { postQueueContext } = await import("../services/api/playback.service");
          const res = await postQueueContext({
            interaction_type: "play",
            source_type: sourceType,
            source_id: sourceId,
            target_user_id: null
          });
          
          if (res && res.queue) {
            // Map backend queue format to frontend Track[]
            const mappedQueue = res.queue.map(q => ({
               id: q.track_id || q.id,
               title: q.track_title || q.title || "Unknown Title",
               artistName: q.artist_name || q.artistName || "Unknown Artist",
               artistUsername: q.artist_username || q.artistUsername || "unknown",
               audioUrl: q.stream_url || q.audioUrl || "",
               coverUrl: q.cover_image || q.coverUrl || "",
               duration: String(q.duration || 0),
               waveformData: q.waveformData || [],
               playCount: q.playCount || 0,
               likeCount: q.likeCount || 0,
               repostCount: q.repostCount || 0,
               commentCount: q.commentCount || 0,
            } as Track));
            
            const qIndex = mappedQueue.findIndex(t => String(t.id) === String(fallbackTrack.id));
            
            set({
               queue: mappedQueue,
               queueIndex: Math.max(0, qIndex)
            });
          }
        } catch (e) {
          console.error("Failed to load context queue", e);
        }
      },

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

      next: () => {
        const { queue, queueIndex, isShuffle, isAutoplay, currentTrack } = get();
        
        if (queueIndex >= queue.length - 1 && isAutoplay && currentTrack) {
          import("../services/track.service").then(async (m) => {
            try {
              const { tracks } = await m.getRelatedTracks(String(currentTrack.id));
              if (tracks && tracks.length > 0) {
                const filtered = tracks.filter((t: Track) => !queue.some(q => q.id === t.id));
                if (filtered.length > 0) {
                   set((s) => ({ 
                     queue: [...s.queue, ...filtered],
                     currentTrack: filtered[0],
                     queueIndex: s.queueIndex + 1,
                     isPlaying: true,
                     currentTime: 0
                   }));
                   return;
                }
              }
            } catch (err) {
              console.error("Autoplay failed", err);
            }
            const nextIndex = isShuffle ? Math.floor(Math.random() * queue.length) : (queueIndex + 1) % queue.length;
            set({ currentTrack: queue[nextIndex], queueIndex: nextIndex, isPlaying: true, currentTime: 0 });
          });
          return;
        }

        if (!queue.length) return;
        let nextIndex: number;
        if (isShuffle) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else {
          // If we are at the end and repeat is none, just stop
          if (queueIndex >= queue.length - 1 && get().repeatMode === "none") {
            set({ isPlaying: false, currentTime: 0 });
            return;
          }
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

      seek: (time) => {
        const seekFn = getSeekAudio();
        if (seekFn) {
          seekFn(time);
        } else {
          set({ currentTime: time });
        }
      },

      seekTo: (time) => {
        set({ currentTime: time });
      },

      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
      toggleRepeat: () =>
        set((s) => {
          const modes: ("none" | "one" | "all")[] = ["none", "one", "all"];
          const current = modes.indexOf(s.repeatMode);
          return { repeatMode: modes[(current + 1) % modes.length] };
        }),

      toggleLike: () => set((s) => ({ isLiked: !s.isLiked })),
      toggleAutoplay: () => set((s) => ({ isAutoplay: !s.isAutoplay })),

      addToQueue: (track) =>
        set((s) => ({ queue: [...s.queue, track] })),

      addNextInQueue: (track) =>
        set((s) => {
          const next = s.queueIndex + 1;
          const newQueue = [
            ...s.queue.slice(0, next),
            track,
            ...s.queue.slice(next),
          ];
          return { queue: newQueue };
        }),

      addTracksToQueue: (tracks) =>
        set((s) => ({ queue: [...s.queue, ...tracks] })),

      addTracksNext: (tracks) =>
        set((s) => {
          const next = s.queueIndex + 1;
          const newQueue = [
            ...s.queue.slice(0, next),
            ...tracks,
            ...s.queue.slice(next),
          ];
          return { queue: newQueue };
        }),

      removeFromQueue: (index) =>
        set((s) => {
          const newQueue = s.queue.filter((_, i) => i !== index);
          const newIndex =
            index < s.queueIndex
              ? s.queueIndex - 1
              : Math.min(s.queueIndex, newQueue.length - 1);
          return { queue: newQueue, queueIndex: Math.max(0, newIndex) };
        }),

      reorderQueue: (fromIndex, toIndex) =>
        set((s) => {
          const newQueue = [...s.queue];
          const [moved] = newQueue.splice(fromIndex, 1);
          newQueue.splice(toIndex, 0, moved);
          let newQueueIndex = s.queueIndex;
          if (fromIndex === s.queueIndex) {
            newQueueIndex = toIndex;
          } else if (fromIndex < s.queueIndex && toIndex >= s.queueIndex) {
            newQueueIndex = s.queueIndex - 1;
          } else if (fromIndex > s.queueIndex && toIndex <= s.queueIndex) {
            newQueueIndex = s.queueIndex + 1;
          }
          return { queue: newQueue, queueIndex: newQueueIndex };
        }),

      clearQueue: () => set((s) => ({ 
        queue: s.currentTrack ? [s.currentTrack] : [], 
        queueIndex: 0 
      })),

      reset: () =>
        set({
          currentTrack: null,
          queue: [],
          queueIndex: 0,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          isShuffle: false,
          repeatMode: "none",
        }),

      loadFromBackend: async () => {
        try {
          const backendState = await getPlayerState();
          if (!backendState || !backendState.track_id) return;

          // Fetch full track details to ensure we have a working audio URL
          const { getTrackById } = await import("../services/track.service");
          const fullTrack = await getTrackById(backendState.track_id);

          set({
            currentTrack: fullTrack,
            queue: Array.isArray(backendState.queue) && backendState.queue.length > 0 
              ? backendState.queue 
              : [fullTrack],
            queueIndex: 0,
            currentTime: backendState.position_seconds || 0,
            duration: backendState.duration || Number(fullTrack.duration) || 0,
            volume: backendState.volume ?? 1,
            isPlaying: false,
          });
        } catch (e) {
          console.error("Failed to rehydrate player from backend", e);
        }
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
        isAutoplay: state.isAutoplay,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isPlaying = false;
      },
    }
  )
);

// Sync Subscriptions
usePlayerStore.subscribe((state, prev) => {
  const trackChanged = state.currentTrack?.id !== prev.currentTrack?.id;
  const volumeChanged = state.volume !== prev.volume;
  const queueChanged = state.queue.length !== prev.queue.length;
  const progressStepped = Math.floor(state.currentTime / 5) !== Math.floor(prev.currentTime / 5);

  if (trackChanged && state.currentTrack) {
    // Automatically add to listening history whenever a track starts
    import("./history.store").then((m) => {
      m.useHistoryStore.getState().addTrack(state.currentTrack!);
    }).catch(e => console.error("Failed to add track to history", e));
  }

  if (trackChanged || volumeChanged || queueChanged || progressStepped) {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated && user) {
      debouncedSave(user.id, state);
    }
  }
});

useAuthStore.subscribe((state, prev) => {
  if (state.isAuthenticated && !prev.isAuthenticated) {
    // On login, hydrate everything from backend
    usePlayerStore.getState().loadFromBackend();
    
    import("./likes.store").then((m) => {
      m.useLikesStore.getState().hydrateFromApi();
    }).catch(e => console.error("Failed to hydrate likes", e));

    import("./history.store").then((m) => {
      m.useHistoryStore.getState().hydrateFromBackend();
    }).catch(e => console.error("Failed to hydrate history", e));
  }
});

// Real-time Cross-Tab Synchronization
window.addEventListener("storage", (event) => {
  if (event.key === "rythmify-player-storage") {
    try {
      const newValue = JSON.parse(event.newValue || "{}");
      if (newValue.state) {
        const { currentTrack, queue, queueIndex, isPlaying, volume, isMuted, repeatMode, isShuffle, currentTime } = newValue.state;
        const currentState = usePlayerStore.getState();
        
        usePlayerStore.setState({
          currentTrack,
          queue,
          queueIndex,
          currentTime,
          volume,
          isMuted,
          repeatMode,
          isShuffle,
        });
        
        if (isPlaying && currentState.isPlaying) {
           currentState.pause();
        }
      }
    } catch (e) {
      console.error("Failed to sync player state across tabs", e);
    }
  }
});
