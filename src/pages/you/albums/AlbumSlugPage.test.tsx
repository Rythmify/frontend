import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useParams } from "react-router-dom";

import AlbumSlugPage from "./AlbumSlugPage";
import { getPlaylist, playlistExists } from "@/services/api/playlist/playlist.service";
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

vi.mock("../../../components/playlist/PlaylistActions", () => ({
  default: ({ playlist, onPlaylistUpdated }: any) => (
    <div data-test="playlist-actions-owner" data-playlist={playlist?.playlist_id ?? ""}>
      <button
        data-test="owner-update"
        onClick={() => onPlaylistUpdated?.({ name: "Updated Album" })}
      >
        update
      </button>
    </div>
  ),
}));

vi.mock("../../../components/playlist/Album/PlaylistActionsAlbum", () => ({
  default: ({ backendPlaylistExists, onAddToNextUp }: any) => (
    <div data-test="playlist-actions-album" data-exists={String(backendPlaylistExists)}>
      <button data-test="add-next-up" onClick={onAddToNextUp}>
        add
      </button>
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
    <div data-test="playlist-sidebar" data-featured-count={String(featuredArtists?.length ?? 0)} />
  ),
}));

vi.mock("../../../components/playlist/TrackList", () => ({
  default: ({ tracks, onTrackPlay }: any) => (
    <div data-test="track-list" data-count={String(tracks?.length ?? 0)}>
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

const playlistData = {
  playlist_id: "album-1",
  owner_user_id: "owner-1",
  name: "Album One",
  description: "Album description",
  is_public: true,
  cover_image: "https://cdn.example.com/album.jpg",
  tracks: [
    {
      track_id: "track-1",
      title: "Album Track 1",
      artist_name: "Artist One",
      artist_id: "artist-1",
      artist_username: "artist-1",
      added_at: "2026-04-12T00:00:00Z",
      duration: 180,
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

describe("AlbumSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({
      username: "listener",
      albumSlug: "album-1",
    } as any);
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "owner-1",
        username: "album-owner",
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

  it("renders the owner actions when the signed-in user owns the album", async () => {
    vi.mocked(getPlaylist).mockResolvedValue({ data: playlistData } as any);
    vi.mocked(playlistExists).mockResolvedValue(true as any);
    vi.mocked(getTrackById).mockImplementation(async (id: string) =>
      ({ track_id: id, duration: "3:30", playCount: 50 }) as any,
    );
    vi.mocked(getUserById).mockImplementation(async (id: string) => {
      if (id === "owner-1") {
        return {
          id: "owner-1",
          username: "album-owner",
          display_name: "Album Owner",
          followers_count: 88,
        } as any;
      }
      return {
        id: "artist-1",
        username: "artist-1",
        display_name: "Artist One",
        followers_count: 31,
      } as any;
    });

    render(<AlbumSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("playlist-actions-owner")).toBeInTheDocument();
    expect(screen.queryByTestId("playlist-actions-album")).not.toBeInTheDocument();
    expect(screen.getByTestId("owner-info")).toHaveAttribute("data-tracks", "100");

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

  it("renders album actions for non-owners and appends the queue to next up", async () => {
    const addToQueue = vi.fn();
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "listener",
        username: "listener",
        following_ids: [],
      },
    } as any);
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: true,
      currentTrack: { id: "track-1", context: { playlist_id: "album-1" } },
      togglePlay: vi.fn(),
      setTrack: vi.fn(),
    } as any);
    (usePlayerStore as any).getState = vi.fn(() => ({ addToQueue }));
    vi.mocked(getPlaylist).mockResolvedValue({ data: playlistData } as any);
    vi.mocked(playlistExists).mockResolvedValue(false as any);
    vi.mocked(getTrackById).mockResolvedValue({ track_id: "track-1", duration: "3:30", playCount: 50 } as any);
    vi.mocked(getUserById).mockResolvedValue({
      id: "owner-1",
      username: "album-owner",
      display_name: "Album Owner",
    } as any);

    render(<AlbumSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-actions-album")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("add-next-up"));

    expect(addToQueue).toHaveBeenCalledTimes(2);
  });

  it("shows an error when the playlist request fails", async () => {
    vi.mocked(getPlaylist).mockRejectedValue(new Error("failed"));

    render(<AlbumSlugPage />);

    await waitFor(() =>
      expect(screen.getByText(/Failed to load playlist/i)).toBeInTheDocument(),
    );
  });
});
