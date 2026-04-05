import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FeedItemCard from "./FeedItemCard";
import type { TrackFeedItem, PlaylistFeedItem } from "@/types/feedItem";

// ─── Mock Setup ───────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/components/UI/TrackItem", () => ({
  default: () => <div data-test="mock-track-item" />,
}));

// ─── Fixtures ─────────────────────────────────────────────

const trackItem: TrackFeedItem = {
  id: "f1",
  type: "repost",
  content_type: "track",
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  user: {
    id: 1,
    username: "nourabosaif04",
    displayName: "NourAbosaif04",
    avatar: "https://example.com/avatar.jpg",
    followers: 320,
  },
  track: {
    id: 1,
    title: "Test Track",
    artistName: "Test Artist",
    artistUsername: "test-artist",
    coverUrl: "https://example.com/cover.jpg",
    genre: "R&B",
    likeCount: 100,
    repostCount: 10,
    playCount: 1000,
    commentCount: 5,
    duration: "3:00",
    postedAt: "2026-01-01T00:00:00Z",
    waveformData: [],
    audioUrl: "",
  },
};

const playlistItem: PlaylistFeedItem = {
  id: "f2",
  type: "post",
  content_type: "playlist",
  created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  user: {
    id: 2,
    username: "alyaa-moh",
    displayName: "Alyaa Mohamed",
    avatar: "https://example.com/avatar2.jpg",
    followers: 500,
  },
  playlist: {
    id: 1,
    title: "Test Playlist",
    artistName: "Alyaa Mohamed",
    artistUsername: "alyaa-moh",
    coverUrl: "https://example.com/cover2.jpg",
    duration: "4:13",
    likeCount: 12,
    repostCount: 3,
    playCount: 1980,
    commentCount: 7,
    waveformData: [],
    audioUrl: "",
    trackCount: 5,
    tracks: [],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
};

// ─── Test Suite ───────────────────────────────────────────

describe("FeedItemCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Avatar ──────────────────────────────────────────────

  it("renders avatar with correct src", () => {
    render(<FeedItemCard item={trackItem} />);
    const avatar = screen.getByTestId("feed-item-avatar-f1");
    expect(avatar).toHaveAttribute("src", trackItem.user.avatar);
  });

  it("renders avatar with correct alt text", () => {
    render(<FeedItemCard item={trackItem} />);
    const avatar = screen.getByTestId("feed-item-avatar-f1");
    expect(avatar).toHaveAttribute("alt", trackItem.user.displayName);
  });

  it("navigates to user profile when avatar is clicked", () => {
    render(<FeedItemCard item={trackItem} />);
    fireEvent.click(screen.getByTestId("feed-item-avatar-f1"));
    expect(mockNavigate).toHaveBeenCalledWith(`/${trackItem.user.username}`);
  });

  // ── User header ─────────────────────────────────────────

  it("renders display name", () => {
    render(<FeedItemCard item={trackItem} />);
    expect(screen.getByTestId("feed-item-username-f1")).toHaveTextContent(
      "NourAbosaif04",
    );
  });

  it("navigates to user profile when display name is clicked", () => {
    render(<FeedItemCard item={trackItem} />);
    fireEvent.click(screen.getByTestId("feed-item-username-f1"));
    expect(mockNavigate).toHaveBeenCalledWith(`/${trackItem.user.username}`);
  });

  // ── Repost icon ─────────────────────────────────────────

  it("shows repost icon when type is repost", () => {
    render(<FeedItemCard item={trackItem} />);
    const header = screen.getByTestId("feed-item-header-f1");
    expect(header.querySelector(".fa-retweet")).toBeInTheDocument();
  });

  it("does not show repost icon when type is post", () => {
    render(<FeedItemCard item={playlistItem} />);
    const header = screen.getByTestId("feed-item-header-f2");
    expect(header.querySelector(".fa-retweet")).not.toBeInTheDocument();
  });

  // ── Action / content labels ──────────────────────────────

  it("shows 'reposted' label for repost type", () => {
    render(<FeedItemCard item={trackItem} />);
    expect(screen.getByTestId("feed-item-header-f1")).toHaveTextContent(
      "reposted",
    );
  });

  it("shows 'posted' label for post type", () => {
    render(<FeedItemCard item={playlistItem} />);
    expect(screen.getByTestId("feed-item-header-f2")).toHaveTextContent(
      "posted",
    );
  });

  it("shows 'track' content label for track items", () => {
    render(<FeedItemCard item={trackItem} />);
    expect(screen.getByTestId("feed-item-header-f1")).toHaveTextContent(
      "a track",
    );
  });

  it("shows 'playlist' content label for playlist items", () => {
    render(<FeedItemCard item={playlistItem} />);
    expect(screen.getByTestId("feed-item-header-f2")).toHaveTextContent(
      "a playlist",
    );
  });

  it("shows time ago in header", () => {
    render(<FeedItemCard item={trackItem} />);
    expect(screen.getByTestId("feed-item-header-f1")).toHaveTextContent("ago");
  });

  // ── Card body ────────────────────────────────────────────

  //replace trackitem with real track component
  it("renders TrackItem for track feed items", () => {
    render(<FeedItemCard item={trackItem} />);
    expect(screen.getByTestId("mock-track-item")).toBeInTheDocument();
  });

  it("renders playlist placeholder for playlist feed items", () => {
    render(<FeedItemCard item={playlistItem} />);
    expect(screen.getByTestId("feed-item-body-f2")).toHaveTextContent(
      'Playlist card placeholder — "Test Playlist"',
    );
  });

  it("does not render playlist placeholder for track items", () => {
    render(<FeedItemCard item={trackItem} />);
    expect(
      screen.queryByText(/Playlist card placeholder/),
    ).not.toBeInTheDocument();
  });
});