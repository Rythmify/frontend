import { describe, expect, it, vi, beforeEach } from "vitest";
import { getFeaturedArtists } from "@/services/featuredArtists.service";
import { getUserById } from "@/services/user.service";

vi.mock("@/services/user.service", () => ({
  getUserById: vi.fn(),
}));

describe("getFeaturedArtists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches full profiles and marks followed artists", async () => {
    vi.mocked(getUserById).mockImplementation(async (id: string) => {
      if (id === "artist-1") {
        return {
          id: "artist-1",
          username: "artist-1",
          display_name: "Artist One",
          profile_picture: "https://cdn.example.com/artist-1.jpg",
          followers_count: 120,
        } as any;
      }

      return {
        id: "artist-2",
        username: "artist-2",
        display_name: "Artist Two",
        profile_picture: null,
        followers_count: 45,
      } as any;
    });

    const artists = await getFeaturedArtists(
      [
        { artist_id: "artist-1" },
        { artist_id: "artist-2" },
        { artist_id: "artist-1" },
      ],
      { following_ids: ["artist-1"] } as any,
    );

    expect(getUserById).toHaveBeenCalledTimes(2);
    expect(artists).toEqual([
      expect.objectContaining({
        id: "artist-1",
        username: "artist-1",
        displayName: "Artist One",
        avatarUrl: "https://cdn.example.com/artist-1.jpg",
        followerCount: 120,
        trackCount: 2,
        isFollowing: true,
      }),
      expect.objectContaining({
        id: "artist-2",
        username: "artist-2",
        displayName: "Artist Two",
        followerCount: 45,
        trackCount: 1,
        isFollowing: false,
      }),
    ]);
  });
});
