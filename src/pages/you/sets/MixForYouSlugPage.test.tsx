import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MixForYouSlugPage from "./MixForYouSlugPage";
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

vi.mock("../../../components/playlist/Made for you/PlaylistActionsForYou", () => ({
  default: () => <div data-test="playlist-actions" />,
}));

vi.mock("../../../components/playlist/Made for you/PlaylistSidebarForYou", () => ({
  default: ({ featuredArtists }: any) => (
    <div
      data-test="playlist-sidebar"
      data-featured-count={featuredArtists?.length ?? 0}
    />
  ),
}));

vi.mock("../../../components/playlist/TrackList", () => ({
  default: ({ tracks }: any) => (
    <div data-test="track-list">{tracks?.length ?? 0} tracks</div>
  ),
}));

const mockPlaylist = {
  playlist_id: "pl-abc",
  name: "For You Mix",
  tracks: [
    { track_id: "t-1", position: 1, added_at: "2026-04-11T00:00:00Z" },
    { track_id: "t-2", position: 2, added_at: "2026-04-11T00:00:01Z" },
  ],
};

describe("MixForYouSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: null,
      togglePlay: vi.fn(),
      setTrack: vi.fn(),
    } as any);
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/mix:pl-abc"]}>
        <Routes>
          <Route path="/:mixSlug" element={<MixForYouSlugPage />} />
        </Routes>
      </MemoryRouter>,
    );

  it("shows loading before the mix is fetched", () => {
    vi.mocked(getPlaylist).mockReturnValue(new Promise(() => {}) as any);
    vi.mocked(getUsers).mockReturnValue(new Promise(() => {}) as any);

    renderPage();

    expect(screen.getByText(/Loading playlist/i)).toBeInTheDocument();
  });

  it("renders playlist details and slices featured artists to three", async () => {
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylist } as any);
    vi.mocked(getUsers).mockResolvedValue([
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
    ] as any);

    renderPage();

    await waitFor(() =>
      expect(getPlaylist).toHaveBeenCalledWith("pl-abc", {
        include_tracks: true,
      }),
    );
    expect(screen.getByTestId("playlist-hero")).toBeInTheDocument();
    expect(screen.getByTestId("playlist-actions")).toBeInTheDocument();
    expect(screen.getByTestId("playlist-sidebar")).toHaveAttribute(
      "data-featured-count",
      "3",
    );
    expect(screen.getByTestId("track-list")).toHaveTextContent("2 tracks");
    expect(screen.getByTestId("guest-footer")).toBeInTheDocument();
  });

  it("falls back to an empty featured artist list when users are not an array", async () => {
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylist } as any);
    vi.mocked(getUsers).mockResolvedValue(null as any);

    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("playlist-sidebar")).toHaveAttribute(
        "data-featured-count",
        "0",
      ),
    );
  });

  it("toggles play when the same playlist is already active", async () => {
    const togglePlay = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: true,
      currentTrack: { id: "t-1", context: { playlist_id: "pl-abc" } },
      togglePlay,
      setTrack: vi.fn(),
    } as any);
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylist } as any);
    vi.mocked(getUsers).mockResolvedValue([] as any);

    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId("hero-play"));

    expect(togglePlay).toHaveBeenCalledTimes(1);
  });

  it("sets the queue when a different playlist is played", async () => {
    const setTrack = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: { id: "other", context: { playlist_id: "other" } },
      togglePlay: vi.fn(),
      setTrack,
    } as any);
    vi.mocked(getPlaylist).mockResolvedValue({ data: mockPlaylist } as any);
    vi.mocked(getUsers).mockResolvedValue([] as any);

    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId("hero-play"));

    expect(setTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t-1",
        context: {
          type: "playlist",
          playlist_id: "pl-abc",
          queue: ["t-1", "t-2"],
        },
      }),
    );
  });

  it("shows an error when the mix request fails", async () => {
    vi.mocked(getPlaylist).mockRejectedValue(new Error("fail"));
    vi.mocked(getUsers).mockResolvedValue([] as any);

    renderPage();

    await waitFor(() =>
      expect(screen.getByText(/Failed to load playlist/i)).toBeInTheDocument(),
    );
  });

  it("does nothing when the mix playlist has no tracks", async () => {
    vi.mocked(getPlaylist).mockResolvedValue({
      data: { ...mockPlaylist, tracks: [] },
    } as any);
    vi.mocked(getUsers).mockResolvedValue([] as any);

    const togglePlay = vi.fn();
    const setTrack = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: null,
      togglePlay,
      setTrack,
    } as any);

    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId("hero-play"));

    expect(setTrack).not.toHaveBeenCalled();
    expect(togglePlay).not.toHaveBeenCalled();
  });
});
