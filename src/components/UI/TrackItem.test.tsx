import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import TrackItem from "@/components/UI/TrackItem";

const mockNavigate = vi.fn();
const mockToggleTrack = vi.fn();
const mockToggleRepost = vi.fn().mockResolvedValue(undefined);
const mockToggleDownload = vi.fn();
const mockSetTrack = vi.fn();
const mockTogglePlay = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: Object.assign(
    vi.fn(() => ({
      currentTrack: null,
      isPlaying: false,
      setTrack: mockSetTrack,
      togglePlay: mockTogglePlay,
    })),
    {
      getState: vi.fn(() => ({
        playContext: vi.fn(),
      })),
    },
  ),
}));

const mockLikesState = {
  isTrackLiked: vi.fn().mockReturnValue(false),
  isTrackReposted: vi.fn().mockReturnValue(false),
  repostedTrackIds: [] as string[],
  itemStats: {} as Record<string, { isReposted?: boolean }>,
  toggleTrack: mockToggleTrack,
  toggleRepost: mockToggleRepost,
};

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn((selector) => {
    if (typeof selector === "function") {
      return selector(mockLikesState);
    }
    return mockLikesState;
  }),
}));

vi.mock("@/stores/history.store", () => ({
  useHistoryStore: vi.fn(() => ({
    addTrack: vi.fn(),
  })),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: "user-123", username: "me", isPro: true },
  })),
}));

vi.mock("@/stores/useDownload", () => ({
  useDownloadStore: vi.fn(() => ({
    isDownloaded: vi.fn().mockReturnValue(false),
    toggleDownload: mockToggleDownload,
  })),
}));

vi.mock("@/services/track.service", () => ({
  getRelatedTracks: vi.fn().mockResolvedValue({ tracks: [] }),
}));

vi.mock("@/pages/[username]/[trackSlug]/components/SharePopup", () => ({
  default: () => <div data-test="share-popup" />,
}));

vi.mock("@/components/playlist/AddToPlaylistModal", () => ({
  default: () => <div data-test="add-to-playlist-modal" />,
}));

vi.mock("@/components/UI/CoverImage", () => ({
  default: (props: any) => <img {...props} />,
}));

const defaultProps = {
  id: "track-1",
  title: "Butterfly Effect",
  artist: "Travis Scott",
  artistUsername: "travisscott",
  trackSlug: "butterfly-effect",
  coverUrl: "https://example.com/cover.jpg",
  plays: 1200,
  likes: 250,
  reposts: 42,
  comments: 7,
};

describe("UI TrackItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLikesState.isTrackLiked.mockReturnValue(false);
    mockLikesState.isTrackReposted.mockReturnValue(false);
    mockLikesState.repostedTrackIds = [];
    mockLikesState.itemStats = {};
  });

  it("renders the track metadata", () => {
    render(<TrackItem {...defaultProps} />);

    expect(screen.getByText("Butterfly Effect")).toBeInTheDocument();
    expect(screen.getByText("Travis Scott")).toBeInTheDocument();
  });

  it("shows Unrepost for already reposted tracks and flips back after click", async () => {
    render(<TrackItem {...defaultProps} initialReposted />);

    fireEvent.mouseEnter(screen.getByTestId("track-item-track-1"));
    fireEvent.click(screen.getByTestId("track-more-button-track-1"));

    expect(screen.getByTestId("track-more-repost-track-1")).toHaveTextContent(
      "Unrepost",
    );

    fireEvent.click(screen.getByTestId("track-more-repost-track-1"));

    await waitFor(() => {
      expect(mockToggleRepost).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("track-more-repost-track-1")).toHaveTextContent(
        "Repost",
      );
    });
  });

  it("shows Download for pro users in the more menu", () => {
    render(<TrackItem {...defaultProps} />);

    fireEvent.mouseEnter(screen.getByTestId("track-item-track-1"));
    fireEvent.click(screen.getByTestId("track-more-button-track-1"));

    expect(screen.getByTestId("track-more-download-track-1")).toHaveTextContent(
      "Download",
    );
  });
});
