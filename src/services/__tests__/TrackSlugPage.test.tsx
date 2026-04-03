import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TrackSlugPage from "../../pages/[username]/[trackSlug]/TrackSlugPage";
import type { Track } from "../../types/track";

// vi.hoisted lets us reference these values inside vi.mock factories,
// which are hoisted to the top of the file by vitest at compile time.
const { mockTrack, mockNavigate } = vi.hoisted(() => {
  const mt: Track = {
    id: 1,
    title: "Msh Awl Mara",
    artistName: "Lege-Cy",
    artistUsername: "samo-lotfy",
    coverUrl: "https://picsum.photos/seed/1/300/300",
    genre: "R&B",
    likeCount: 14000,
    repostCount: 35,
    playCount: 507000,
    commentCount: 120,
    duration: "3:12",
    postedAt: "2 months ago",
    waveformData: [20, 40, 60, 30],
    audioUrl: "/audio/Track 1.mp3",
    trackSlug: "msh-awl-mara",
  };
  return { mockTrack: mt, mockNavigate: vi.fn() };
});

vi.mock("react-router-dom", () => ({
  useParams: vi.fn(() => ({ username: "samo-lotfy", trackSlug: "msh-awl-mara" })),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("../audioService", () => ({
  seekAudio: vi.fn(),
  audio: { currentTime: 0, src: "" },
  setTrackLoadedLocally: vi.fn(),
  setGlobalWaveSurfer: vi.fn(),
  globalWaveSurfer: null,
}));

vi.mock("../../stores/player.store", () => ({
  usePlayerStore: vi.fn(() => ({
    currentTrack: null,
    isPlaying: false,
    setTrack: vi.fn(),
    togglePlay: vi.fn(),
  })),
}));

vi.mock("../../services/mocks/Track.service", () => ({
  getTrackBySlug: vi.fn().mockResolvedValue(mockTrack),
  getRelatedTracks: vi.fn().mockResolvedValue([]),
  likeTrack: vi.fn().mockResolvedValue({ liked: true, likeCount: 1 }),
  unlikeTrack: vi.fn().mockResolvedValue({ liked: false, likeCount: 0 }),
  repostTrack: vi.fn().mockResolvedValue({ reposted: true, repostCount: 1 }),
  postComment: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../services/mocks/User.service", () => ({
  getUsers: vi.fn().mockResolvedValue([]),
  followUser: vi.fn().mockResolvedValue({}),
  unfollowUser: vi.fn().mockResolvedValue({}),
}));

// Stub the heavy child components so we can test the page in isolation
vi.mock("../../pages/[username]/[trackSlug]/components/TrackHero", () => ({
  default: ({ track, isPlaying, onPlayPause }: any) => (
    <div data-test="track-hero">
      <span data-test="track-title">{track.title}</span>
      <button data-test="button-play-pause-hero" onClick={onPlayPause}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  ),
}));

vi.mock("../../pages/[username]/[trackSlug]/components/TrackActions", () => ({
  default: () => <div data-test="track-actions-wrapper" />,
}));

vi.mock("../../pages/[username]/[trackSlug]/components/TrackList", () => ({
  default: ({ tracks, onTrackPlay }: any) => (
    <div data-test="track-list">
      {tracks.map((t: Track) => (
        <div key={t.id} onClick={() => onTrackPlay(t)}>{t.title}</div>
      ))}
    </div>
  ),
}));

vi.mock("../../pages/[username]/[trackSlug]/components/TrackSidebar", () => ({
  default: () => <div data-test="track-sidebar" />,
}));

import { usePlayerStore } from "../../stores/player.store";

describe("TrackSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePlayerStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentTrack: null,
      isPlaying: false,
      setTrack: vi.fn(),
      togglePlay: vi.fn(),
    });
  });

  it("shows a loading skeleton before data arrives", () => {
    render(<TrackSlugPage />);
    expect(screen.getByTestId("track-slug-loading")).toBeInTheDocument();
  });

  it("renders the full page once data loads", async () => {
    render(<TrackSlugPage />);
    await waitFor(() => {
      expect(screen.getByTestId("track-slug-page")).toBeInTheDocument();
    });
  });

  it("displays the track title in the hero", async () => {
    render(<TrackSlugPage />);
    await waitFor(() => {
      expect(screen.getByTestId("track-title")).toHaveTextContent("Msh Awl Mara");
    });
  });

  it("renders the related tracks list", async () => {
    render(<TrackSlugPage />);
    await waitFor(() => {
      expect(screen.getByTestId("track-list")).toBeInTheDocument();
    });
  });

  it("renders the sidebar column", async () => {
    render(<TrackSlugPage />);
    await waitFor(() => {
      expect(screen.getByTestId("track-sidebar-col")).toBeInTheDocument();
    });
  });

  it("shows an error state when the fetch fails", async () => {
    const { getTrackBySlug } = await import("../../services/mocks/Track.service");
    (getTrackBySlug as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));
    render(<TrackSlugPage />);
    await waitFor(() => {
      expect(screen.getByTestId("track-slug-error")).toBeInTheDocument();
    });
  });
});
