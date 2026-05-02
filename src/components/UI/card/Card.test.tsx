import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import TrackCard from "@/components/UI/card/Card";
import type { Track } from "@/types/track";
import { useAuthStore } from "@/stores/auth.store";
import { useDownloadStore } from "@/stores/useDownload";

// ─── Mocks ────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockPlayerStore = {
  currentTrack: null,
  isPlaying: false,
  setTrack: vi.fn(),
  togglePlay: vi.fn(),
  playContext: vi.fn(),
};

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: Object.assign(
    vi.fn(() => mockPlayerStore),
    {
      getState: vi.fn(() => mockPlayerStore),
    }
  ),
}));

const mockLikesStore = {
  isTrackLiked: vi.fn().mockReturnValue(false),
  isRadioTrackLiked: vi.fn().mockReturnValue(false),
  getRadioPlaylistId: vi.fn().mockReturnValue(undefined),
  toggleTrack: vi.fn(),
  toggleRadioTrack: vi.fn(),
};

const mockToggleDownload = vi.fn();

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(() => mockLikesStore),
}));

vi.mock("@/stores/history.store", () => ({
  useHistoryStore: vi.fn(() => ({
    addTrack: vi.fn(),
  })),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/stores/useDownload", () => ({
  useDownloadStore: vi.fn(),
}));

vi.mock("@/components/UI/CardOverlay/CardOverlay", () => ({
  default: ({ isPlaying, onPlay, isLiked, onLike, downloadMenuItem, moreMenuItems }: any) => (
    <div data-test="card-overlay">
      <button data-test="button-play" onClick={onPlay}>
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button data-test="button-like" onClick={onLike}>
        {isLiked ? "Unlike" : "Like"}
      </button>
      <button data-test="button-download" onClick={downloadMenuItem?.onClick}>
        {downloadMenuItem?.label ?? "No download"}
      </button>
      <button data-test="button-more" onClick={moreMenuItems[0]?.onClick}>
        More
      </button>
    </div>
  ),
  AddToPlaylistIcon: () => <div />,
}));

vi.mock("@/services/track.service", () => ({
  getRelatedTracks: vi.fn().mockResolvedValue({ tracks: [] }),
}));

vi.mock("@/components/playlist/AddToPlaylistModal", () => ({
  default: ({ trackTitle, onClose }: any) => (
    <div data-test="add-to-playlist-modal">
      <span>{trackTitle}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const mockTrack: Track = {
  id: "f5e4d3c2-b1a0-4987-8765-43210abcdeh0",
  title: "Butterfly Effect",
  artistName: "Travis Scott",
  artistUsername: "travisscott",
  trackSlug: "butterfly-effect",
  coverUrl: "https://example.com/cover.jpg",
  genre: "Hip-Hop",
  likeCount: 2543,
  repostCount: 845,
  playCount: 15230,
  commentCount: 234,
  duration: "3:45",
  postedAt: "2026-03-02T10:00:00Z",
  waveformData: [],
  audioUrl: "https://example.com/audio/track1.mp3",
  isPrivate: false,
};

describe("TrackCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlayerStore.currentTrack = null;
    mockPlayerStore.isPlaying = false;
    mockLikesStore.isTrackLiked.mockReturnValue(false);
    vi.mocked(useAuthStore).mockReturnValue({ user: { isPro: true } } as any);
    vi.mocked(useDownloadStore).mockReturnValue({
      isDownloaded: vi.fn().mockReturnValue(false),
      toggleDownload: mockToggleDownload,
    } as any);
  });

  it("renders cover image, title and artist", () => {
    render(<TrackCard track={mockTrack} />);
    expect(screen.getByTestId("trackcard-image")).toHaveAttribute("src", mockTrack.coverUrl);
    expect(screen.getByTestId("trackcard-title")).toHaveTextContent(mockTrack.title);
    expect(screen.getByTestId("trackcard-artist")).toHaveTextContent(mockTrack.artistName);
  });

  it("navigates to the personalised mix page when card is clicked", () => {
    render(<TrackCard track={mockTrack} />);
    fireEvent.click(screen.getByTestId("card-track"));
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining("/discover/personalised/")
    );
  });

  it("shows play/pause state correctly", () => {
    const { rerender } = render(<TrackCard track={mockTrack} />);
    expect(screen.getByTestId("button-play")).toHaveTextContent("Play");

    mockPlayerStore.currentTrack = mockTrack as any;
    mockPlayerStore.isPlaying = true;
    
    rerender(<TrackCard track={mockTrack} />);
    expect(screen.getByTestId("button-play")).toHaveTextContent("Pause");
  });

  it("calls playContext when play is clicked on a new track", () => {
    render(<TrackCard track={mockTrack} />);
    fireEvent.click(screen.getByTestId("button-play"));
    
    expect(mockPlayerStore.playContext).toHaveBeenCalledWith("track", mockTrack.id, mockTrack);
  });

  it("calls togglePlay when play is clicked on the current track", () => {
    mockPlayerStore.currentTrack = mockTrack as any;
    mockPlayerStore.isPlaying = true;
    
    render(<TrackCard track={mockTrack} />);
    fireEvent.click(screen.getByTestId("button-play"));
    
    expect(mockPlayerStore.togglePlay).toHaveBeenCalled();
  });

  it("toggles liked state via useLikesStore", () => {
    render(<TrackCard track={mockTrack} />);
    fireEvent.click(screen.getByTestId("button-like"));
    
    expect(mockLikesStore.toggleTrack).toHaveBeenCalledWith(mockTrack);
  });

  it("toggles radio likes when radioLikeMode is enabled", () => {
    render(<TrackCard track={mockTrack} radioLikeMode />);
    fireEvent.click(screen.getByTestId("button-like"));
    expect(mockLikesStore.toggleRadioTrack).toHaveBeenCalledWith(mockTrack);
  });

  it("opens add-to-playlist modal", async () => {
    render(<TrackCard track={mockTrack} />);
    fireEvent.click(screen.getByTestId("button-more"));
    
    expect(screen.getByTestId("add-to-playlist-modal")).toBeInTheDocument();
  });

  it("passes a download action into the overlay for pro users", () => {
    render(<TrackCard track={mockTrack} />);

    expect(screen.getByTestId("button-download")).toHaveTextContent("Download");
    fireEvent.click(screen.getByTestId("button-download"));

    expect(mockToggleDownload).toHaveBeenCalledWith(mockTrack, true);
  });

  it("sends non-pro users to premium from the overlay download action", () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: { isPro: false } } as any);

    render(<TrackCard track={mockTrack} />);

    expect(screen.getByTestId("button-download")).toHaveTextContent("Download");
    fireEvent.click(screen.getByTestId("button-download"));

    expect(mockNavigate).toHaveBeenCalledWith("/premium");
  });
});
