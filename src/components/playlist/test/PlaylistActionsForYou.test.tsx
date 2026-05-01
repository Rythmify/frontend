import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PlaylistActionsForYou from "../Made for you/PlaylistActionsForYou";
import { updatePlaylist } from "@/services/api/playlist/playlist.service";
import { useLikesStore } from "@/stores/likes.store";
import { usePlayerStore } from "@/stores/player.store";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  updatePlaylist: vi.fn(),
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
  default: ({ onClose }: any) => (
    <div data-test="add-to-playlist-modal">
      <button onClick={onClose}>close</button>
    </div>
  ),
}));

const playlist = {
  playlist_id: "pl-1",
  name: "Test Playlist",
  owner_user_id: "owner-1",
  cover_image: null,
  is_public: false,
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

describe("PlaylistActionsForYou", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLikesStore).mockReturnValue({
      isPlaylistLiked: vi.fn(() => false),
      isMixLiked: vi.fn(() => false),
      isStationLiked: vi.fn(() => false),
      isRadioTrackLiked: vi.fn(() => false),
      togglePlaylist: vi.fn(),
      toggleMix: vi.fn(),
      toggleStation: vi.fn(),
      toggleRadioTrack: vi.fn(),
    } as any);
    vi.mocked(usePlayerStore).mockReturnValue({
      addToQueue: vi.fn(),
    } as any);
  });

  it("toggles like, queues tracks, opens share and make-public flows", async () => {
    const onAddToNextUp = vi.fn();
    const onPlaylistUpdated = vi.fn();
    const addToQueue = vi.fn();
    const togglePlaylist = vi.fn();
    vi.mocked(updatePlaylist).mockResolvedValue({
      data: { ...playlist, is_public: true },
    } as any);
    vi.mocked(useLikesStore).mockReturnValue({
      isPlaylistLiked: vi.fn(() => false),
      isMixLiked: vi.fn(() => false),
      isStationLiked: vi.fn(() => false),
      isRadioTrackLiked: vi.fn(() => false),
      togglePlaylist,
      toggleMix: vi.fn(),
      toggleStation: vi.fn(),
      toggleRadioTrack: vi.fn(),
    } as any);

    render(
      <PlaylistActionsForYou
        playlist={playlist}
        initialTracks={playlist.tracks}
        onAddToNextUp={onAddToNextUp}
        onPlaylistUpdated={onPlaylistUpdated}
      />,
    );

    fireEvent.click(screen.getByTestId("playlist-actions-for-you-like"));
    expect(togglePlaylist).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "pl-1",
        title: "Test Playlist",
        owner: "owner-1",
      }),
    );

    fireEvent.click(screen.getByTestId("playlist-actions-for-you-next-up"));
    expect(onAddToNextUp).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("playlist-actions-for-you-share"));
    expect(screen.getByTestId("share-popup")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("playlist-actions-for-you-more"));
    fireEvent.click(screen.getByText("Make public"));

    await waitFor(() =>
      expect(updatePlaylist).toHaveBeenCalledWith(
        "pl-1",
        expect.objectContaining({ is_public: true }),
      ),
    );

    fireEvent.click(screen.getByTestId("playlist-actions-for-you-more"));
    fireEvent.click(screen.getByText("Add to playlist"));
    expect(screen.getByTestId("add-to-playlist-modal")).toBeInTheDocument();
  });

  it("toggles the radio-track seed when engagementKind is radioTracks", () => {
    const toggleRadioTrack = vi.fn();
    vi.mocked(useLikesStore).mockReturnValue({
      isPlaylistLiked: vi.fn(() => false),
      isMixLiked: vi.fn(() => false),
      isStationLiked: vi.fn(() => false),
      isRadioTrackLiked: vi.fn(() => false),
      togglePlaylist: vi.fn(),
      toggleMix: vi.fn(),
      toggleStation: vi.fn(),
      toggleRadioTrack,
    } as any);

    render(
      <PlaylistActionsForYou
        playlist={playlist}
        initialTracks={playlist.tracks}
        engagementKind="radioTracks"
      />,
    );

    fireEvent.click(screen.getByTestId("playlist-actions-for-you-like"));

    expect(toggleRadioTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "track-1",
        title: "Track 1",
      }),
    );
  });
});
