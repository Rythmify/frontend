import { create } from "zustand";
import type { Track } from "../types/track";

// audioService imports this store, so we can't import it at the top level
// without creating a circular dependency. Dynamic import resolves this.
let _seekAudio: ((time: number) => void) | null = null;
function getSeekAudio() {
  if (!_seekAudio) {
    import("../services/audioService").then((m) => { _seekAudio = m.seekAudio; });
  }
  return _seekAudio;
}

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
  setTrack: (track: Track, queue?: Track[]) => void;
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
    const isSameTrack = get().currentTrack?.id === track.id;

    if (isSameTrack) {
      // Same track - just ensure it is playing. Dont touch currentTime or
      // trigger a reload. The waveform already seeked audio.currentTime directly.
      set({ isPlaying: true });
      return;
    }

    // New track - preserve currentTime only when coming from null state
    // (example hero waveform was interacted with before pressing play).
    const isFromNullState = get().currentTrack === null;
    const nextTime = isFromNullState ? get().currentTime : 0;

    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: index >= 0 ? index : 0,
      isPlaying: true,
      currentTime: nextTime,
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
}));