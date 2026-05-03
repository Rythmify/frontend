import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FeedItemCard from "./FeedItemCard";
import type { TrackFeedItem, PlaylistFeedItem } from "@/types/feedItem";

// ─── Mock Setup ───────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/components/track/TrackCard", () => ({
  default: () => <div data-test="mock-track-card" />,
}));

vi.mock("@/components/playlist/PlaylistComponent", () => ({
  default: () => <div data-test="mock-playlist-component" />,
}));

vi.mock("@/components/UI/UserAvatar", () => ({
  default: ({ src, alt, dataTest, onClick }: any) => (
    <img src={src} alt={alt} data-test={dataTest} onClick={onClick} />
  ),
}));

// ─── Fixtures ─────────────────────────────────────────────

const trackItem: TrackFeedItem = {
  id: "f1",
  type: "repost",
  content_type: "track",
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  user: {
    id: "687293a0-f8d2-4e5a-9c71-2b0d3e1f4a5c",
    username: "nourabosaif04",
    displayName: "NourAbosaif04",
    avatar: "https://example.com/avatar.jpg",
    followers: 320,
  },
  track: {
    id: "f5e4d3c2-b1a0-4987-8765-43210abcdef7",
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
    id: "687293a0-f8d2-4e5a-9c71-2b0d3e1f4a5c",
    username: "alyaa-moh",
    displayName: "Alyaa Mohamed",
    avatar: "https://example.com/avatar2.jpg",
    followers: 500,
  },
  playlist: {
    id: "1",
    title: "Test Playlist",
    creatorName: "Alyaa Mohamed",
    creatorUsername: "alyaa-moh",
    coverUrl: "https://example.com/cover2.jpg",
    postedAt: "4 hours ago",
    likeCount: 12,
    repostCount: 3,
    trackCount: 5,
    playlistSlug: "test-playlist",
    tracks: [],
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

  it("shows days ago for items older than 24 hours", () => {
    const oldItem: TrackFeedItem = {
      ...trackItem,
      id: "f3",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    };
    render(<FeedItemCard item={oldItem} />);
    expect(screen.getByTestId("feed-item-header-f3")).toHaveTextContent("2 days ago");
  });

  // ── Card body ────────────────────────────────────────────

  it("renders TrackCard for track feed items", () => {
    render(<FeedItemCard item={trackItem} />);
    expect(screen.getByTestId("mock-track-card")).toBeInTheDocument();
  });

  it("renders PlaylistComponent for playlist feed items", () => {
    render(<FeedItemCard item={playlistItem} />);
    expect(screen.getByTestId("mock-playlist-component")).toBeInTheDocument();
  });

  it("does not render PlaylistComponent for track items", () => {
    render(<FeedItemCard item={trackItem} />);
    expect(
      screen.queryByTestId("mock-playlist-component"),
    ).not.toBeInTheDocument();
  });

  it("does not render TrackCard for playlist items", () => {
    render(<FeedItemCard item={playlistItem} />);
    expect(screen.queryByTestId("mock-track-card")).not.toBeInTheDocument();
  });

  // ── Border ───────────────────────────────────────────────

  it("applies border-b to track items", () => {
    render(<FeedItemCard item={trackItem} />);
    const card = screen.getByTestId("feed-item-f1");
    expect(card.className).toContain("border-b");
  });

  it("does not apply border-b to playlist items (PlaylistComponent provides its own)", () => {
    render(<FeedItemCard item={playlistItem} />);
    const card = screen.getByTestId("feed-item-f2");
    expect(card.className).not.toContain("border-b");
  });
});
