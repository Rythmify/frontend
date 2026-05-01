import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PlaylistActionsAlbum from "../Album/PlaylistActionsAlbum";
import {
  convertPlaylist,
  repostPlaylist,
  removePlaylistRepost,
} from "@/services/api/playlist/playlist.service";
import { useAuthStore } from "@/stores/auth.store";
import { useLikesStore } from "@/stores/likes.store";
import { usePlayerStore } from "@/stores/player.store";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  convertPlaylist: vi.fn(),
  repostPlaylist: vi.fn(),
  removePlaylistRepost: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(),
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn(),
}));

vi.mock("@/pages/[username]/[trackSlug]/components/SharePopup", () => ({
  default: () => <div data-test="share-popup" />,
}));

vi.mock("../AddToPlaylistModal", () => ({
  default: () => <div data-test="add-to-playlist-modal" />,
}));

const playlist = {
  playlist_id: "11111111-1111-1111-1111-111111111111",
  name: "Album Playlist",
  owner_user_id: "owner-1",
  cover_image: "https://cdn.example.com/album.jpg",
  is_public: false,
  track_count: 2,
  tracks: [
    {
      track_id: "track-1",
      title: "Track 1",
      artist_name: "Artist 1",
      artist_username: "artist-1",
      cover_image: "https://cdn.example.com/track-1.jpg",
      duration: 180,
      added_at: "2026-04-12T00:00:00Z",
      is_public: true,
    },
    {
      track_id: "track-2",
      title: "Track 2",
      artist_name: "Artist 2",
      artist_username: "artist-2",
      cover_image: "https://cdn.example.com/track-2.jpg",
      duration: 200,
      added_at: "2026-04-12T00:00:00Z",
      is_public: true,
    },
  ],
} as any;

describe("PlaylistActionsAlbum", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLikesStore).mockReturnValue({
      isAlbumLiked: vi.fn(() => false),
      isPlaylistLiked: vi.fn(() => false),
      isGenreLiked: vi.fn(() => false),
      toggleAlbum: vi.fn(),
      togglePlaylist: vi.fn(),
      toggleGenre: vi.fn(),
    } as any);
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "listener", username: "listener" },
    } as any);
    vi.mocked(usePlayerStore).mockReturnValue({
      addToQueue: vi.fn(),
    } as any);
  });

  it("likes the album and queues tracks for next up", async () => {
    const addToQueue = vi.fn();
    const toggleAlbum = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({ addToQueue } as any);
    vi.mocked(useLikesStore).mockReturnValue({
      isAlbumLiked: vi.fn(() => false),
      isPlaylistLiked: vi.fn(() => false),
      isGenreLiked: vi.fn(() => false),
      toggleAlbum,
      togglePlaylist: vi.fn(),
      toggleGenre: vi.fn(),
    } as any);
    vi.mocked(convertPlaylist).mockResolvedValue({ data: playlist } as any);

    render(
      <PlaylistActionsAlbum
        playlist={playlist}
        backendPlaylistExists={false}
      />,
    );

    fireEvent.click(screen.getByTestId("album-action-like"));

    await waitFor(() =>
      expect(convertPlaylist).toHaveBeenCalledWith(
        playlist.playlist_id,
        expect.objectContaining({ name: "Album Playlist", is_public: false }),
      ),
    );
    expect(toggleAlbum).toHaveBeenCalledWith(playlist);

    fireEvent.click(screen.getByTestId("album-action-add-to-next-up"));
    expect(addToQueue).toHaveBeenCalledTimes(2);
  });

  it("alerts the owner when they try to repost their own album", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "owner-1", username: "album-owner" },
    } as any);
    vi.mocked(useLikesStore).mockReturnValue({
      isAlbumLiked: vi.fn(() => false),
      isPlaylistLiked: vi.fn(() => false),
      isGenreLiked: vi.fn(() => false),
      toggleAlbum: vi.fn(),
      togglePlaylist: vi.fn(),
      toggleGenre: vi.fn(),
    } as any);

    render(<PlaylistActionsAlbum playlist={playlist} />);

    fireEvent.click(screen.getByTestId("album-action-repost"));

    expect(alertSpy).toHaveBeenCalledWith("You cannot repost your own playlist.");
    expect(repostPlaylist).not.toHaveBeenCalled();
    expect(removePlaylistRepost).not.toHaveBeenCalled();
  });
});
