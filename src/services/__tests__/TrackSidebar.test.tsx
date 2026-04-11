import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TrackSidebar from "../../pages/[username]/[trackSlug]/components/TrackSidebar";
import type { Track } from "../../types/track";
import type { MockUser } from "../../services/mocks/users";

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("../../services/mocks/User.service", () => ({
  followUser: vi.fn().mockResolvedValue({}),
  unfollowUser: vi.fn().mockResolvedValue({}),
}));

const track: Track = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Test Song",
  artistName: "Test Artist",
  artistUsername: "test-artist",
  coverUrl: "",
  genre: "Pop",
  likeCount: 100,
  repostCount: 5,
  playCount: 2000,
  commentCount: 10,
  duration: "3:00",
  postedAt: "1 day ago",
  waveformData: [],
  audioUrl: "/audio/test.mp3",
  trackSlug: "test-song",
  madeFor: "Shahd",
};

const artists: MockUser[] = [
  {
    id: 1,
    username: "artist-one",
    displayName: "Artist One",
    avatarUrl: "https://picsum.photos/seed/a1/100/100",
    followerCount: 12000,
    isFollowing: false,
    trackCount: 5,
  },
];

describe("TrackSidebar", () => {
  it("renders the sidebar", () => {
    render(<TrackSidebar track={track} featuredArtists={artists} />);
    expect(screen.getByTestId("track-sidebar")).toBeInTheDocument();
  });

  it("shows the track title in 'Based on'", () => {
    render(<TrackSidebar track={track} featuredArtists={artists} />);
    expect(screen.getByTestId("sidebar-based-on")).toHaveTextContent("Test Song");
  });

  it("shows the 'Made for' section when set", () => {
    render(<TrackSidebar track={track} featuredArtists={artists} />);
    expect(screen.getByTestId("sidebar-made-for")).toHaveTextContent("Shahd");
  });

  it("hides 'Made for' when not set", () => {
    render(<TrackSidebar track={{ ...track, madeFor: undefined }} featuredArtists={artists} />);
    expect(screen.queryByTestId("sidebar-made-for")).not.toBeInTheDocument();
  });

  it("renders the featured artists section", () => {
    render(<TrackSidebar track={track} featuredArtists={artists} />);
    expect(screen.getByTestId("sidebar-artists-featured")).toBeInTheDocument();
  });

  it("renders a card for each featured artist", () => {
    render(<TrackSidebar track={track} featuredArtists={artists} />);
    expect(screen.getByTestId("artist-card-artist-one")).toBeInTheDocument();
  });

  it("handles an empty artists list without crashing", () => {
    render(<TrackSidebar track={track} featuredArtists={[]} />);
    expect(screen.getByTestId("track-sidebar")).toBeInTheDocument();
  });
});
