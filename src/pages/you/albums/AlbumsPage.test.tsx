import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AlbumsPage from "./AlbumsPage";
import { getAlbumsForYou } from "@/services/api/discover.service";
import {
  getLikedPlaylists,
  getMyPlaylists,
} from "@/services/api/playlist/playlist.service";
import { getUserById } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth.store";
import { useLikesStore } from "@/stores/likes.store";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getMyPlaylists: vi.fn(),
  getLikedPlaylists: vi.fn(),
}));

vi.mock("@/services/api/discover.service", () => ({
  getAlbumsForYou: vi.fn(),
  getAlbumPreviewTrackId: (album: any) => album.preview_track?.id ?? null,
}));

vi.mock("@/services/user.service", () => ({
  getUserById: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(),
}));

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({ title, children }: any) => (
    <section data-test={`carousel-${String(title).toLowerCase().replace(/\s+/g, "-")}`}>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  ),
}));

vi.mock("@/components/playlist/SetsHeader", () => ({
  default: (props: any) => (
    <div data-test="sets-header">
      <input
        data-test="filter-input"
        value={props.filterText}
        onChange={(e) => props.setFilterText(e.target.value)}
      />
      <button data-test="filter-created" onClick={() => props.setActiveFilter("Created")}>
        Created
      </button>
      <button data-test="filter-liked" onClick={() => props.setActiveFilter("Liked")}>
        Liked
      </button>
    </div>
  ),
}));

vi.mock("@/components/UI/PlaylistCard/PlaylistCard", () => ({
  default: ({ item }: any) => (
    <div
      data-test="album-card"
      data-owner={item.owner}
      data-owner-username={item.ownerUsername ?? ""}
      data-display-name={item.ownerDisplayName ?? ""}
      data-cover={item.coverUrl ?? ""}
      data-liked={String(item.isLiked)}
      data-private={String(item.isPrivate)}
    >
      {item.title}
    </div>
  ),
}));

const mockResponse = (items: any[]) => ({
  data: {
    items,
    meta: { limit: items.length, offset: 0, total: items.length },
  },
});

const createdAlbum = {
  playlist_id: "created-1",
  owner_user_id: "owner-1",
  name: "Created Album",
  description: null,
  is_public: true,
  cover_image: "https://cdn.example.com/created.jpg",
  is_album_view: true,
  subtype: "album",
  track_count: 2,
  like_count: 1,
  created_at: "2026-04-11T00:00:00Z",
};

const likedAlbum = {
  playlist_id: "liked-1",
  owner_user_id: "owner-2",
  name: "Liked Album",
  description: null,
  is_public: true,
  cover_image: "https://cdn.example.com/liked.jpg",
  is_album_view: true,
  subtype: "album",
  track_count: 4,
  like_count: 3,
  created_at: "2026-04-11T00:00:00Z",
};

const albumsForYou = [
  {
    id: "discover-1",
    name: "Discover Album",
    owner_id: "artist-1",
    owner_name: "Artist One",
    cover_image: "https://cdn.example.com/discover.jpg",
    track_count: 8,
    like_count: 3,
    created_at: "2026-04-11T00:00:00Z",
    preview_track: {
      id: "track-1",
      title: "Preview Track",
      cover_image: "https://cdn.example.com/track.jpg",
      duration: 120,
      genre_name: "Pop",
      play_count: 10,
      like_count: 1,
      repost_count: 0,
      user_id: "artist-1",
      artist_name: "Artist One",
      stream_url: "https://cdn.example.com/audio.mp3",
      created_at: "2026-04-11T00:00:00Z",
    },
    is_liked_by_me: true,
  },
];

describe("AlbumsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "owner-1", username: "owner", displayName: "Owner" },
    } as any);
    vi.mocked(useLikesStore).mockImplementation((selector: any) =>
      selector({
        likedAlbums: [],
        seedAlbums: vi.fn(),
      }),
    );
    vi.mocked(getUserById).mockResolvedValue({
      id: "owner-1",
      username: "owner",
      display_name: "Owner",
    } as any);
    vi.mocked(getAlbumsForYou).mockResolvedValue({
      data: albumsForYou as any,
      source: "followed_artists",
      pagination: { total: 1, limit: 1, offset: 0 },
    } as any);
  });

  it("renders all albums in one carousel and filters by created or liked", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(
      mockResponse([createdAlbum]) as any,
    );
    vi.mocked(getLikedPlaylists).mockResolvedValue(
      mockResponse([likedAlbum]) as any,
    );

    render(
      <MemoryRouter>
        <AlbumsPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getAllByTestId("album-card")).toHaveLength(2));
    expect(screen.getByText("Created Album")).toBeInTheDocument();
    expect(screen.getByText("Liked Album")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filter-created"));
    await waitFor(() => expect(screen.getAllByTestId("album-card")).toHaveLength(1));
    expect(screen.getByText("Created Album")).toBeInTheDocument();
    expect(screen.queryByText("Liked Album")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filter-liked"));
    await waitFor(() => expect(screen.getAllByTestId("album-card")).toHaveLength(1));
    expect(screen.queryByText("Created Album")).not.toBeInTheDocument();
    expect(screen.getByText("Liked Album")).toBeInTheDocument();
  });

  it("shows loading and empty/error states", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(mockResponse([]) as any);
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockResponse([]) as any);
    vi.mocked(getUserById).mockResolvedValueOnce(null as any);

    render(
      <MemoryRouter>
        <AlbumsPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("albums-page-content")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("You haven't liked any albums yet.")).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByTestId("filter-input"), {
      target: { value: "missing" },
    });
    expect(screen.getByText("No albums match your search.")).toBeInTheDocument();
  });

  it("shows an error when album fetch fails", async () => {
    vi.mocked(getMyPlaylists).mockRejectedValueOnce(new Error("boom"));
    vi.mocked(getLikedPlaylists).mockRejectedValueOnce(new Error("boom"));

    render(
      <MemoryRouter>
        <AlbumsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText("Failed to load albums.")).toBeInTheDocument(),
    );
  });

  it("requests owner lookup for created albums", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(
      mockResponse([
        {
          ...createdAlbum,
          owner_user_id: "owner-1",
        },
      ]) as any,
    );
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockResponse([]) as any);
    vi.mocked(getUserById).mockResolvedValue({
      id: "owner-1",
      username: "owner-user",
      display_name: "Resolved Owner",
    } as any);

    render(
      <MemoryRouter>
        <AlbumsPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(getUserById).toHaveBeenCalledWith("owner-1"));
    expect(getUserById).toHaveBeenCalledWith("owner-1");
    expect(screen.getByText("Created Album")).toHaveAttribute("data-owner", "owner-1");
    expect(screen.getByText("Created Album")).toHaveAttribute("data-owner-username", "owner");
  });

  it("handles created and liked filters separately", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(mockResponse([createdAlbum]) as any);
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockResponse([likedAlbum]) as any);

    render(
      <MemoryRouter>
        <AlbumsPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getAllByTestId("album-card")).toHaveLength(2));
    fireEvent.click(screen.getByTestId("filter-created"));
    expect(screen.getAllByTestId("album-card")).toHaveLength(1);
    fireEvent.click(screen.getByTestId("filter-liked"));
    expect(screen.getAllByTestId("album-card")).toHaveLength(1);
  });

  it("falls back to the current user username when the owner lookup fails", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(
      mockResponse([
        {
          ...createdAlbum,
          owner_user_id: "owner-1",
        },
      ]) as any,
    );
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockResponse([]) as any);
    vi.mocked(getUserById).mockRejectedValueOnce(new Error("missing"));

    render(
      <MemoryRouter>
        <AlbumsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText("Created Album")).toHaveAttribute(
        "data-owner-username",
        "owner",
      ),
    );
    expect(screen.getByText("Created Album")).toHaveAttribute(
      "data-owner-username",
      "owner",
    );
  });

  it("includes store liked albums in the liked filter", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(mockResponse([createdAlbum]) as any);
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockResponse([]) as any);
    vi.mocked(useLikesStore).mockImplementation((selector: any) =>
      selector({
        likedAlbums: [likedAlbum],
      }),
    );

    render(
      <MemoryRouter>
        <AlbumsPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Created Album")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("filter-liked"));
    await waitFor(() => expect(screen.getByText("Liked Album")).toBeInTheDocument());
    expect(screen.getByText("Liked Album")).toHaveAttribute(
      "data-liked",
      "true",
    );
  });
});
