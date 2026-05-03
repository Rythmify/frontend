import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LibraryPage from "@/pages/you/library/LibraryPage";

// ─── Mocks ────────────────────────────────────────────────

import { configure } from "@testing-library/react";

configure({ testIdAttribute: "data-test" });

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual };
});

vi.mock("@/services/user.service", () => ({
  getUserById: vi.fn().mockResolvedValue({ followers_count: 100 }),
}));
vi.mock("@/stores/likes.store", () => ({
  useLikesStore: Object.assign(vi.fn(), {
    subscribe: vi.fn(),
    getState: vi.fn(() => ({})),
    setState: vi.fn(),
  }),
}));
vi.mock("@/stores/history.store", () => ({
  useHistoryStore: Object.assign(vi.fn(), {
    subscribe: vi.fn(),
    getState: vi.fn(() => ({})),
    setState: vi.fn(),
  }),
}));
vi.mock("@/stores/auth.store", () => ({
  useAuthStore: Object.assign(vi.fn(), {
    subscribe: vi.fn(),
    getState: vi.fn(() => ({})),
    setState: vi.fn(),
  }),
}));

vi.mock("@/services/api/discover.service", () => ({
  getRecentlyPlayed: vi.fn(),
}));
vi.mock("@/services/api/library.service", () => ({
  getMyPlaylists: vi.fn(),
  getMyFollowing: vi.fn(),
}));
vi.mock("@/services/api/playlist/playlist.service", () => ({
  getMyPlaylists: vi.fn(),
  getLikedPlaylists: vi.fn(),
}));
vi.mock("@/services/mocks/discover", () => ({
  mockRecentlyPlayedTracks: [
    {
      id: "mock-1",
      title: "Mock Track 1",
      artistName: "Artist",
      coverUrl: "",
      genre: "",
      likeCount: 0,
      repostCount: 0,
      playCount: 0,
      commentCount: 0,
      duration: "0:00",
      postedAt: "",
      audioUrl: "",
      waveformData: [],
    },
    {
      id: "mock-2",
      title: "Mock Track 2",
      artistName: "Artist",
      coverUrl: "",
      genre: "",
      likeCount: 0,
      repostCount: 0,
      playCount: 0,
      commentCount: 0,
      duration: "0:00",
      postedAt: "",
      audioUrl: "",
      waveformData: [],
    },
  ],
}));

vi.mock("@/components/UI/card/Card", () => ({
  default: ({ track }: { track: { id: string } }) => (
    <div data-test={`track-card-${track.id}`} />
  ),
}));
vi.mock("@/components/UI/StationCard/StationCard", () => ({
  default: ({ station }: { station: { id: string } }) => (
    <div data-test={`station-card-${station.id}`} />
  ),
}));
vi.mock("@/components/UI/MixCard/MixCard", () => ({
  default: ({ mix }: { mix: { id: string } }) => (
    <div data-test={`mix-card-${mix.id}`} />
  ),
}));
vi.mock("@/components/UI/LikesContent/LikesContent", () => ({
  default: () => <div data-test="likes-content" />,
}));
vi.mock("@/components/UI/PlaylistCard/PlaylistCard", () => ({
  default: ({ item }: { item: { id: string } }) => (
    <div data-test={`playlist-card-${item.id}`} />
  ),
}));
vi.mock("@/components/UI/UserCard/UserCard", () => ({
  default: ({ user }: { user: { id: string } }) => (
    <div data-test={`user-card-${user.id}`} />
  ),
}));

// ─── Imports (after mocks) ────────────────────────────────

import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import { useAuthStore } from "@/stores/auth.store";
import { getRecentlyPlayed } from "@/services/api/discover.service";
import {
  getMyPlaylists as getMyPlaylistsLib,
  getMyFollowing,
} from "@/services/api/library.service";
import {
  getMyPlaylists as getMyPlaylistsApi,
  getLikedPlaylists,
} from "@/services/api/playlist/playlist.service";

// ─── Fixtures ─────────────────────────────────────────────

const defaultLikes = {
  likedTracks: [],
  likedStations: [],
  likedPlaylists: [],
  likedAlbums: [],
  likedRadioTracks: [],
  likedMixes: [],
  likedGenres: [],
};

const defaultHistory = { entries: [] };

const defaultAuth = {
  user: {
    id: "1",
    username: "testuser",
    displayName: "Test User",
    following_ids: [] as string[],
  },
};

const emptyPaginatedResponse = { data: { items: [] } };

const makeMixEntry = (id: string, label: string | null) => ({
  type: "mix" as const,
  item: {
    id,
    label,
    flavor: "listening_history" as const,
    cover_image: null,
    track_count: 5,
    generated_at: "",
    preview_track: {
      id: "test-track-id",
      title: "Test Track",
      artist_name: "Test Artist",
      user_id: "test-user-id",
      genre_name: null,
      duration: 180,
      play_count: 0,
      like_count: 0,
      repost_count: 0,
      cover_image: null,
      stream_url: null,
      created_at: "",
    },
    genre_name: null,
  },
  playedAt: "",
});

const makeLibraryPlaylist = (id: string, name = "Playlist") => ({
  playlist_id: id,
  owner_user_id: "1",
  name,
  description: null,
  is_public: true,
  created_at: "",
  track_count: 3,
  like_count: 0,
  cover_image: null,
});

const makePlaylistCard = (id: string, title = "Playlist") => ({
  id,
  title,
  owner: "user",
  coverUrl: null,
  isPrivate: false,
  isLiked: false,
});

// ─── Helper ───────────────────────────────────────────────

async function renderPage() {
  await act(async () => {
    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>,
    );
  });
}

// ─── Test Suite ───────────────────────────────────────────

describe("LibraryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLikesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(defaultLikes);
    (useHistoryStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(defaultHistory);
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(defaultAuth);
    (getRecentlyPlayed as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getMyPlaylistsLib as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getMyFollowing as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getMyPlaylistsApi as ReturnType<typeof vi.fn>).mockResolvedValue(emptyPaginatedResponse);
    (getLikedPlaylists as ReturnType<typeof vi.fn>).mockResolvedValue(emptyPaginatedResponse);
  });

  // ── Section titles ───────────────────────────────────────

  it("renders Recently played section title", async () => {
    await renderPage();
    expect(screen.getByTestId("library-recently-played-title")).toHaveTextContent("Recently played");
  });

  it("renders Likes section title", async () => {
    await renderPage();
    expect(screen.getByTestId("library-likes-title")).toHaveTextContent("Likes");
  });

  it("renders Playlists section title", async () => {
    await renderPage();
    expect(screen.getByTestId("library-playlists-title")).toHaveTextContent("Playlists");
  });

  it("renders Albums section title", async () => {
    await renderPage();
    expect(screen.getByTestId("library-albums-title")).toHaveTextContent("Albums");
  });

  it("renders Stations section title", async () => {
    await renderPage();
    expect(screen.getByTestId("library-stations-title")).toHaveTextContent("Stations");
  });

  it("renders Following section title", async () => {
    await renderPage();
    expect(screen.getByTestId("library-following-title")).toHaveTextContent("Following");
  });

  // ── Recently Played — fallback ───────────────────────────

  it("falls back to mock tracks when history store and API are both empty", async () => {
    await renderPage();
    expect(screen.getByTestId("track-card-mock-1")).toBeInTheDocument();
    expect(screen.getByTestId("track-card-mock-2")).toBeInTheDocument();
  });

  it("uses history store entries instead of API tracks", async () => {
    (useHistoryStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      entries: [
        { type: "track", item: { id: "ht1" }, playedAt: "" },
      ],
    });
    await renderPage();
    expect(screen.getByTestId("track-card-ht1")).toBeInTheDocument();
    expect(screen.queryByTestId("track-card-mock-1")).not.toBeInTheDocument();
  });

  // ── Recently Played — entry types ───────────────────────

  it("renders a TrackCard for track history entries", async () => {
    (useHistoryStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      entries: [
        { type: "track", item: { id: "ht1" }, playedAt: "" },
      ],
    });
    await renderPage();
    expect(screen.getByTestId("track-card-ht1")).toBeInTheDocument();
  });

  it("renders a StationCard for station history entries", async () => {
    (useHistoryStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      entries: [
        { type: "station", item: { id: "hs1", name: "Station" }, playedAt: "" },
      ],
    });
    await renderPage();
    expect(screen.getByTestId("station-card-hs1")).toBeInTheDocument();
  });

  it("renders a MadeForYouCard for mix history entries", async () => {
    (useHistoryStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      entries: [makeMixEntry("hm1", "Daily Mix 1")],
    });
    await renderPage();
    expect(screen.getByTestId("mix-card-hm1")).toBeInTheDocument();
  });

  it("renders mixed entry types from history store", async () => {
    (useHistoryStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      entries: [
        { type: "track", item: { id: "ht1" }, playedAt: "" },
        { type: "station", item: { id: "hs1", name: "Station" }, playedAt: "" },
        makeMixEntry("hm1", "Mix"),
      ],
    });
    await renderPage();
    expect(screen.getByTestId("track-card-ht1")).toBeInTheDocument();
    expect(screen.getByTestId("station-card-hs1")).toBeInTheDocument();
    expect(screen.getByTestId("mix-card-hm1")).toBeInTheDocument();
  });

  // ── Mix null label guard ─────────────────────────────────

  it("does not crash when a mix entry has a null label", async () => {
    (useHistoryStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      entries: [makeMixEntry("hm-null", null)],
    });
    await act(async () => {
      expect(() =>
        render(
          <MemoryRouter>
            <LibraryPage />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    });
    expect(screen.getByTestId("mix-card-hm-null")).toBeInTheDocument();
  });

  it("does not crash when a mix entry has an empty string label", async () => {
    (useHistoryStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      entries: [makeMixEntry("hm-empty", "")],
    });
    await act(async () => {
      expect(() =>
        render(
          <MemoryRouter>
            <LibraryPage />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    });
    expect(screen.getByTestId("mix-card-hm-empty")).toBeInTheDocument();
  });

  // ── API calls ────────────────────────────────────────────

  it("calls getRecentlyPlayed on mount", async () => {
    await renderPage();
    expect(getRecentlyPlayed).toHaveBeenCalledTimes(1);
  });

  it("calls getMyPlaylists (library service) on mount", async () => {
    await renderPage();
    expect(getMyPlaylistsApi).toHaveBeenCalledTimes(1);
  });

  it("calls getMyFollowing on mount", async () => {
    await renderPage();
    expect(getMyFollowing).toHaveBeenCalledTimes(1);
  });

  it("calls playlist service APIs on mount", async () => {
    await renderPage();
    expect(getMyPlaylistsApi).toHaveBeenCalledTimes(1);
    expect(getLikedPlaylists).toHaveBeenCalledTimes(1);
  });

  // ── Playlists filter — dropdown ──────────────────────────

  it("shows 'All' as the default filter label", async () => {
    await renderPage();
    expect(screen.getByTestId("library-playlist-filter-toggle")).toHaveTextContent("All");
  });

  it("opens filter dropdown when toggle is clicked", async () => {
    await renderPage();
    fireEvent.click(screen.getByTestId("library-playlist-filter-toggle"));
    expect(screen.getByTestId("library-playlist-filter-option-all")).toBeInTheDocument();
    expect(screen.getByTestId("library-playlist-filter-option-created")).toBeInTheDocument();
    expect(screen.getByTestId("library-playlist-filter-option-liked")).toBeInTheDocument();
  });

  it("closes dropdown after selecting an option", async () => {
    await renderPage();
    fireEvent.click(screen.getByTestId("library-playlist-filter-toggle"));
    fireEvent.click(screen.getByTestId("library-playlist-filter-option-liked"));
    expect(screen.queryByTestId("library-playlist-filter-option-all")).not.toBeInTheDocument();
  });

  it("updates toggle label after selecting 'Created'", async () => {
    await renderPage();
    fireEvent.click(screen.getByTestId("library-playlist-filter-toggle"));
    fireEvent.click(screen.getByTestId("library-playlist-filter-option-created"));
    expect(screen.getByTestId("library-playlist-filter-toggle")).toHaveTextContent("Created");
  });

  it("updates toggle label after selecting 'Liked'", async () => {
    await renderPage();
    fireEvent.click(screen.getByTestId("library-playlist-filter-toggle"));
    fireEvent.click(screen.getByTestId("library-playlist-filter-option-liked"));
    expect(screen.getByTestId("library-playlist-filter-toggle")).toHaveTextContent("Liked");
  });

  // ── Playlists filter — content ───────────────────────────

  it("shows liked playlists from store when 'Liked' filter is selected", async () => {
    (useLikesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultLikes,
      likedPlaylists: [makePlaylistCard("lp1", "Liked Playlist")],
    });
    await renderPage();
    fireEvent.click(screen.getByTestId("library-playlist-filter-toggle"));
    fireEvent.click(screen.getByTestId("library-playlist-filter-option-liked"));
    expect(screen.getByTestId("playlist-card-lp1")).toBeInTheDocument();
  });

  it("hides liked playlists when 'Created' filter is selected", async () => {
    (useLikesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultLikes,
      likedPlaylists: [makePlaylistCard("lp1", "Liked Playlist")],
    });
    await renderPage();
    fireEvent.click(screen.getByTestId("library-playlist-filter-toggle"));
    fireEvent.click(screen.getByTestId("library-playlist-filter-option-created"));
    expect(screen.queryByTestId("playlist-card-lp1")).not.toBeInTheDocument();
  });

  it("shows created playlists from API when 'Created' filter is selected", async () => {
    (getMyPlaylistsLib as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeLibraryPlaylist("cp1", "Created Playlist"),
    ]);
    await renderPage();
    fireEvent.click(screen.getByTestId("library-playlist-filter-toggle"));
    fireEvent.click(screen.getByTestId("library-playlist-filter-option-created"));
    await waitFor(() => {
      expect(screen.getByTestId("playlist-card-cp1")).toBeInTheDocument();
    });
  });

  it("shows both created and liked playlists in 'All' filter", async () => {
    (getMyPlaylistsLib as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeLibraryPlaylist("cp1", "Created"),
    ]);
    (useLikesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultLikes,
      likedPlaylists: [makePlaylistCard("lp1", "Liked")],
    });
    await renderPage();
    // All filter is default — no need to click
    await waitFor(() => {
      expect(screen.getByTestId("playlist-card-cp1")).toBeInTheDocument();
    });
    expect(screen.getByTestId("playlist-card-lp1")).toBeInTheDocument();
  });

  it("deduplicates playlists with the same id in 'All' filter", async () => {
    (getMyPlaylistsLib as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeLibraryPlaylist("shared-id", "Shared"),
    ]);
    (useLikesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultLikes,
      likedPlaylists: [makePlaylistCard("shared-id", "Shared")],
    });
    await renderPage();
    await waitFor(() => {
      const cards = screen.getAllByTestId("playlist-card-shared-id");
      expect(cards).toHaveLength(1);
    });
  });

  // ── Following section ────────────────────────────────────

  it("renders users from API that match auth store following_ids", async () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { ...defaultAuth.user, following_ids: ["artist1"] },
    });
    (getMyFollowing as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "u1", display_name: "Artist One", username: "artist1", profile_picture: null, is_verified: false },
    ]);
    await renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("user-card-u1")).toBeInTheDocument();
    });
  });

  it("filters out API users whose username is not in following_ids", async () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { ...defaultAuth.user, following_ids: [] },
    });
    (getMyFollowing as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "u1", display_name: "Artist One", username: "artist1", profile_picture: null, is_verified: false },
    ]);
    await renderPage();
    await waitFor(() => {});
    expect(screen.queryByTestId("user-card-u1")).not.toBeInTheDocument();
  });

  it("renders a synthetic card for following_ids not returned by the API", async () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { ...defaultAuth.user, following_ids: ["ghost-user"] },
    });
    await renderPage();
    // Synthetic user gets id = String(-(i+1)) = "-1"
    expect(screen.getByTestId("user-card--1")).toBeInTheDocument();
  });

  it("renders no following cards when following_ids is empty and API returns nothing", async () => {
    await renderPage();
    expect(screen.queryAllByTestId(/^user-card-/)).toHaveLength(0);
  });

  // ── Likes section ────────────────────────────────────────

  it("renders LikesContent in the Likes section", async () => {
    await renderPage();
    expect(screen.getByTestId("likes-content")).toBeInTheDocument();
  });

  // ── Navigation links ─────────────────────────────────────

  it("renders 'Browse trending playlists' link in Likes section", async () => {
    await renderPage();
    expect(screen.getByTestId("library-likes-browse")).toHaveAttribute("href", "/discover");
  });

  it("renders 'Browse trending playlists' link in Stations section", async () => {
    await renderPage();
    expect(screen.getByTestId("library-stations-browse")).toHaveAttribute("href", "/discover");
  });

  // ── API error fallbacks ──────────────────────────────────

  it("falls back to mock tracks when getRecentlyPlayed rejects", async () => {
    (getRecentlyPlayed as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));
    await renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("track-card-mock-1")).toBeInTheDocument();
    });
  });

  it("keeps playlists empty when getMyPlaylists (library) rejects", async () => {
    (getMyPlaylistsLib as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));
    await renderPage();
    await waitFor(() => {});
    expect(screen.queryAllByTestId(/^playlist-card-/)).toHaveLength(0);
  });

  it("keeps following empty when getMyFollowing rejects", async () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { ...defaultAuth.user, following_ids: [] },
    });
    (getMyFollowing as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));
    await renderPage();
    await waitFor(() => {});
    expect(screen.queryAllByTestId(/^user-card-/)).toHaveLength(0);
  });

  it("keeps albums empty when the album Promise.all rejects", async () => {
    (getMyPlaylistsApi as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));
    await renderPage();
    await waitFor(() => {});
    expect(screen.queryAllByTestId(/^playlist-card-/)).toHaveLength(0);
  });

  // ── Recently Played — API success path ───────────────────

  it("shows API tracks when getRecentlyPlayed succeeds and history is empty", async () => {
    (getRecentlyPlayed as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        track: {
          id: "api-t1",
          title: "API Track",
          cover_image: null,
          stream_url: null,
          duration: 180,
          genre: null,
          like_count: 0,
          play_count: 0,
          user_id: "u1",
        },
        played_at: "",
      },
    ]);
    await renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("track-card-api-t1")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("track-card-mock-1")).not.toBeInTheDocument();
  });

  // ── Albums rendering ─────────────────────────────────────

  it("renders album cards from liked albums in store", async () => {
    (useLikesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultLikes,
      likedAlbums: [
        { playlist_id: "la1", name: "Liked Album", owner_user_id: "1", description: null, is_public: true, cover_image: null, subtype: "album", track_count: 5, like_count: 0, created_at: "" },
      ],
    });
    await renderPage();
    expect(screen.getByTestId("playlist-card-la1")).toBeInTheDocument();
  });

  it("renders album cards from API when items have is_album_view true", async () => {
    (getMyPlaylistsApi as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        items: [
          { playlist_id: "a1", name: "API Album", is_album_view: true, owner_user_id: "1", description: null, is_public: true, cover_image: null, subtype: "album", track_count: 3, like_count: 0, created_at: "" },
        ],
      },
    });
    await renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("playlist-card-a1")).toBeInTheDocument();
    });
  });

  it("does not render album cards for items without is_album_view", async () => {
    (getMyPlaylistsApi as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        items: [
          { playlist_id: "p1", name: "Playlist", is_album_view: false, owner_user_id: "1", description: null, is_public: true, cover_image: null, subtype: "playlist", track_count: 3, like_count: 0, created_at: "" },
        ],
      },
    });
    await renderPage();
    await waitFor(() => {});
    expect(screen.queryByTestId("playlist-card-p1")).not.toBeInTheDocument();
  });

  it("deduplicates albums with the same id from both APIs", async () => {
    const albumItem = { playlist_id: "shared-album", name: "Shared", is_album_view: true, owner_user_id: "1", description: null, is_public: true, cover_image: null, subtype: "album", track_count: 0, like_count: 0, created_at: "" };
    (getMyPlaylistsApi as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { items: [albumItem] } });
    (getLikedPlaylists as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { items: [albumItem] } });
    await renderPage();
    await waitFor(() => {
      const cards = screen.getAllByTestId("playlist-card-shared-album");
      expect(cards).toHaveLength(1);
    });
  });

  it("deduplicates albums between API albums and store liked albums in rendering", async () => {
    const apiAlbum = { playlist_id: "dup-album", name: "Dup", is_album_view: true, owner_user_id: "1", description: null, is_public: true, cover_image: null, subtype: "album", track_count: 0, like_count: 0, created_at: "" };
    (getMyPlaylistsApi as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { items: [apiAlbum] } });
    (useLikesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultLikes,
      likedAlbums: [{ ...apiAlbum }],
    });
    await renderPage();
    await waitFor(() => {
      const cards = screen.getAllByTestId("playlist-card-dup-album");
      expect(cards).toHaveLength(1);
    });
  });

  // ── Stations rendering ───────────────────────────────────

  it("renders station cards from liked stations in store", async () => {
    (useLikesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultLikes,
      likedStations: [
        { id: "lst1", name: "Liked Station", seedArtist: { id: "a1", displayName: "Artist" }, coverUrl: null, trackCount: 10 },
      ],
    });
    await renderPage();
    expect(screen.getByTestId("station-card-lst1")).toBeInTheDocument();
  });

  it("renders multiple station cards from liked stations", async () => {
    (useLikesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultLikes,
      likedStations: [
        { id: "lst1", name: "Station 1", seedArtist: { id: "a1", displayName: "Artist" }, coverUrl: null, trackCount: 5 },
        { id: "lst2", name: "Station 2", seedArtist: { id: "a2", displayName: "Artist 2" }, coverUrl: null, trackCount: 8 },
      ],
    });
    await renderPage();
    expect(screen.getByTestId("station-card-lst1")).toBeInTheDocument();
    expect(screen.getByTestId("station-card-lst2")).toBeInTheDocument();
  });
});
