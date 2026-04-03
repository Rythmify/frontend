import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePlayerStore } from "../../stores/player.store";
import type { Track } from "../../types/track";

// Mock audioService to prevent circular dependency issues in tests
vi.mock("../audioService", () => ({
  seekAudio: vi.fn(),
  audio: { currentTime: 0, src: "" },
  setTrackLoadedLocally: vi.fn(),
  setGlobalWaveSurfer: vi.fn(),
  globalWaveSurfer: null,
}));

const makeTrack = (id: number, title = `Track ${id}`): Track => ({
  id,
  title,
  artistName: "Artist",
  artistUsername: "artist",
  coverUrl: "",
  genre: "Pop",
  likeCount: 0,
  repostCount: 0,
  playCount: 0,
  commentCount: 0,
  duration: "3:00",
  postedAt: "1 day ago",
  waveformData: [],
  audioUrl: `/audio/track${id}.mp3`,
  trackSlug: `track-${id}`,
});

const track1 = makeTrack(1, "Song A");
const track2 = makeTrack(2, "Song B");
const track3 = makeTrack(3, "Song C");

describe("player.store", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    usePlayerStore.setState({
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
    });
  });

  // ─── setTrack ────────────────────────────────────────────────
  describe("setTrack", () => {
    it("sets currentTrack and starts playing", () => {
      usePlayerStore.getState().setTrack(track1);
      const { currentTrack, isPlaying } = usePlayerStore.getState();
      expect(currentTrack?.id).toBe(1);
      expect(isPlaying).toBe(true);
    });

    it("sets the correct queueIndex when queue is provided", () => {
      usePlayerStore.getState().setTrack(track2, [track1, track2, track3]);
      expect(usePlayerStore.getState().queueIndex).toBe(1);
    });

    it("preserves currentTime when null → same track (seek before play)", () => {
      usePlayerStore.setState({ currentTime: 42 });
      usePlayerStore.getState().setTrack(track1);
      expect(usePlayerStore.getState().currentTime).toBe(42);
    });

    it("resets currentTime to 0 when switching to a completely different track", () => {
      usePlayerStore.getState().setTrack(track1, [track1, track2]);
      usePlayerStore.setState({ currentTime: 90 });
      usePlayerStore.getState().setTrack(track2, [track1, track2]);
      expect(usePlayerStore.getState().currentTime).toBe(0);
    });

    it("resets isLiked when a new track is set", () => {
      usePlayerStore.setState({ isLiked: true });
      usePlayerStore.getState().setTrack(track1);
      expect(usePlayerStore.getState().isLiked).toBe(false);
    });
  });

  // ─── play / pause / togglePlay ───────────────────────────────
  describe("play / pause / togglePlay", () => {
    it("play sets isPlaying to true", () => {
      usePlayerStore.getState().play();
      expect(usePlayerStore.getState().isPlaying).toBe(true);
    });

    it("pause sets isPlaying to false", () => {
      usePlayerStore.setState({ isPlaying: true });
      usePlayerStore.getState().pause();
      expect(usePlayerStore.getState().isPlaying).toBe(false);
    });

    it("togglePlay flips isPlaying", () => {
      usePlayerStore.getState().togglePlay();
      expect(usePlayerStore.getState().isPlaying).toBe(true);
      usePlayerStore.getState().togglePlay();
      expect(usePlayerStore.getState().isPlaying).toBe(false);
    });
  });

  // ─── next ────────────────────────────────────────────────────
  describe("next", () => {
    it("advances to next track in queue", () => {
      usePlayerStore.getState().setTrack(track1, [track1, track2, track3]);
      usePlayerStore.getState().next();
      expect(usePlayerStore.getState().currentTrack?.id).toBe(track2.id);
    });

    it("wraps around to first track from last", () => {
      usePlayerStore.getState().setTrack(track3, [track1, track2, track3]);
      usePlayerStore.getState().next();
      expect(usePlayerStore.getState().currentTrack?.id).toBe(track1.id);
    });

    it("does nothing if queue is empty", () => {
      usePlayerStore.getState().next();
      expect(usePlayerStore.getState().currentTrack).toBeNull();
    });

    it("resets currentTime to 0 on next", () => {
      usePlayerStore.getState().setTrack(track1, [track1, track2]);
      usePlayerStore.setState({ currentTime: 60 });
      usePlayerStore.getState().next();
      expect(usePlayerStore.getState().currentTime).toBe(0);
    });
  });

  // ─── previous ────────────────────────────────────────────────
  describe("previous", () => {
    it("restarts current track if currentTime > 3s", () => {
      usePlayerStore.getState().setTrack(track2, [track1, track2, track3]);
      usePlayerStore.setState({ currentTime: 10 });
      usePlayerStore.getState().previous();
      expect(usePlayerStore.getState().currentTrack?.id).toBe(track2.id);
      expect(usePlayerStore.getState().currentTime).toBe(0);
    });

    it("goes to previous track if currentTime ≤ 3s", () => {
      usePlayerStore.getState().setTrack(track2, [track1, track2, track3]);
      usePlayerStore.setState({ currentTime: 1 });
      usePlayerStore.getState().previous();
      expect(usePlayerStore.getState().currentTrack?.id).toBe(track1.id);
    });

    it("wraps around to last track from first", () => {
      usePlayerStore.getState().setTrack(track1, [track1, track2, track3]);
      usePlayerStore.setState({ currentTime: 0 });
      usePlayerStore.getState().previous();
      expect(usePlayerStore.getState().currentTrack?.id).toBe(track3.id);
    });
  });

  // ─── toggleRepeat ────────────────────────────────────────────
  describe("toggleRepeat", () => {
    it("cycles none → all → one → none", () => {
      const { toggleRepeat } = usePlayerStore.getState();
      expect(usePlayerStore.getState().repeatMode).toBe("none");
      toggleRepeat();
      expect(usePlayerStore.getState().repeatMode).toBe("all");
      toggleRepeat();
      expect(usePlayerStore.getState().repeatMode).toBe("one");
      toggleRepeat();
      expect(usePlayerStore.getState().repeatMode).toBe("none");
    });
  });

  // ─── toggleShuffle ───────────────────────────────────────────
  describe("toggleShuffle", () => {
    it("toggles shuffle on and off", () => {
      usePlayerStore.getState().toggleShuffle();
      expect(usePlayerStore.getState().isShuffle).toBe(true);
      usePlayerStore.getState().toggleShuffle();
      expect(usePlayerStore.getState().isShuffle).toBe(false);
    });
  });

  // ─── volume / mute ───────────────────────────────────────────
  describe("setVolume / toggleMute", () => {
    it("setVolume updates volume and clears mute", () => {
      usePlayerStore.getState().setVolume(0.5);
      const { volume, isMuted } = usePlayerStore.getState();
      expect(volume).toBe(0.5);
      expect(isMuted).toBe(false);
    });

    it("setVolume(0) sets isMuted true", () => {
      usePlayerStore.getState().setVolume(0);
      expect(usePlayerStore.getState().isMuted).toBe(true);
    });

    it("toggleMute flips isMuted", () => {
      usePlayerStore.getState().toggleMute();
      expect(usePlayerStore.getState().isMuted).toBe(true);
      usePlayerStore.getState().toggleMute();
      expect(usePlayerStore.getState().isMuted).toBe(false);
    });
  });

  // ─── setCurrentTime / setDuration ────────────────────────────
  describe("setCurrentTime / setDuration", () => {
    it("setCurrentTime updates currentTime", () => {
      usePlayerStore.getState().setCurrentTime(45);
      expect(usePlayerStore.getState().currentTime).toBe(45);
    });

    it("setDuration updates duration", () => {
      usePlayerStore.getState().setDuration(192);
      expect(usePlayerStore.getState().duration).toBe(192);
    });
  });

  // ─── addToQueue ──────────────────────────────────────────────
  describe("addToQueue", () => {
    it("appends a track to the queue", () => {
      usePlayerStore.getState().setTrack(track1, [track1]);
      usePlayerStore.getState().addToQueue(track2);
      const queue = usePlayerStore.getState().queue;
      expect(queue).toHaveLength(2);
      expect(queue[1].id).toBe(track2.id);
    });
  });

  // ─── toggleLike ──────────────────────────────────────────────
  describe("toggleLike", () => {
    it("toggles isLiked", () => {
      usePlayerStore.getState().toggleLike();
      expect(usePlayerStore.getState().isLiked).toBe(true);
      usePlayerStore.getState().toggleLike();
      expect(usePlayerStore.getState().isLiked).toBe(false);
    });
  });
});
