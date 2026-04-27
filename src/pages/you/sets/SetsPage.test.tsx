import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SetsPage from "./SetsPage";
import { getHome } from "@/services/api/discover.service";
import {
  getLikedPlaylists,
  getMyPlaylists,
} from "@/services/api/playlist/playlist.service";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getMyPlaylists: vi.fn(),
  getLikedPlaylists: vi.fn(),
}));

vi.mock("@/services/api/discover.service", () => ({
  getHome: vi.fn(),
}));

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({ children }: any) => <div data-test="carousel">{children}</div>,
}));

vi.mock("@/components/UI/PlaylistCard/PlaylistCard", () => ({
  default: ({ item }: any) => (
    <div
      data-test="playlist-card"
      data-liked={String(item.isLiked)}
      data-private={String(item.isPrivate)}
      data-cover={item.coverUrl ?? ""}
    >
      {item.title}
    </div>
  ),
}));

vi.mock("@/components/UI/MixCard/MixCard", () => ({
  default: ({ mix }: any) => (
    <div
      data-test="mix-card"
      data-cover={mix.cover_image ?? ""}
    >
      {mix.label ?? mix.id}
    </div>
  ),
}));

vi.mock("@/components/UI/MadeForYouCard/MadeForYouCard", () => ({
  default: ({ item }: any) => (
    <div data-test="made-for-you-card">{item.title}</div>
  ),
}));

vi.mock("@/components/UI/GenreCard/GenreCard", () => ({
  default: ({ item }: any) => <div data-test="genre-card">{item.genre}</div>,
}));

vi.mock("@/components/playlist/SetsHeader", () => ({
  default: (props: any) => (
    <div data-test="sets-header">
      <input
        data-test="filter-input"
        value={props.filterText}
        onChange={(e) => props.setFilterText(e.target.value)}
      />
      <button
        data-test="filter-created"
        onClick={() => props.setActiveFilter("Created")}
      >
        Created
      </button>
      <button
        data-test="filter-liked"
        onClick={() => props.setActiveFilter("Liked")}
      >
        Liked
      </button>
    </div>
  ),
}));

const mockResponse = (items: any[]) => ({
  data: {
    items,
    meta: { limit: items.length, offset: 0, total: items.length },
  },
});

const createdPlaylist = {
  playlist_id: "pl-created",
  owner_user_id: "owner-1",
  name: "Created Mix",
  description: null,
  is_public: true,
  cover_image: "https://cdn.example.com/created.jpg",
  created_at: "2026-04-11T00:00:00Z",
  track_count: 1,
  like_count: 0,
};

const likedPlaylist = {
  playlist_id: "pl-liked",
  owner_user_id: "owner-2",
  name: "Liked Jam",
  description: null,
  is_public: false,
  cover_image: null,
  created_at: "2026-04-11T00:00:00Z",
  track_count: 2,
  like_count: 1,
};

const sharedPlaylist = {
  playlist_id: "pl-shared",
  owner_user_id: "owner-3",
  name: "Shared Groove",
  description: null,
  is_public: true,
  cover_image: null,
  created_at: "2026-04-11T00:00:00Z",
  track_count: 3,
  like_count: 4,
};

const homeData = {
  mixed_for_you: [
    {
      id: "mix-1",
      mix_id: "mix-1",
      label: "Mix One",
      flavor: "listening_history",
      genre_name: "Pop",
      cover_image: "https://cdn.example.com/mix-cover.jpg",
      track_count: 8,
      generated_at: "2026-04-11T00:00:00Z",
      preview_track: {
        id: "track-1",
        title: "Track 1",
        cover_image: null,
        duration: 120,
        genre_name: "Pop",
        play_count: 10,
        like_count: 1,
        repost_count: 0,
        user_id: "artist-1",
        artist_name: "Artist 1",
        stream_url: null,
        created_at: "2026-04-11T00:00:00Z",
      },
      is_liked_by_me: true,
    },
  ],
  trending_by_genre: {
    genres: [
      {
        genre_id: "genre-liked",
        genre_name: "Liked Genre",
        preview_track: {
          id: "track-genre",
          title: "Track Genre",
          cover_image: null,
          duration: 120,
          genre_name: "Genre",
          play_count: 10,
          like_count: 1,
          repost_count: 0,
          user_id: "artist-genre",
          artist_name: "Artist Genre",
          stream_url: null,
          created_at: "2026-04-11T00:00:00Z",
        },
        is_liked: true,
      },
    ],
    initial_tab: {
      genre_id: "genre-1",
      genre_name: "Hip-Hop",
      tracks: [],
    },
  },
  made_for_you: {
    daily_mix: {
      id: "daily-1",
      label: "Daily Mix",
      description: "Daily mix",
      track_count: 5,
      refreshes_at: "2026-04-11T00:00:00Z",
      cover_url: null,
      preview_track: {
        id: "track-3",
        title: "Track 3",
        cover_image: null,
        duration: 120,
        genre_name: "Pop",
        play_count: 10,
        like_count: 1,
        repost_count: 0,
        user_id: "artist-3",
        artist_name: "Artist 3",
        stream_url: null,
        created_at: "2026-04-11T00:00:00Z",
      },
      is_liked_by_me: true,
    },
    weekly_mix: {
      id: "weekly-1",
      label: "Weekly Mix",
      description: "Weekly mix",
      track_count: 6,
      refreshes_at: "2026-04-11T00:00:00Z",
      cover_url: null,
      preview_track: {
        id: "track-4",
        title: "Track 4",
        cover_image: null,
        duration: 120,
        genre_name: "Pop",
        play_count: 10,
        like_count: 1,
        repost_count: 0,
        user_id: "artist-4",
        artist_name: "Artist 4",
        stream_url: null,
        created_at: "2026-04-11T00:00:00Z",
      },
      is_liked_by_me: false,
    },
  },
  more_of_what_you_like: null,
  curated: null,
  discover_with_stations: [],
  artists_to_watch: [],
};

describe("SetsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getHome).mockResolvedValue(homeData as any);
  });

  it("renders loading skeletons while fetching", () => {
    vi.mocked(getMyPlaylists).mockReturnValue(new Promise(() => {}) as any);
    vi.mocked(getLikedPlaylists).mockReturnValue(new Promise(() => {}) as any);
    vi.mocked(getHome).mockReturnValue(new Promise(() => {}) as any);

    const { container } = render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(6);
  });

  it("renders deduped playlists and maps card state", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(
      mockResponse([createdPlaylist, sharedPlaylist]) as any,
    );
    vi.mocked(getLikedPlaylists).mockResolvedValue(
      mockResponse([sharedPlaylist, likedPlaylist]) as any,
    );
    vi.mocked(getHome).mockResolvedValue(homeData as any);

    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
    expect(screen.getAllByTestId("playlist-card")).toHaveLength(3),
    );
    expect(screen.getAllByTestId("mix-card")).toHaveLength(1);
    expect(screen.getAllByTestId("made-for-you-card")).toHaveLength(1);
    expect(screen.getAllByTestId("genre-card")).toHaveLength(1);
    expect(screen.getByTestId("mix-card")).toHaveAttribute(
      "data-cover",
      "https://cdn.example.com/mix-cover.jpg",
    );

    expect(screen.getByText("Created Mix")).toHaveAttribute(
      "data-liked",
      "false",
    );
    expect(screen.getByText("Created Mix")).toHaveAttribute(
      "data-private",
      "false",
    );
    expect(screen.getByText("Created Mix")).toHaveAttribute(
      "data-cover",
      "https://cdn.example.com/created.jpg",
    );
    expect(screen.getByText("Shared Groove")).toHaveAttribute(
      "data-liked",
      "true",
    );
    expect(screen.getByText("Liked Jam")).toHaveAttribute(
      "data-private",
      "true",
    );
  });

  it("filters by created and liked playlists", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(
      mockResponse([createdPlaylist, sharedPlaylist]) as any,
    );
    vi.mocked(getLikedPlaylists).mockResolvedValue(
      mockResponse([sharedPlaylist, likedPlaylist]) as any,
    );
    vi.mocked(getHome).mockResolvedValue(homeData as any);

    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getAllByTestId("playlist-card")).toHaveLength(3),
    );

    fireEvent.click(screen.getByTestId("filter-created"));
    expect(screen.getAllByTestId("playlist-card")).toHaveLength(2);
    expect(screen.queryByText("Liked Jam")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mix-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("made-for-you-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("genre-card")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filter-liked"));
    expect(screen.getAllByTestId("playlist-card")).toHaveLength(2);
    expect(screen.queryByText("Created Mix")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("mix-card")).toHaveLength(1);
    expect(screen.getAllByTestId("made-for-you-card")).toHaveLength(1);
    expect(screen.getAllByTestId("genre-card")).toHaveLength(1);
  });

  it("shows the empty search message when no playlists match", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(mockResponse([createdPlaylist]) as any);
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockResponse([]) as any);
    vi.mocked(getHome).mockResolvedValue(homeData as any);

    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText("Created Mix")).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByTestId("filter-input"), {
      target: { value: "does-not-match" },
    });

    expect(
      screen.getByText(/No playlists match your search/i),
    ).toBeInTheDocument();
  });

  it("shows the load error when playlists fail to fetch", async () => {
    vi.mocked(getMyPlaylists).mockRejectedValue(new Error("network"));
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockResponse([]) as any);
    vi.mocked(getHome).mockResolvedValue(homeData as any);

    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to load your library/i),
      ).toBeInTheDocument(),
    );
  });
});
