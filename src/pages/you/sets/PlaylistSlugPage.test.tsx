import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PlaylistSlugPage from "./PlaylistSlugPage";
import MixForYouSlugPage from "./MixForYouSlugPage";
import { getPlaylist } from "@/services/api/playlist/playlist.service";
import { usePlayerStore } from "@/stores/player.store";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getPlaylist: vi.fn(),
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn(),
}));

vi.mock("@/components/Upload/GuestPageFooter", () => ({
  default: () => <div data-testid="guest-footer" />,
}));

vi.mock("../../../components/playlist/PlaylistHero", () => ({
  default: ({ playlist, onPlayPause }: any) => (
    <div data-testid="playlist-hero">
      <span>{playlist.name}</span>
      <button onClick={onPlayPause} data-testid="hero-play">
        Play
      </button>
    </div>
  ),
}));

vi.mock("../../../components/playlist/PlaylistActions", () => ({
  default: () => <div data-testid="playlist-actions" />,
}));
vi.mock("../../../components/playlist/PlaylistSidebar", () => ({
  default: () => <div data-testid="playlist-sidebar" />,
}));
vi.mock("../../../components/playlist/TrackList", () => ({
  default: ({ tracks }: any) => (
    <div data-testid="track-list">{tracks?.length} tracks</div>
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
    } as any);
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
    } as any);
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylistData } as any);
    renderPage();
    await waitFor(() => screen.getByTestId("hero-play").click());
    expect(toggle).toHaveBeenCalled();
  });

  it("renders guest footer on successful load", async () => {
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylistData } as any);
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("guest-footer")).toBeInTheDocument(),
    );
  });
});
