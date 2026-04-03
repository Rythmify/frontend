import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PlayerControls from "../../components/player/PlayerControls";
import { usePlayerStore } from "../../stores/player.store";
import type { Track } from "../../types/track";

vi.mock("../audioService", () => ({
  seekAudio: vi.fn(),
  audio: { currentTime: 0, src: "" },
  setTrackLoadedLocally: vi.fn(),
  setGlobalWaveSurfer: vi.fn(),
  globalWaveSurfer: null,
}));

const makeTrack = (id: number): Track => ({
  id,
  title: `Track ${id}`,
  artistName: "Artist",
  artistUsername: "artist",
  coverUrl: "",
  genre: "Pop",
  likeCount: 0,
  repostCount: 0,
  playCount: 0,
  commentCount: 0,
  duration: "3:00",
  postedAt: "now",
  waveformData: [],
  audioUrl: `/audio/track${id}.mp3`,
  trackSlug: `track-${id}`,
});

const t1 = makeTrack(1);
const t2 = makeTrack(2);

describe("PlayerControls", () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentTrack: t1,
      queue: [t1, t2],
      queueIndex: 0,
      isPlaying: false,
      currentTime: 0,
      isShuffle: false,
      repeatMode: "none",
    } as any);
  });

  it("renders all control buttons", () => {
    render(<PlayerControls />);
    expect(screen.getByTestId("player-controls")).toBeInTheDocument();
    expect(screen.getByTestId("player-button-play-pause")).toBeInTheDocument();
    expect(screen.getByTestId("player-button-previous")).toBeInTheDocument();
    expect(screen.getByTestId("player-button-next")).toBeInTheDocument();
    expect(screen.getByTestId("player-button-shuffle")).toBeInTheDocument();
    expect(screen.getByTestId("player-button-repeat")).toBeInTheDocument();
  });

  it("clicking play/pause toggles playing state", () => {
    render(<PlayerControls />);
    const btn = screen.getByTestId("player-button-play-pause");
    fireEvent.click(btn);
    expect(usePlayerStore.getState().isPlaying).toBe(true);
    fireEvent.click(btn);
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it("clicking next advances to next track", () => {
    render(<PlayerControls />);
    fireEvent.click(screen.getByTestId("player-button-next"));
    expect(usePlayerStore.getState().currentTrack?.id).toBe(t2.id);
  });

  it("clicking previous restarts track when > 3s in", () => {
    usePlayerStore.setState({ currentTime: 10 } as any);
    render(<PlayerControls />);
    fireEvent.click(screen.getByTestId("player-button-previous"));
    expect(usePlayerStore.getState().currentTime).toBe(0);
    expect(usePlayerStore.getState().currentTrack?.id).toBe(t1.id);
  });

  it("clicking shuffle toggles isShuffle", () => {
    render(<PlayerControls />);
    fireEvent.click(screen.getByTestId("player-button-shuffle"));
    expect(usePlayerStore.getState().isShuffle).toBe(true);
  });

  it("clicking repeat cycles through none → all → one", () => {
    render(<PlayerControls />);
    const btn = screen.getByTestId("player-button-repeat");
    fireEvent.click(btn);
    expect(usePlayerStore.getState().repeatMode).toBe("all");
    fireEvent.click(btn);
    expect(usePlayerStore.getState().repeatMode).toBe("one");
    fireEvent.click(btn);
    expect(usePlayerStore.getState().repeatMode).toBe("none");
  });
});
