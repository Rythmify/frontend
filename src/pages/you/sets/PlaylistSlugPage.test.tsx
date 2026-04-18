import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PlaylistSlugPage from "./PlaylistSlugPage";
import { getPlaylist } from "@/services/api/playlist/playlist.service";
import { getUsers } from "@/services/mocks/User.service";
import { usePlayerStore } from "@/stores/player.store";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getPlaylist: vi.fn(),
}));

vi.mock("@/services/mocks/User.service", () => ({
  getUsers: vi.fn(),
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn(),
}));

vi.mock("@/components/Upload/GuestPageFooter", () => ({
  default: () => <div data-test="guest-footer" />,
}));

vi.mock("../../../components/playlist/PlaylistHero", () => ({
  default: ({ playlist, onPlayPause }: any) => (
    <div data-test="playlist-hero">
      <span>{playlist.name}</span>
      <button onClick={onPlayPause} data-test="hero-play">
        Play
      </button>
    </div>
  ),
}));

vi.mock("../../../components/playlist/PlaylistActions", () => ({
  default: ({ onPlaylistUpdated }: any) => (
    <div data-test="playlist-actions">
      <button
        data-test="playlist-actions-update"
        onClick={() =>
          onPlaylistUpdated({
            name: "Updated Playlist",
            description: "Updated description",
          })
        }
      >
        Update
      </button>
    </div>
  ),
}));
vi.mock("../../../components/playlist/PlaylistSidebar", () => ({
  default: () => <div data-test="playlist-sidebar" />,
}));
vi.mock("../../../components/playlist/TrackList", () => ({
  default: ({ tracks }: any) => (
    <div data-test="track-list">{tracks?.length} tracks</div>
  ),
}));

const mockPlaylistData = {
  playlist_id: "pl-abc",
  name: "Test Playlist",
  tracks: [{ track_id: "t-1", title: "Track 1" }],
};

describe("PlaylistSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: null,
      togglePlay: vi.fn(),
      setTrack: vi.fn(),
    } as any);
    vi.mocked(getUsers).mockResolvedValue([] as any);
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/testuser/my-playlist:pl-abc"]}>
        <Routes>
          <Route
            path="/:username/:playlistSlug"
            element={<PlaylistSlugPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

  it("shows loading skeleton initially", () => {
    vi.mocked(getPlaylist).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/Loading playlist/)).toBeInTheDocument();
  });

  it("renders playlist hero after data loads", async () => {
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylistData } as any);
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );
  });

  it("renders track list with correct count", async () => {
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylistData } as any);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("1 tracks")).toBeInTheDocument(),
    );
  });

  it("renders actions and sidebar components", async () => {
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylistData } as any);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("playlist-actions")).toBeInTheDocument();
      expect(screen.getByTestId("playlist-sidebar")).toBeInTheDocument();
    });
  });

  it("shows error when fetch fails", async () => {
    vi.mocked(getPlaylist).mockRejectedValue(new Error("Fail"));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Failed to load playlist/)).toBeInTheDocument(),
    );
  });

  it("calls togglePlay when hero play is clicked on active playlist", async () => {
    const toggle = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: true,
      currentTrack: { id: "t-1", context: { playlist_id: "pl-abc" } },
      togglePlay: toggle,
      setTrack: vi.fn(),
    } as any);
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylistData } as any);
    renderPage();
    await waitFor(() => expect(screen.getByTestId("playlist-hero")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("hero-play"));
    expect(toggle).toHaveBeenCalled();
  });

  it("sets the player track when a different playlist is played", async () => {
    const setTrack = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: { id: "other-track", context: { playlist_id: "other" } },
      togglePlay: vi.fn(),
      setTrack,
    } as any);
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylistData } as any);
    renderPage();
    await waitFor(() => expect(screen.getByTestId("playlist-hero")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("hero-play"));
    expect(setTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t-1",
        title: "Track 1",
        context: {
          type: "playlist",
          playlist_id: "pl-abc",
          queue: ["t-1"],
        },
      }),
      [expect.objectContaining({ id: "t-1" })],
    );
  });

  it("renders guest footer on successful load", async () => {
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylistData } as any);
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("guest-footer")).toBeInTheDocument(),
    );
  });

  it("applies playlist updates from the actions panel", async () => {
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylistData } as any);
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Test Playlist")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("playlist-actions-update"));

    expect(screen.getByText("Updated Playlist")).toBeInTheDocument();
  });

  it("does nothing when the playlist has no tracks", async () => {
    vi.mocked(getPlaylist).mockResolvedValue({
      data: { ...mockPlaylistData, tracks: [] },
    } as any);

    const setTrack = vi.fn();
    const togglePlay = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: null,
      togglePlay,
      setTrack,
    } as any);

    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Test Playlist")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("hero-play"));

    expect(setTrack).not.toHaveBeenCalled();
    expect(togglePlay).not.toHaveBeenCalled();
  });
});
