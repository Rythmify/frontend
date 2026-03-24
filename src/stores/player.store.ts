import { create } from "zustand";
import type { Track } from "../types/track";
// Lazy import to avoid circular dependency (audioService imports this store)
let _seekAudio: ((time: number) => void) | null = null;
function getSeekAudio() {
  if (!_seekAudio) {
    // Dynamic import so this module doesn't eagerly depend on audioService at parse time
    import("../services/audioService").then((m) => { _seekAudio = m.seekAudio; });
  }
  return _seekAudio;
}

interface PlayerState {
  //Current track 
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;

  //Playback state 
  isPlaying: boolean;
  currentTime: number;   // seconds
  duration: number;      // seconds
  volume: number;        // 0-1
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: "none" | "one" | "all";
  isLiked: boolean;

  // Actions 
  setTrack: (track: Track, queue?: Track[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: () => void;
  addToQueue: (track: Track) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
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

  setTrack: (track, queue) => {
    const newQueue = queue ?? get().queue;
    const index = newQueue.findIndex((t) => t.id === track.id);
    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: index >= 0 ? index : 0,
      isPlaying: true,
      currentTime: 0,
      isLiked: false,
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
    // If more than 3s in, restart current track
    if (currentTime > 3) {
      set({ currentTime: 0 });
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

  seek: (time) => set({ currentTime: time }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () =>
    set((s) => ({ isMuted: !s.isMuted })),

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
}));