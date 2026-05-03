import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
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

let lastCreateTabProps: any = null;

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
    privacy,
    setPrivacy,
    setTracksToAdd,
    tracksToAdd,
    error,
    limitReached,
    moreOfLike,
    ...rest
  }: any) => (
    <>
      {(() => {
        lastCreateTabProps = {
          playlistTitle,
        tracksToAdd,
        error,
        limitReached,
        moreOfLike,
        setPrivacy,
        ...rest,
      };
        return null;
      })()}
    <div data-test="create-tab">
      <input
        data-test="create-title-input"
        value={playlistTitle}
        onChange={(e) => setPlaylistTitle(e.target.value)}
      />
      <button data-test="toggle-privacy" onClick={() => setPrivacy(privacy === "public" ? "private" : "public")}>
        toggle privacy
      </button>
      {error && <div data-test="create-playlist-error">{error}</div>}
      {limitReached && <button>Upgrade to Premium</button>}
      <button data-test="clear-tracks" onClick={() => setTracksToAdd([])}>
        Clear tracks
      </button>
      <div data-test="tracks-count">{tracksToAdd.length}</div>
      <button data-test="create-submit" onClick={() => onCreate(moreOfLike)}>
        Save
      </button>
    </div>
    </>
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
    lastCreateTabProps = null;
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
        tracks: [
          {
            track_id: "t-1",
            title: "From playlist",
            artist_name: "Artist",
            cover_image: "cover.jpg",
          },
        ],
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
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    await waitFor(() =>
      expect(lastCreateTabProps?.tracksToAdd).toHaveLength(1),
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

  it("uses fetchTracks when provided", async () => {
    const fetchTracks = vi.fn().mockResolvedValue([
      { id: "f-1", title: "Fetched Track" },
      { id: "f-2", title: "Fetched Track 2" },
    ]);

    render(
      <AddToPlaylistModal
        {...baseProps}
        initialTracks={undefined}
        fetchTracks={fetchTracks}
      />,
    );

    await waitFor(() => expect(fetchTracks).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    await waitFor(() => expect(lastCreateTabProps?.tracksToAdd).toHaveLength(2));
  });

  it("switches back to the add tab when the add-tab button is clicked", async () => {
    render(<AddToPlaylistModal {...baseProps} />);

    await waitFor(() =>
      expect(screen.getByTestId("button-tab-create-playlist")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("button-tab-add-to-playlist"));

    await waitFor(() => expect(screen.getByTestId("playlist-list")).toBeInTheDocument());
  });

  it("creates a playlist and adds every selected track", async () => {
    vi.mocked(createPlaylist).mockResolvedValueOnce({
      data: {
        playlist_id: "created-playlist",
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
      />,
    );

    await waitFor(() => screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("create-submit"));

    await waitFor(() =>
      expect(addTrackToPlaylist).toHaveBeenCalledTimes(2),
    );
  });

  it("forwards privacy changes to the modal state", async () => {
    render(
      <AddToPlaylistModal
        {...baseProps}
        initialTracks={[{ id: "t-1", title: "Track 1" }]}
      />,
    );

    await waitFor(() => screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    act(() => {
      lastCreateTabProps?.setPrivacy?.("private");
    });
  });

  it("shows the limit-reached state when the quota blocks creation", async () => {
    vi.mocked(getUploadQuota).mockResolvedValueOnce({
      canCreatePlaylist: false,
    } as any);

    render(<AddToPlaylistModal {...baseProps} />);

    await waitFor(() =>
      expect(screen.getByTestId("button-tab-create-playlist")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    await waitFor(() => expect(lastCreateTabProps?.limitReached).toBe(true));
  });

  it("handles create playlist failures and maps the backend message", async () => {
    vi.mocked(createPlaylist).mockRejectedValueOnce({
      response: {
        data: {
          error: { message: "Custom create error" },
        },
      },
    } as any);

    render(
      <AddToPlaylistModal
        {...baseProps}
        initialTracks={[{ id: "t-1", title: "Track 1" }]}
      />,
    );

    await waitFor(() => screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("create-submit"));

    await waitFor(() => expect(lastCreateTabProps?.error).toBe("Custom create error"));
  });

  it("falls back to the generic create error message when backend text is missing", async () => {
    vi.mocked(createPlaylist).mockRejectedValueOnce({
      response: {
        data: {},
      },
    } as any);

    render(
      <AddToPlaylistModal
        {...baseProps}
        initialTracks={[{ id: "t-1", title: "Track 1" }]}
      />,
    );

    await waitFor(() => screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("create-submit"));

    await waitFor(() =>
      expect(lastCreateTabProps?.error).toBe(
        "Failed to create playlist. Please try again.",
      ),
    );
  });

  it("uses the thrown error message as the fallback when available", async () => {
    vi.mocked(createPlaylist).mockRejectedValueOnce(new Error("just nope"));

    render(
      <AddToPlaylistModal
        {...baseProps}
        initialTracks={[{ id: "t-1", title: "Track 1" }]}
      />,
    );

    await waitFor(() => screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("create-submit"));

    await waitFor(() => expect(lastCreateTabProps?.error).toBe("just nope"));
  });

  it("sets the limit reached banner when the subscription limit is hit", async () => {
    vi.mocked(createPlaylist).mockRejectedValueOnce({
      response: {
        status: 403,
        data: { error: { code: "SUBSCRIPTION_LIMIT_REACHED" } },
      },
    } as any);

    render(
      <AddToPlaylistModal
        {...baseProps}
        initialTracks={[{ id: "t-1", title: "Track 1" }]}
      />,
    );

    await waitFor(() => screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("button-tab-create-playlist"));
    fireEvent.click(screen.getByTestId("create-submit"));

    await waitFor(() => expect(lastCreateTabProps?.limitReached).toBe(true));
  });

  it("handles add-to-playlist failures without crashing", async () => {
    vi.mocked(addTrackToPlaylist).mockRejectedValueOnce(new Error("add failed"));

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

  it("logs initialization errors when the initial fetch fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getMyPlaylists).mockRejectedValueOnce(new Error("boom"));

    render(<AddToPlaylistModal {...baseProps} />);

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith("Initialization error:", expect.any(Error)),
    );
    errorSpy.mockRestore();
  });
});
