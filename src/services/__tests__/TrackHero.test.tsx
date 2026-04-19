import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TrackHero from "../../pages/[username]/[trackSlug]/components/TrackHero";
import type { Track } from "../../types/track";

vi.mock("wavesurfer.js", () => ({
  default: {
    create: vi.fn(() => ({
      load: vi.fn(),
      setVolume: vi.fn(),
      destroy: vi.fn(),
      on: vi.fn(),
      isPlaying: vi.fn(() => false),
      setTime: vi.fn(),
      getDuration: vi.fn(() => 180),
    })),
  },
}));

vi.mock("../audioService", () => ({
  audio: Object.assign(new EventTarget(), {
    currentTime: 0,
    duration: 180,
    src: "",
    paused: true,
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
  setTrackLoadedLocally: vi.fn(),
  setGlobalWaveSurfer: vi.fn(),
  globalWaveSurfer: null,
  seekAudio: vi.fn(),
}));

// Mock TrackWaveform so jsdom's null canvas.getContext doesn't crash
vi.mock("../../pages/[username]/[trackSlug]/components/TrackWaveform", () => ({
  default: vi.fn().mockReturnValue(<div data-test="track-waveform" />),
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const baseTrack: Track = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Test Song",
  artistName: "Test Artist",
  artistUsername: "test-artist",
  coverUrl: "https://picsum.photos/seed/test/300/300",
  genre: "R&B",
  likeCount: 100,
  repostCount: 5,
  playCount: 2000,
  commentCount: 10,
  duration: "3:00",
  postedAt: "2 days ago",
  waveformData: [20, 40, 60],
  audioUrl: "/audio/test.mp3",
  trackSlug: "test-song",
  isPrivate: false,
};

describe("TrackHero", () => {
  const onPlayPause = vi.fn();

  beforeEach(() => { onPlayPause.mockClear(); });

  it("renders the hero container", () => {
    render(<TrackHero track={baseTrack} onPlayPause={onPlayPause} />);
    expect(screen.getByTestId("track-hero")).toBeInTheDocument();
  });

  it("renders track title", () => {
    render(<TrackHero track={baseTrack} onPlayPause={onPlayPause} />);
    expect(screen.getByTestId("track-title")).toHaveTextContent("Test Song");
  });

  it("renders artist name as a link", () => {
    render(<TrackHero track={baseTrack} onPlayPause={onPlayPause} />);
    expect(screen.getByTestId("track-artist-link")).toHaveTextContent("Test Artist");
  });

  it("renders the genre tag", () => {
    render(<TrackHero track={baseTrack} onPlayPause={onPlayPause} />);
    expect(screen.getByTestId("track-genre-tag")).toBeInTheDocument();
  });

  it("renders postedAt time", () => {
    render(<TrackHero track={baseTrack} onPlayPause={onPlayPause} />);
    expect(screen.getByTestId("track-posted-at")).toHaveTextContent("2 days ago");
  });

  it("calls onPlayPause when play button is clicked", () => {
    render(<TrackHero track={baseTrack} onPlayPause={onPlayPause} />);
    fireEvent.click(screen.getByTestId("button-play-pause-hero"));
    expect(onPlayPause).toHaveBeenCalledOnce();
  });

  it("does NOT show private badge for public tracks", () => {
    render(<TrackHero track={baseTrack} onPlayPause={onPlayPause} />);
    expect(screen.queryByTestId("badge-private")).not.toBeInTheDocument();
  });

  it("shows private badge for private tracks", () => {
    render(<TrackHero track={{ ...baseTrack, isPrivate: true }} onPlayPause={onPlayPause} />);
    expect(screen.getByTestId("badge-private")).toBeInTheDocument();
  });

  it("renders track cover image", () => {
    render(<TrackHero track={baseTrack} onPlayPause={onPlayPause} />);
    expect(screen.getByTestId("track-cover")).toBeInTheDocument();
  });

  it("renders comment avatars when provided", () => {
    const comments = [{ 
      comment_id: "1", 
      track_id: baseTrack.id,
      user_id: "user-1",
      content: "Nice track!",
      track_timestamp: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      like_count: 0,
      reply_count: 0,
      author: {
        display_name: "User 1",
        avatar_url: "https://picsum.photos/30",
        username: "user1"
      }
    }] as any;
    render(<TrackHero track={baseTrack} comments={comments} onPlayPause={onPlayPause} />);
    expect(screen.getByTestId("track-comment-avatars")).toBeInTheDocument();
  });

  it("does NOT render comment avatars when empty", () => {
    render(<TrackHero track={baseTrack} comments={[]} onPlayPause={onPlayPause} />);
    expect(screen.queryByTestId("track-comment-avatars")).not.toBeInTheDocument();
  });
});
