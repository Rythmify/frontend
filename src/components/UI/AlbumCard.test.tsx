import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import AlbumCard from "./AlbumCard";
import { useLikesStore } from "@/stores/likes.store";
import { usePlayerStore } from "@/stores/player.store";
import { useHistoryStore } from "@/stores/history.store";

const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(),
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn(),
}));

vi.mock("@/stores/history.store", () => ({
  useHistoryStore: vi.fn(),
}));

vi.mock("@/components/UI/CardOverlay/CardOverlay", () => ({
  default: ({ isLiked, onLike, onPlay }: any) => (
    <div data-test="card-overlay" data-liked={String(isLiked)}>
      <button data-test="overlay-like" onClick={onLike}>
        like
      </button>
      <button data-test="overlay-play" onClick={onPlay}>
        play
      </button>
    </div>
  ),
  AddToPlaylistIcon: <span data-test="add-to-playlist-icon" />,
}));

vi.mock("@/components/playlist/AddToPlaylistModal", () => ({
  default: () => <div data-test="add-to-playlist-modal" />,
}));

describe("AlbumCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLikesStore).mockReturnValue({
      isPlaylistLiked: vi.fn(() => true),
      togglePlaylist: vi.fn(),
    } as any);
    vi.mocked(usePlayerStore).mockReturnValue({
      currentTrack: null,
      isPlaying: false,
      togglePlay: vi.fn(),
      setTrack: vi.fn(),
    } as any);
    vi.mocked(useHistoryStore).mockReturnValue({
      addAlbum: vi.fn(),
    } as any);
  });

  it("uses playlist like state and toggles the playlist payload", () => {
    const togglePlaylist = vi.fn();
    const isPlaylistLiked = vi.fn(() => true);

    vi.mocked(useLikesStore).mockReturnValue({
      isPlaylistLiked,
      togglePlaylist,
    } as any);

    render(
      <AlbumCard
        item={{
          id: "album-1",
          title: "Album One",
          owner: "Album Owner",
          ownerId: "owner-1",
          ownerUsername: "album-owner",
          slug: "album-one",
          coverUrl: "https://cdn.example.com/album.jpg",
          trackCount: 8,
          likeCount: 12,
        }}
      />,
    );

    expect(isPlaylistLiked).toHaveBeenCalledWith("album-1");
    expect(screen.getByTestId("card-overlay")).toHaveAttribute("data-liked", "true");

    fireEvent.click(screen.getByTestId("overlay-like"));

    expect(togglePlaylist).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "album-1",
        title: "Album One",
        owner: "Album Owner",
        ownerUsername: "album-owner",
        slug: "album-one",
        coverUrl: "https://cdn.example.com/album.jpg",
        isAlbumView: true,
      }),
    );
  });
});
