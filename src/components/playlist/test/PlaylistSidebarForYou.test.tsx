import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlaylistSidebarForYou from "../Made for you/PlaylistSidebarForYou";
import {
  getPlaylistLikers,
  getPlaylistReposters,
} from "@/services/api/playlist/playlist.service";
import { getUserById } from "@/services/user.service";

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

vi.mock("@/services/user.service", () => ({
  getUserById: vi.fn(),
}));

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getPlaylistLikers: vi.fn(),
  getPlaylistReposters: vi.fn(),
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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserById).mockResolvedValue({
      id: "artist-one",
      username: "artist-one",
      display_name: "Artist One",
    } as any);
    vi.mocked(getPlaylistLikers).mockResolvedValue({
      data: [
        {
          user_id: "u-1",
          username: "liker-one",
          display_name: "Liker One",
          profile_picture: null,
        },
      ],
    } as any);
    vi.mocked(getPlaylistReposters).mockResolvedValue({
      data: [
        {
          user_id: "u-2",
          username: "reposter-one",
          display_name: "Reposter One",
          profile_picture: null,
        },
      ],
    } as any);
  });

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
    expect(screen.getByTestId("follow-button-artist-one")).toBeInTheDocument();
    expect(screen.getByTestId("follow-button-artist-two")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-liked-by")).toHaveTextContent(
      "24 Likes",
    );
    expect(screen.getByTestId("sidebar-reposted-by")).toHaveTextContent(
      "3 Reposts",
    );
  });
});
