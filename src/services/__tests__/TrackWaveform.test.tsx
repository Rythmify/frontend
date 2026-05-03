import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import TrackWaveform from "../../pages/[username]/[trackSlug]/components/TrackWaveform";
import type { Track } from "../../types/track";

const mockWsInstance = {
  load: vi.fn(),
  setVolume: vi.fn(),
  destroy: vi.fn(),
  isPlaying: vi.fn(() => false),
  setTime: vi.fn(),
  getDuration: vi.fn(() => 200),
  on: vi.fn(),
};

vi.mock("wavesurfer.js", () => ({
  default: { create: vi.fn(() => mockWsInstance) },
}));

vi.mock("../audioService", () => {
  const fakeAudio = Object.assign(new EventTarget(), {
    currentTime: 0,
    duration: 200,
    src: "/audio/test.mp3",
    paused: true,
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  return {
    audio: fakeAudio,
    setTrackLoadedLocally: vi.fn(),
    setGlobalWaveSurfer: vi.fn(),
    seekAudio: vi.fn(),
  };
});

vi.mock("../track.service", () => ({
  getTrackWaveform: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

vi.mock("../../../stores/player.store", () => ({
  usePlayerStore: {
    getState: vi.fn(() => ({ currentTrack: null })),
    subscribe: vi.fn(),
  },
}));

// Stub canvas.getContext so the gradient code in TrackWaveform doesn't crash
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  }) as any;
});

const track: Track = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Test Song",
  artistName: "Test Artist",
  artistUsername: "test-artist",
  coverUrl: "",
  genre: "Pop",
  likeCount: 0, repostCount: 0, playCount: 0, commentCount: 0,
  duration: "3:20",
  postedAt: "now",
  waveformData: [],
  audioUrl: "/audio/test.mp3",
  trackSlug: "test-song",
};

describe("TrackWaveform", () => {
  it("renders without crashing", () => {
    const { container } = render(<TrackWaveform track={track} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("starts with a 0:00 time display", () => {
    render(<TrackWaveform track={track} />);
    const all = document.querySelectorAll("div");
    const found = Array.from(all).find((d) => d.textContent === "0:00");
    expect(found).toBeTruthy();
  });

  it("calls WaveSurfer.create to set up the waveform", async () => {
    const WaveSurfer = (await import("wavesurfer.js")).default;
    render(<TrackWaveform track={track} />);
    await waitFor(() => expect(WaveSurfer.create).toHaveBeenCalled());
  });

  it("registers the track id with audioService so we can track what's loaded", async () => {
    const { setGlobalWaveSurfer } = await import("../audioService");
    render(<TrackWaveform track={track} />);
    await waitFor(() => expect(setGlobalWaveSurfer).toHaveBeenCalledWith(expect.anything(), track.id));
  });
});
