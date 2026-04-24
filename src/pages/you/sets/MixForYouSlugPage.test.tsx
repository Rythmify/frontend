import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MixForYouSlugPage from "./MixForYouSlugPage";
import { getMixTracks } from "@/services/api/discover.service";
import { getUsers } from "@/services/mocks/User.service";
import { usePlayerStore } from "@/stores/player.store";

vi.mock("@/services/api/discover.service", () => ({
  getMixTracks: vi.fn(),
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

const mockMix = {
  id: "mix-1",
  label: "For You Mix",
  generated_at: "2026-04-11T00:00:00Z",
  track_count: 4,
  cover_image: null,
  flavor: "listening_history",
  genre_name: null,
  preview_track: null,
};

const mockTracks = [
  {
    id: "t-1",
    title: "Butterfly Effect",
    cover_image: "https://picsum.photos/seed/501/200/200",
    duration: 225,
    genre_name: null,
    play_count: 75000,
    like_count: 0,
    repost_count: null,
    user_id: "1",
    artist_name: "Travis Scott",
    stream_url: null,
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "t-2",
    title: "Blinding Lights",
    cover_image: "https://picsum.photos/seed/401/200/200",
    duration: 200,
    genre_name: null,
    play_count: 95000,
    like_count: 0,
    repost_count: null,
    user_id: "2",
    artist_name: "The Weeknd",
    stream_url: null,
    created_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "t-3",
    title: "Levitating",
    cover_image: "https://picsum.photos/seed/702/200/200",
    duration: 203,
    genre_name: null,
    play_count: 65000,
    like_count: 0,
    repost_count: null,
    user_id: "3",
    artist_name: "Dua Lipa",
    stream_url: null,
    created_at: "2026-02-15T00:00:00Z",
  },
  {
    id: "t-4",
    title: "Bad Guy",
    cover_image: "https://picsum.photos/seed/704/200/200",
    duration: 194,
    genre_name: null,
    play_count: 71000,
    like_count: 0,
    repost_count: null,
    user_id: "4",
    artist_name: "Billie Eilish",
    stream_url: null,
    created_at: "2026-03-01T00:00:00Z",
  },
];

const mockUsers = [
  {
    id: 1,
    username: "travis-scott",
    displayName: "Travis Scott",
    avatarUrl: "https://picsum.photos/seed/user1/100/100",
    followerCount: 42000,
    trackCount: 38,
    isFollowing: false,
  },
  {
    id: 2,
    username: "the-weeknd",
    displayName: "The Weeknd",
    avatarUrl: "https://picsum.photos/seed/user2/100/100",
    followerCount: 31500,
    trackCount: 22,
    isFollowing: true,
  },
  {
    id: 3,
    username: "dua-lipa",
    displayName: "Dua Lipa",
    avatarUrl: "https://picsum.photos/seed/user3/100/100",
    followerCount: 18200,
    trackCount: 61,
    isFollowing: false,
  },
  {
    id: 4,
    username: "billie-eilish",
    displayName: "Billie Eilish",
    avatarUrl: "https://picsum.photos/seed/user4/100/100",
    followerCount: 95000,
    trackCount: 45,
    isFollowing: false,
  },
];

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
    vi.mocked(getMixTracks).mockReturnValue(new Promise(() => {}) as any);
    vi.mocked(getUsers).mockReturnValue(new Promise(() => {}) as any);

    renderPage();

    expect(screen.getByText(/Loading mix/i)).toBeInTheDocument();
  });

  it("renders playlist details and all featured artists", async () => {
    vi.mocked(getMixTracks).mockResolvedValue({
      mix: mockMix,
      tracks: mockTracks,
    } as any);
    vi.mocked(getUsers).mockResolvedValue(mockUsers as any);

    renderPage();

    await waitFor(() =>
      expect(getMixTracks).toHaveBeenCalledWith("pl-abc"),
    );
    expect(screen.getByTestId("playlist-hero")).toBeInTheDocument();
    expect(screen.getByTestId("playlist-actions")).toBeInTheDocument();
    expect(screen.getByTestId("playlist-sidebar")).toHaveAttribute(
      "data-featured-count",
      "4",
    );
    expect(screen.getByTestId("track-list")).toHaveTextContent("4 tracks");
    expect(screen.getByTestId("guest-footer")).toBeInTheDocument();
  });

  it("falls back to an empty featured artist list when users are not an array", async () => {
    vi.mocked(getMixTracks).mockResolvedValue({
      mix: mockMix,
      tracks: mockTracks,
    } as any);
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
      currentTrack: { id: "t-1", context: { playlist_id: "mix-1" } },
      togglePlay,
      setTrack: vi.fn(),
    } as any);
    vi.mocked(getMixTracks).mockResolvedValue({
      mix: mockMix,
      tracks: mockTracks,
    } as any);
    vi.mocked(getUsers).mockResolvedValue(mockUsers as any);

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
    vi.mocked(getMixTracks).mockResolvedValue({
      mix: mockMix,
      tracks: mockTracks,
    } as any);
    vi.mocked(getUsers).mockResolvedValue(mockUsers as any);

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
          playlist_id: "mix-1",
          queue: ["t-1", "t-2", "t-3", "t-4"],
        },
      }),
      expect.any(Array),
    );
  });

  it("falls back to the mock mix when the request fails", async () => {
    vi.mocked(getMixTracks).mockRejectedValue(new Error("fail"));
    vi.mocked(getUsers).mockResolvedValue([] as any);

    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );
  });

  it("does nothing when the mix playlist has no tracks", async () => {
    vi.mocked(getMixTracks).mockResolvedValue({
      mix: mockMix,
      tracks: [],
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
