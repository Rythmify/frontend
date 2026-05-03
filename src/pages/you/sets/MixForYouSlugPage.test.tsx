import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MixForYouSlugPage from "./MixForYouSlugPage";
import { getMixTracks } from "@/services/api/discover.service";
import { getUserById } from "@/services/user.service";
import { usePlayerStore } from "@/stores/player.store";

vi.mock("@/services/api/discover.service", () => ({
  getMixTracks: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  getUserById: vi.fn(),
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn((selector) => selector({ user: { id: "me" } })),
}));

vi.mock("@/components/Upload/GuestPageFooter", () => ({
  default: () => <div data-test="guest-footer" />,
}));

vi.mock("../../../components/playlist/PlaylistHero", () => ({
  default: ({ playlist, onPlayPause, isPlaying }: any) => (
    <div data-test="playlist-hero">
      <span>{playlist.name}</span>
      <button onClick={onPlayPause} data-test="hero-play">
        {isPlaying ? "Pause" : "Play"}
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

const mockTracks = [
  {
    id: "t-1",
    track_id: "t-1",
    title: "Butterfly Effect",
    cover_image: "https://picsum.photos/seed/501/200/200",
    duration: 225,
    user_id: "u-1",
    artist_name: "Travis Scott",
    created_at: "2026-01-15T00:00:00Z",
  },
];

const mockMix = {
  mix_id: "mix-1",
  title: "For You Mix",
  cover_url: null,
  tracks: mockTracks,
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

  const renderPage = (slug = "mix-1") =>
    render(
      <MemoryRouter initialEntries={[`/${slug}`]}>
        <Routes>
          <Route path="/:mixSlug" element={<MixForYouSlugPage />} />
        </Routes>
      </MemoryRouter>,
    );

  it("shows loading before the mix is fetched", () => {
    vi.mocked(getMixTracks).mockReturnValue(new Promise(() => {}) as any);
    renderPage();
    expect(screen.getByText(/Loading mix/i)).toBeInTheDocument();
  });

  it("renders playlist details and featured artists", async () => {
    vi.mocked(getMixTracks).mockResolvedValue(mockMix as any);
    vi.mocked(getUserById).mockResolvedValue({
      id: "u-1",
      username: "travis",
      display_name: "Travis",
    } as any);

    renderPage();

    await waitFor(() => expect(getMixTracks).toHaveBeenCalledWith("mix-1"));
    expect(screen.getByTestId("playlist-hero")).toBeInTheDocument();
    expect(screen.getByTestId("playlist-actions")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("playlist-sidebar")).toHaveAttribute(
        "data-featured-count",
        "1",
      )
    );
    expect(screen.getByTestId("track-list")).toHaveTextContent("1 tracks");
  });

  it("handles missing user data for featured artists", async () => {
    vi.mocked(getMixTracks).mockResolvedValue(mockMix as any);
    vi.mocked(getUserById).mockRejectedValue(new Error("Not found"));

    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("playlist-sidebar")).toHaveAttribute(
        "data-featured-count",
        "0",
      )
    );
  });

  it("toggles play when the same playlist is already active", async () => {
    const togglePlay = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: true,
      currentTrack: { id: "t-1", context: { playlist_id: "mix-1" } },
      togglePlay,
      setTrack: vi.fn(),
    } as any);
    vi.mocked(getMixTracks).mockResolvedValue(mockMix as any);

    renderPage();

    await waitFor(() => screen.getByTestId("hero-play"));
    fireEvent.click(screen.getByTestId("hero-play"));

    expect(togglePlay).toHaveBeenCalled();
  });

  it("sets the queue when a different playlist is played", async () => {
    const setTrack = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: null,
      togglePlay: vi.fn(),
      setTrack,
    } as any);
    vi.mocked(getMixTracks).mockResolvedValue(mockMix as any);

    renderPage();

    await waitFor(() => screen.getByTestId("hero-play"));
    fireEvent.click(screen.getByTestId("hero-play"));

    expect(setTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t-1",
        context: expect.objectContaining({
          playlist_id: "mix-1",
        }),
      }),
      expect.any(Array)
    );
  });

  it("shows error state when the request fails", async () => {
    vi.mocked(getMixTracks).mockRejectedValue(new Error("fail"));
    renderPage();

    await waitFor(() =>
      expect(screen.getByText(/Mix not found/i)).toBeInTheDocument()
    );
  });
});
