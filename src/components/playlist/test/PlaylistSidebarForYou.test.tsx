import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlaylistSidebarForYou from "../Made for you/PlaylistSidebarForYou";

vi.mock("@/components/UI/FollowButton", () => ({
  default: ({
    username,
    isFollowingOverride,
  }: {
    username: string;
    isFollowingOverride?: boolean;
  }) => (
    <button data-test={`follow-button-${username}`}>
      {isFollowingOverride ? "Following" : "Follow"}
    </button>
  ),
}));

vi.mock("@/components/UI/GoMobile", () => ({
  default: () => <div data-test="go-mobile-section" />,
}));

const mockPlaylist = {
  playlist_id: "pl-1",
  like_count: 24,
  repost_count: 3,
} as any;

const featuredArtists = [
  {
    id: 1,
    username: "artist-one",
    displayName: "Artist One",
    avatarUrl: "https://example.com/a.jpg",
    followerCount: 1200,
    trackCount: 14,
    isFollowing: false,
  },
  {
    id: 2,
    username: "artist-two",
    displayName: "Artist Two",
    avatarUrl: "https://example.com/b.jpg",
    followerCount: 8800,
    trackCount: 8,
    isFollowing: true,
  },
] as any;

describe("PlaylistSidebarForYou", () => {
  it("renders featured artists with the shared follow button", () => {
    render(
      <MemoryRouter>
        <PlaylistSidebarForYou
          playlist={mockPlaylist}
          featuredArtists={featuredArtists}
          showLikes
          showReposts
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("sidebar-artists-featured")).toBeInTheDocument();
    expect(screen.getByTestId("follow-button-artist-one")).toHaveTextContent(
      "Follow",
    );
    expect(screen.getByTestId("follow-button-artist-two")).toHaveTextContent(
      "Following",
    );
    expect(screen.getByTestId("sidebar-playlist-likes")).toHaveTextContent(
      "24 Likes",
    );
    expect(screen.getByTestId("sidebar-playlist-reposts")).toHaveTextContent(
      "3 Reposts",
    );
  });
});
