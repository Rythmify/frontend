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
import { useLikesStore } from "@/stores/likes.store";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getMyPlaylists: vi.fn(),
  addTrackToPlaylist: vi.fn(),
  createPlaylist: vi.fn(),
  getPlaylist: vi.fn(),
}));

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(),
}));

vi.mock("../MessagingComponents/Modal", () => ({
  Modal: ({ children, isOpen }: any) =>
    isOpen ? <div data-test="modal">{children}</div> : null,
}));

vi.mock("./PlaylistList", () => ({
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

vi.mock("./CreatePlaylistTab", () => ({
  default: ({ onCreate, playlistTitle, setPlaylistTitle }: any) => (
    <div data-test="create-tab">
      <input
        data-test="create-title-input"
        value={playlistTitle}
        onChange={(e) => setPlaylistTitle(e.target.value)}
      />
      <button data-test="create-submit" onClick={onCreate}>
        Save
      </button>
    </div>
  ),
}));

const mockPlaylists = [
  {
    playlist_id: "pl-1",
    name: "Playlist One",
    track_count: 5,
    is_public: true,
    like_count: 0,
    owner_user_id: "u1",
    created_at: "2026-01-01",
  },
];

const baseProps = {
  trackId: "t-1",
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
    await waitFor(() => screen.getByTestId("add-pl-1"));
    fireEvent.click(screen.getByTestId("add-pl-1"));
    await waitFor(() =>
      expect(addTrackToPlaylist).toHaveBeenCalledWith("pl-1", "t-1"),
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
      data: { tracks: [], playlist_id: "src-pl" },
    } as any);
    render(
      <AddToPlaylistModal
        {...baseProps}
        trackId={undefined}
        playlistId="src-pl"
      />,
    );
    await waitFor(() => expect(getPlaylist).toHaveBeenCalledWith("src-pl"));
  });
});
