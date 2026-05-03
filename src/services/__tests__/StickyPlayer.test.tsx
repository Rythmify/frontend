import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StickyPlayer from "../../components/player/StickyPlayer";
import { usePlayerStore } from "../../stores/player.store";
import type { Track } from "../../types/track";

vi.mock("../audioService", () => ({
  seekAudio: vi.fn(),
  audio: { currentTime: 0, src: "" },
  setTrackLoadedLocally: vi.fn(),
  setGlobalWaveSurfer: vi.fn(),
  globalWaveSurfer: null,
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const makeTrack = (id = "550e8400-e29b-41d4-a716-446655440000"): Track => ({
  id,
  title: "Test Song",
  artistName: "Test Artist",
  artistUsername: "test-artist",
  coverUrl: "https://picsum.photos/seed/test/100/100",
  genre: "Pop",
  likeCount: 500,
  repostCount: 10,
  playCount: 1000,
  commentCount: 5,
  duration: "3:00",
  postedAt: "1 day ago",
  waveformData: [],
  audioUrl: "/audio/test.mp3",
  trackSlug: "test-song",
});

describe("StickyPlayer", () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 180,
      volume: 0.8,
      isMuted: false,
      isLiked: false,
    } as any);
  });

  it("renders nothing when there is no currentTrack", () => {
    const { container } = render(<StickyPlayer />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the player when a track is set", () => {
    usePlayerStore.setState({ currentTrack: makeTrack() } as any);
    render(<StickyPlayer />);
    expect(screen.getByTestId("sticky-player")).toBeInTheDocument();
  });

  it("renders the track artwork", () => {
    usePlayerStore.setState({ currentTrack: makeTrack() } as any);
    render(<StickyPlayer />);
    expect(screen.getByTestId("player-track-artwork")).toBeInTheDocument();
  });

  it("renders the progress bar with play button", () => {
    usePlayerStore.setState({ currentTrack: makeTrack() } as any);
    render(<StickyPlayer />);
    expect(screen.getByTestId("player-progress-bar")).toBeInTheDocument();
    expect(screen.getByTestId("player-button-play-pause")).toBeInTheDocument();
  });

  it("renders the volume slider wrapper", () => {
    usePlayerStore.setState({ currentTrack: makeTrack() } as any);
    render(<StickyPlayer />);
    expect(screen.getByTestId("player-volume-wrapper")).toBeInTheDocument();
  });
});
