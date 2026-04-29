import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddToPlaylistModal from "../AddToPlaylistModal";
import {
  getMyPlaylists,
  addTrackToPlaylist,
  createPlaylist,
  getPlaylist,
} from "@/services/api/playlist/playlist.service";
import { getUploadQuota } from "@/services/api/upload/quota.service";
import { useLikesStore } from "@/stores/likes.store";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getMyPlaylists: vi.fn(),
  addTrackToPlaylist: vi.fn(),
  createPlaylist: vi.fn(),
  getPlaylist: vi.fn(),
}));

vi.mock("@/services/api/upload/quota.service", () => ({
  getUploadQuota: vi.fn(),
}));

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(),
}));

vi.mock("@/components/MessagingComponents/Modal", () => ({
  Modal: ({ children, isOpen }: any) =>
    isOpen ? <div data-test="modal">{children}</div> : null,
}));

vi.mock("../PlaylistList", () => ({
  default: ({ playlists, onAdd }: any) => (
    <div data-test="playlist-list">
      {playlists.map((p: any) => (
        <button
          key={p.playlist_id}
          data-test={`add-${p.playlist_id}`}
          onClick={() => onAdd(p.playlist_id)}
        >
          {p.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("../CreatePlaylistTab", () => ({
  default: ({
    onCreate,
    playlistTitle,
    setPlaylistTitle,
    setTracksToAdd,
    tracksToAdd,
  }: any) => (
    <div data-test="create-tab">
      <input
        data-test="create-title-input"
        value={playlistTitle}
        onChange={(e) => setPlaylistTitle(e.target.value)}
      />
      <button data-test="clear-tracks" onClick={() => setTracksToAdd([])}>
        Clear tracks
      </button>
      <div data-test="tracks-count">{tracksToAdd.length}</div>
      <button data-test="create-submit" onClick={onCreate}>
        Save
      </button>
    </div>
  ),
}));

const mockPlaylists = [
  {
    playlist_id: "8d5a8f6c-7b4a-4c7a-9c25-9a9f1e3a12aa",
    name: "Playlist One",
    track_count: 5,
    is_public: true,
    like_count: 0,
    owner_user_id: "u1",
    created_at: "2026-01-01",
  },
];

const baseProps = {
  trackId: "e5f6a7b8-c9d0-4123-8fab-567890abcdef",
  trackTitle: "Song Title",
  trackCoverUrl: "https://example.com/t1.jpg",
  artistName: "Artist Name",
  onClose: vi.fn(),
};

describe("AddToPlaylistModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLikesStore).mockReturnValue({ likedTracks: [] } as any);
    vi.mocked(getMyPlaylists).mockResolvedValue({
      data: { items: mockPlaylists, meta: { limit: 20, offset: 0, total: 1 } },
      message: "ok",
    } as any);
    vi.mocked(getUploadQuota).mockResolvedValue({
      canCreatePlaylist: true,
    } as any);
    vi.mocked(addTrackToPlaylist).mockResolvedValue({ data: {} } as any);
  });

  it("shows a loading spinner initially", () => {
    render(<AddToPlaylistModal {...baseProps} />);
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("renders the PlaylistList after loading", async () => {
    render(<AddToPlaylistModal {...baseProps} />);
    await waitFor(() =>
      expect(screen.getByTestId("playlist-list")).toBeInTheDocument(),
    );
  });

  it("renders tab buttons when playlists exist", async () => {
    render(<AddToPlaylistModal {...baseProps} />);
    await waitFor(() => {
      expect(
        screen.getByTestId("button-tab-add-to-playlist"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("button-tab-create-playlist"),
      ).toBeInTheDocument();
    });
  });

  it("switches to create tab when button clicked", async () => {
    render(<AddToPlaylistModal {...baseProps} />);
    await waitFor(() => screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    expect(await screen.findByTestId("create-tab")).toBeInTheDocument();
  });

  it("calls addTrackToPlaylist when adding to existing playlist", async () => {
    render(<AddToPlaylistModal {...baseProps} />);
    await waitFor(() =>
      screen.getByTestId("add-8d5a8f6c-7b4a-4c7a-9c25-9a9f1e3a12aa"),
    );
    fireEvent.click(
      screen.getByTestId("add-8d5a8f6c-7b4a-4c7a-9c25-9a9f1e3a12aa"),
    );
    await waitFor(() =>
      expect(addTrackToPlaylist).toHaveBeenCalledWith(
        "8d5a8f6c-7b4a-4c7a-9c25-9a9f1e3a12aa",
        "e5f6a7b8-c9d0-4123-8fab-567890abcdef",
      ),
    );
  });

  it("jumps to create tab if no playlists exist", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValueOnce({
      data: { items: [], meta: { limit: 20, offset: 0, total: 0 } },
      message: "ok",
    } as any);
    render(<AddToPlaylistModal {...baseProps} />);
    await waitFor(() =>
      expect(screen.getByTestId("create-tab")).toBeInTheDocument(),
    );
  });

  it("fetches playlist tracks when playlistId is provided (whole playlist mode)", async () => {
    vi.mocked(getPlaylist).mockResolvedValueOnce({
      data: {
        tracks: [],
        playlist_id: "8d5a8f6c-7b4a-4c7a-9c25-9a9f1e3a12aa",
      },
    } as any);
    render(
      <AddToPlaylistModal
        {...baseProps}
        trackId={undefined}
        playlistId="8d5a8f6c-7b4a-4c7a-9c25-9a9f1e3a12aa"
      />,
    );
    await waitFor(() =>
      expect(getPlaylist).toHaveBeenCalledWith(
        "8d5a8f6c-7b4a-4c7a-9c25-9a9f1e3a12aa",
      ),
    );
  });

  it("creates a playlist from the current selected tracks only", async () => {
    vi.mocked(createPlaylist).mockResolvedValueOnce({
      data: {
        playlist_id: "new-playlist",
        name: "Related tracks: Song Title",
        slug: "related-tracks-song-title",
        is_public: true,
        track_count: 0,
      },
    } as any);

    render(
      <AddToPlaylistModal
        {...baseProps}
        initialTracks={[
          { id: "t-1", title: "Track 1" },
          { id: "t-2", title: "Track 2" },
        ]}
        moreOfLike={true}
      />,
    );

    await waitFor(() => screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("clear-tracks"));
    fireEvent.click(screen.getByTestId("create-submit"));

    await waitFor(() => {
      expect(createPlaylist).toHaveBeenCalled();
    });
    expect(addTrackToPlaylist).not.toHaveBeenCalled();
  });
});
