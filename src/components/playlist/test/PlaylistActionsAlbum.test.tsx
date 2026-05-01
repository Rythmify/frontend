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
  default: ({ onClose }: any) => (
    <div data-test="share-popup">
      <button onClick={onClose}>close</button>
    </div>
  ),
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
    const togglePlaylist = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({ addToQueue } as any);
    vi.mocked(useLikesStore).mockReturnValue({
      isAlbumLiked: vi.fn(() => false),
      isPlaylistLiked: vi.fn(() => false),
      isGenreLiked: vi.fn(() => false),
      toggleAlbum: vi.fn(),
      togglePlaylist,
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
    expect(togglePlaylist).toHaveBeenCalledWith(
      expect.objectContaining({
        id: playlist.playlist_id,
        title: playlist.name,
        owner: playlist.owner_user_id,
        ownerUsername: playlist.owner_user_id,
        slug: null,
        coverUrl: playlist.cover_image,
        isPrivate: true,
        isLiked: true,
        isAlbumView: true,
      }),
    );

    fireEvent.click(screen.getByTestId("album-action-add-to-next-up"));
    expect(addToQueue).toHaveBeenCalledTimes(2);
  });

  it("copies the page url and shows the success banner", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<PlaylistActionsAlbum playlist={playlist} />);

    fireEvent.click(screen.getByTestId("album-action-copy-link"));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(await screen.findByText("Link copied")).toBeInTheDocument();
  });

  it("handles copy failures without showing the success banner", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error("clipboard")),
      },
    });

    render(<PlaylistActionsAlbum playlist={playlist} />);

    fireEvent.click(screen.getByTestId("album-action-copy-link"));

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to copy playlist link:",
        expect.any(Error),
      ),
    );
    expect(screen.queryByText("Link copied")).not.toBeInTheDocument();
    consoleError.mockRestore();
  });

  it("reposts and un-reposts the album for non-owners", async () => {
    const repost = vi.mocked(repostPlaylist);
    const remove = vi.mocked(removePlaylistRepost);
    repost.mockResolvedValue(undefined as any);
    remove.mockResolvedValue(undefined as any);

    render(<PlaylistActionsAlbum playlist={playlist} />);

    fireEvent.click(screen.getByTestId("album-action-repost"));
    await waitFor(() => expect(repost).toHaveBeenCalledWith(playlist.playlist_id));

    fireEvent.click(screen.getByTestId("album-action-repost"));
    await waitFor(() => expect(remove).toHaveBeenCalledWith(playlist.playlist_id));
  });

  it("handles like failures without crashing", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(convertPlaylist).mockRejectedValue(new Error("convert fail"));

    render(<PlaylistActionsAlbum playlist={playlist} backendPlaylistExists={false} />);

    fireEvent.click(screen.getByTestId("album-action-like"));

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to toggle playlist like:",
        expect.any(Error),
      ),
    );
    consoleError.mockRestore();
  });

  it("warns and skips conversion for non-UUID playlist ids", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const togglePlaylist = vi.fn();
    vi.mocked(useLikesStore).mockReturnValue({
      isAlbumLiked: vi.fn(() => false),
      isPlaylistLiked: vi.fn(() => false),
      isGenreLiked: vi.fn(() => false),
      toggleAlbum: vi.fn(),
      togglePlaylist,
      toggleGenre: vi.fn(),
    } as any);

    render(
      <PlaylistActionsAlbum
        playlist={{ ...playlist, playlist_id: "not-a-uuid" }}
        backendPlaylistExists={false}
      />,
    );

    fireEvent.click(screen.getByTestId("album-action-like"));

    expect(warnSpy).toHaveBeenCalledWith(
      "Skipping convert for non-UUID album id:",
      "not-a-uuid",
    );
    expect(convertPlaylist).not.toHaveBeenCalled();
    expect(togglePlaylist).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("returns early when there are no tracks and no next-up callback", () => {
    const addToQueue = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      addToQueue,
    } as any);

    render(
      <PlaylistActionsAlbum
        playlist={{ ...playlist, tracks: [] }}
      />,
    );

    fireEvent.click(screen.getByTestId("album-action-add-to-next-up"));
    expect(addToQueue).not.toHaveBeenCalled();
  });

  it("opens and closes the share popup", () => {
    render(<PlaylistActionsAlbum playlist={playlist} />);

    fireEvent.click(screen.getByTestId("album-action-share"));
    expect(screen.getByTestId("share-popup")).toBeInTheDocument();

    fireEvent.click(screen.getByText("close"));
    expect(screen.queryByTestId("share-popup")).not.toBeInTheDocument();
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

  it("uses the playlist and genre like flows when configured", async () => {
    const togglePlaylist = vi.fn();
    const toggleGenre = vi.fn();
    vi.mocked(useLikesStore).mockReturnValue({
      isAlbumLiked: vi.fn(() => false),
      isPlaylistLiked: vi.fn(() => false),
      isGenreLiked: vi.fn(() => false),
      toggleAlbum: vi.fn(),
      togglePlaylist,
      toggleGenre,
    } as any);

    const playlistRender = render(
      <PlaylistActionsAlbum
        playlist={playlist}
        engagementKind="playlist"
        backendPlaylistExists
      />,
    );
    fireEvent.click(playlistRender.getByTestId("album-action-like"));
    expect(togglePlaylist).toHaveBeenCalledWith(
      expect.objectContaining({
        id: playlist.playlist_id,
        title: playlist.name,
        owner: playlist.owner_user_id,
      }),
    );

    playlistRender.unmount();

    const genreRender = render(
      <PlaylistActionsAlbum
        playlist={playlist}
        engagementKind="genre"
        backendPlaylistExists
      />,
    );
    fireEvent.click(genreRender.getByTestId("album-action-like"));
    expect(toggleGenre).toHaveBeenCalledWith(
      expect.objectContaining({
        id: playlist.playlist_id,
        genre: playlist.name,
      }),
    );
  });
});
