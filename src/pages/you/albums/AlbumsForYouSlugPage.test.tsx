import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useParams } from "react-router-dom";

import AlbumsForYouSlugPage from "./AlbumsForYouSlugPage";
import { getAlbumsForYou } from "@/services/api/discover.service";
import {
  getPlaylist,
  playlistExists,
} from "@/services/api/playlist/playlist.service";
import { getTrackById } from "@/services/track.service";
import { getUserById } from "@/services/user.service";
import { usePlayerStore } from "@/stores/player.store";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock("@/services/api/discover.service", () => ({
  getAlbumsForYou: vi.fn(),
}));

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getPlaylist: vi.fn(),
  playlistExists: vi.fn(),
}));

vi.mock("@/services/track.service", () => ({
  getTrackById: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  getUserById: vi.fn(),
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: Object.assign(vi.fn(), {
    getState: vi.fn(),
  }),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("../../../components/playlist/PlaylistHero", () => ({
  default: ({ playlist, onPlayPause, ownerUsername }: any) => (
    <div data-test="playlist-hero">
      <span data-test="hero-name">{playlist?.name}</span>
      <span data-test="hero-owner">{ownerUsername ?? ""}</span>
      <button data-test="hero-play" onClick={onPlayPause}>
        play
      </button>
    </div>
  ),
}));

vi.mock("../../../components/playlist/Album/PlaylistActionsAlbum", () => ({
  default: ({ backendPlaylistExists, onPlaylistUpdated, playlist }: any) => (
    <div data-test="playlist-actions" data-exists={String(backendPlaylistExists)}>
      <button
        data-test="album-update"
        onClick={() => onPlaylistUpdated?.({ name: "Updated Album" })}
      >
        update
      </button>
      <span>{playlist?.playlist_id}</span>
    </div>
  ),
}));

vi.mock("@/components/playlist/OwnerInfo", () => ({
  default: ({ username, trackNum }: any) => (
    <div data-test="owner-info" data-username={username} data-tracks={String(trackNum)} />
  ),
}));

vi.mock("../../../components/playlist/Made for you/PlaylistSidebarForYou", () => ({
  default: ({ featuredArtists }: any) => (
    <div
      data-test="playlist-sidebar"
      data-featured-count={String(featuredArtists?.length ?? 0)}
      data-featured-avatar={featuredArtists?.[0]?.avatarUrl ?? ""}
      data-featured-followers={String(featuredArtists?.[0]?.followerCount ?? 0)}
    />
  ),
}));

vi.mock("../../../components/playlist/TrackList", () => ({
  default: ({ tracks, onTrackPlay }: any) => (
    <div
      data-test="track-list"
      data-count={String(tracks?.length ?? 0)}
      data-first-duration={String(tracks?.[0]?.duration ?? "")}
    >
      {tracks?.map((track: any) => (
        <button
          key={track.track_id}
          data-test={`track-${track.track_id}`}
          onClick={() => onTrackPlay(track)}
        >
          {track.title}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/Upload/GuestPageFooter", () => ({
  default: () => <div data-test="guest-footer" />,
}));

const albumItem = {
  id: "album-1",
  name: "Album One",
  owner_id: "owner-1",
  cover_image: "https://cdn.example.com/album.jpg",
  created_at: "2026-04-12T00:00:00Z",
  like_count: 4,
};

const albumPlaylist = {
  playlist_id: "album-1",
  owner_user_id: "owner-1",
  name: "Album One",
  cover_image: "https://cdn.example.com/album.jpg",
  tracks: [
    {
      track_id: "track-1",
      title: "Album Track 1",
      artist_name: "Artist One",
      artist_id: "artist-1",
      artist_username: "artist-1",
      added_at: "2026-04-12T00:00:00Z",
      duration: 185,
      cover_image: "https://cdn.example.com/track-1.jpg",
      audio_url: "https://cdn.example.com/track-1.mp3",
      is_public: true,
      play_count: 5,
    },
    {
      track_id: "track-2",
      title: "Album Track 2",
      artist_name: "Artist One",
      artist_id: "artist-1",
      artist_username: "artist-1",
      added_at: "2026-04-12T00:00:00Z",
      duration: 200,
      cover_image: "https://cdn.example.com/track-2.jpg",
      audio_url: "https://cdn.example.com/track-2.mp3",
      is_public: true,
      play_count: 6,
    },
  ],
};

describe("AlbumsForYouSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({
      username: "listener",
      albumSlug: "album-1",
    } as any);
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "me",
        following_ids: ["artist-1"],
      },
    } as any);
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: null,
      togglePlay: vi.fn(),
      setTrack: vi.fn(),
    } as any);
  });

  it("renders album details and prepares the playback queue", async () => {
    vi.mocked(getAlbumsForYou).mockResolvedValue({
      data: [albumItem],
    } as any);
    vi.mocked(getPlaylist).mockResolvedValue({
      data: albumPlaylist,
    } as any);
    vi.mocked(playlistExists).mockResolvedValue(true as any);
    vi.mocked(getTrackById).mockImplementation(async (id: string) =>
      ({
        track_id: id,
        playCount: 99,
        duration: "3:45",
      }) as any,
    );
    vi.mocked(getUserById).mockImplementation(async (id: string) => {
      if (id === "artist-1") {
        return {
          id: "artist-1",
          username: "artist-1",
          display_name: "Artist One",
          followers_count: 55,
        } as any;
      }
      return {
        id: "owner-1",
        username: "album-owner",
        display_name: "Album Owner",
        followers_count: 120,
      } as any;
    });

    render(<AlbumsForYouSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("hero-name")).toHaveTextContent("Album One");
    await waitFor(() =>
      expect(screen.getByTestId("hero-owner")).toHaveTextContent("album-owner"),
    );
    expect(screen.getByTestId("playlist-actions")).toHaveAttribute(
      "data-exists",
      "true",
    );
    expect(screen.getByTestId("owner-info")).toHaveAttribute(
      "data-tracks",
      "198",
    );
    expect(screen.getByTestId("playlist-sidebar")).toHaveAttribute(
      "data-featured-count",
      "1",
    );
    expect(screen.getByTestId("track-list")).toHaveAttribute(
      "data-first-duration",
      "225",
    );
    expect(screen.getByTestId("playlist-sidebar")).toHaveAttribute(
      "data-featured-avatar",
      "https://picsum.photos/seed/artist-1/100/100",
    );
    expect(screen.getByTestId("playlist-sidebar")).toHaveAttribute(
      "data-featured-followers",
      "55",
    );

    fireEvent.click(screen.getByTestId("hero-play"));

    const store = vi.mocked(usePlayerStore).mock.results[0]?.value;
    expect(store.setTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "track-1",
        context: expect.objectContaining({
          playlist_id: "album-1",
          queue: ["track-1", "track-2"],
        }),
      }),
      expect.any(Array),
    );
  });

  it("updates the album title from the actions panel", async () => {
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: null,
      togglePlay: vi.fn(),
      setTrack: vi.fn(),
    } as any);
    (usePlayerStore as any).getState = vi.fn(() => ({ addToQueue: vi.fn() }));
    vi.mocked(getAlbumsForYou).mockResolvedValue({
      data: [albumItem],
    } as any);
    vi.mocked(getPlaylist).mockResolvedValue({
      data: albumPlaylist,
    } as any);
    vi.mocked(playlistExists).mockResolvedValue(false as any);
    vi.mocked(getTrackById).mockResolvedValue({ track_id: "track-1", duration: "3:00", playCount: 1 } as any);
    vi.mocked(getUserById).mockResolvedValue({
      id: "owner-1",
      username: "album-owner",
      display_name: "Album Owner",
    } as any);

    render(<AlbumsForYouSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("album-update"));

    expect(screen.getByTestId("hero-name")).toHaveTextContent("Updated Album");
  });

  it("shows an error when no album can be resolved", async () => {
    vi.mocked(getAlbumsForYou).mockResolvedValue({
      data: [],
    } as any);

    render(<AlbumsForYouSlugPage />);

    await waitFor(() =>
      expect(screen.getByText(/Album not found/i)).toBeInTheDocument(),
    );
  });

  it("toggles playback when the active album track is clicked again", async () => {
    const togglePlay = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: true,
      currentTrack: { id: "track-1", context: { playlist_id: "album-1" } },
      togglePlay,
      setTrack: vi.fn(),
    } as any);
    vi.mocked(getAlbumsForYou).mockResolvedValue({
      data: [albumItem],
    } as any);
    vi.mocked(getPlaylist).mockResolvedValue({
      data: albumPlaylist,
    } as any);
    vi.mocked(playlistExists).mockResolvedValue(true as any);
    vi.mocked(getTrackById).mockResolvedValue({ track_id: "track-1", duration: "3:00", playCount: 1 } as any);
    vi.mocked(getUserById).mockResolvedValue({
      id: "owner-1",
      username: "album-owner",
      display_name: "Album Owner",
    } as any);

    render(<AlbumsForYouSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("hero-play"));
    expect(togglePlay).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("track-track-1"));
    expect(togglePlay).toHaveBeenCalledTimes(2);
  });

  it("falls back when an album track hydrate request fails", async () => {
    vi.mocked(getAlbumsForYou).mockResolvedValue({
      data: [albumItem],
    } as any);
    vi.mocked(getPlaylist).mockResolvedValue({
      data: {
        ...albumPlaylist,
        tracks: [
          {
            ...albumPlaylist.tracks[0],
            duration: null,
          },
        ],
      },
    } as any);
    vi.mocked(playlistExists).mockResolvedValue(false as any);
    vi.mocked(getTrackById).mockRejectedValue(new Error("hydrate failed"));
    vi.mocked(getUserById).mockResolvedValue({
      id: "owner-1",
      username: "album-owner",
      display_name: "Album Owner",
    } as any);

    render(<AlbumsForYouSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("track-list")).toHaveAttribute("data-count", "1");
  });
});
