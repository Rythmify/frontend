import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import TrackItem from "../../UI/TrackItem";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: Object.assign(
    vi.fn(() => ({
      currentTrack: null,
      isPlaying: false,
      setTrack: vi.fn(),
      togglePlay: vi.fn(),
    })),
    {
      getState: vi.fn(() => ({
        playContext: vi.fn(),
      })),
    }
  ),
}));

const mockLikesStore = {
  isTrackLiked: vi.fn().mockReturnValue(false),
  isTrackReposted: vi.fn().mockReturnValue(false),
  repostedTrackIds: [],
  itemStats: {},
  toggleTrack: vi.fn(),
  toggleRepost: vi.fn().mockResolvedValue(undefined),
};

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn((selector) => {
    if (typeof selector === 'function') return selector(mockLikesStore);
    return mockLikesStore;
  }),
}));

vi.mock("@/stores/history.store", () => ({
  useHistoryStore: vi.fn(() => ({
    addTrack: vi.fn(),
  })),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: Object.assign(
    vi.fn(() => ({
      user: { id: "user-123", username: "me" },
    })),
    {
      subscribe: vi.fn(),
    },
  ),
}));

vi.mock("@/services/engagement.service", () => ({
  repostTrack: vi.fn(),
  removeRepost: vi.fn(),
}));

vi.mock("@/services/track.service", () => ({
  getRelatedTracks: vi.fn(),
}));

vi.mock("./SharePopup", () => ({
  default: () => <div data-test="share-popup" />,
}));

vi.mock("@/components/playlist/AddToPlaylistModal", () => ({
  default: () => <div data-test="add-to-playlist-modal" />,
}));

const defaultProps = {
  id: "1",
  title: "SICKO MODE",
  artist: "Travis Scott",
  artistUsername: "travis-scott",
  trackSlug: "sicko-mode",
  coverUrl: "https://example.com/cover.jpg",
  plays: 120000000,
  likes: 2500000,
  reposts: 150000,
  comments: 15000,
  onUnlike: vi.fn(),
};

describe("TrackItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders artist and title", () => {
    render(<TrackItem {...defaultProps} />);
    expect(screen.getByText("Travis Scott")).toBeInTheDocument();
    expect(screen.getByText("SICKO MODE")).toBeInTheDocument();
  });

  it("renders stats correctly", () => {
    render(<TrackItem {...defaultProps} />);
    expect(screen.getByText("120.0M")).toBeInTheDocument();
    expect(screen.getByText("2.5M")).toBeInTheDocument();
  });

  it("shows like and more buttons on hover", () => {
    render(<TrackItem {...defaultProps} />);
    const container = screen.getByTestId("track-item-1");
    fireEvent.mouseEnter(container);
    expect(screen.getByTestId("track-like-button-1")).toBeInTheDocument();
    expect(screen.getByTestId("track-more-button-1")).toBeInTheDocument();
  });

  it("calls toggleTrack when heart is clicked", () => {
    render(<TrackItem {...defaultProps} />);
    const container = screen.getByTestId("track-item-1");
    fireEvent.mouseEnter(container);
    fireEvent.click(screen.getByTestId("track-like-button-1"));
    expect(mockLikesStore.toggleTrack).toHaveBeenCalled();
  });

  it("navigates to artist page when artist name is clicked", () => {
    render(<TrackItem {...defaultProps} />);
    fireEvent.click(screen.getByTestId("track-artist-1"));
    expect(mockNavigate).toHaveBeenCalledWith("/travis-scott");
  });

  it("navigates to personalised mix page when title is clicked", () => {
    render(<TrackItem {...defaultProps} />);
    fireEvent.click(screen.getByTestId("track-title-1"));
    // Aligned with TrackItem.tsx: /discover/personalised/${trackSlug ?? ""}:${id}
    expect(mockNavigate).toHaveBeenCalledWith("/discover/personalised/sicko-mode:1");
  });

  it("shows more menu and options", () => {
    render(<TrackItem {...defaultProps} />);
    const container = screen.getByTestId("track-item-1");
    fireEvent.mouseEnter(container);
    fireEvent.click(screen.getByTestId("track-more-button-1"));
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
    expect(screen.getByText("Add to Playlist")).toBeInTheDocument();
  });

  it("redirects non-pro users to premium when download is clicked", () => {
    render(<TrackItem {...defaultProps} />);
    const container = screen.getByTestId("track-item-1");
    fireEvent.mouseEnter(container);
    fireEvent.click(screen.getByTestId("track-more-button-1"));
    fireEvent.click(screen.getByTestId("track-more-download-1"));
    expect(mockNavigate).toHaveBeenCalledWith("/premium");
  });

  it("shows Unrepost when the track is already reposted", () => {
    render(<TrackItem {...defaultProps} initialReposted />);
    const container = screen.getByTestId("track-item-1");
    fireEvent.mouseEnter(container);
    fireEvent.click(screen.getByTestId("track-more-button-1"));
    expect(screen.getByTestId("track-more-repost-1")).toHaveTextContent(
      "Unrepost",
    );
  });

  it("switches back to Repost when unreposted", async () => {
    render(<TrackItem {...defaultProps} initialReposted />);
    const container = screen.getByTestId("track-item-1");
    fireEvent.mouseEnter(container);
    fireEvent.click(screen.getByTestId("track-more-button-1"));
    fireEvent.click(screen.getByTestId("track-more-repost-1"));
    expect(mockLikesStore.toggleRepost).toHaveBeenCalled();
    expect(screen.getByTestId("track-more-repost-1")).toHaveTextContent(
      "Repost",
    );
  });
});
