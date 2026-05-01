import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useParams } from "react-router-dom";

import MadeForYouSlugPage from "./MadeForYouSlugPage";
import { getMadeForYouDaily, getMadeForYouWeekly } from "@/services/api/playlist/playlist.service";
import { getUserById } from "@/services/user.service";
import { usePlayerStore } from "@/stores/player.store";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getMadeForYouDaily: vi.fn(),
  getMadeForYouWeekly: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  getUserById: vi.fn(),
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/components/playlist/PlaylistHero", () => ({
  default: ({ playlist, onPlayPause, forYouBadgeWords, coverImages }: any) => (
    <div data-test="playlist-hero">
      <span data-test="hero-name">{playlist?.name}</span>
      <span data-test="hero-badges">{forYouBadgeWords?.join(" / ")}</span>
      <span data-test="hero-covers">{String(coverImages?.length ?? 0)}</span>
      <button data-test="hero-play" onClick={onPlayPause}>
        play
      </button>
    </div>
  ),
}));

vi.mock("../../../components/playlist/Made for you/PlaylistActionsForYou", () => ({
  default: ({ playlist, engagementKind, generatedPlaylistTitle }: any) => (
    <div
      data-test="playlist-actions"
      data-kind={String(engagementKind)}
      data-title={generatedPlaylistTitle ?? ""}
      data-playlist={playlist?.playlist_id ?? ""}
    />
  ),
}));

vi.mock("../../../components/playlist/Made for you/PlaylistSidebarForYou", () => ({
  default: ({ featuredArtists }: any) => (
    <div data-test="playlist-sidebar" data-featured-count={String(featuredArtists?.length ?? 0)} />
  ),
}));

vi.mock("../../../components/playlist/TrackList", () => ({
  default: ({ tracks, onTrackPlay }: any) => (
    <div data-test="track-list" data-count={String(tracks?.length ?? 0)}>
      {tracks?.map((track: any) => (
        <button
          key={track.track_id}
          data-test={`track-${track.track_id}`}
          onClick={() => onTrackPlay(track)}
        >
          {track.title}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/Upload/GuestPageFooter", () => ({
  default: () => <div data-test="guest-footer" />,
}));

const dailyPayload = {
  mix_id: "daily-1",
  title: "Daily Mix",
  cover_url: "https://cdn.example.com/daily.jpg",
  tracks: [
    {
      id: "daily-track-1",
      title: "Daily Track 1",
      created_at: "2026-04-12T00:00:00Z",
      duration: 180,
      cover_image: "https://cdn.example.com/daily-track-1.jpg",
      artist_name: "Artist One",
      user_id: "artist-1",
      stream_url: "https://cdn.example.com/daily-1.mp3",
      play_count: 4,
    },
    {
      id: "daily-track-2",
      title: "Daily Track 2",
      created_at: "2026-04-12T00:00:00Z",
      duration: 190,
      cover_image: "https://cdn.example.com/daily-track-2.jpg",
      artist_name: "Artist One",
      user_id: "artist-1",
      stream_url: "https://cdn.example.com/daily-2.mp3",
      play_count: 5,
    },
  ],
};

const weeklyPayload = {
  mix_id: "weekly-1",
  title: "Weekly Mix",
  cover_url: "https://cdn.example.com/weekly.jpg",
  tracks: [
    {
      id: "weekly-track-1",
      title: "Weekly Track 1",
      created_at: "2026-04-12T00:00:00Z",
      duration: 200,
      cover_image: "https://cdn.example.com/weekly-track-1.jpg",
      artist_name: "Artist Two",
      user_id: "artist-2",
      stream_url: "https://cdn.example.com/weekly-1.mp3",
      play_count: 2,
    },
  ],
};

describe("MadeForYouSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockImplementation((selector?: any) =>
      selector ? selector({ user: { id: "me" } }) : { user: { id: "me" } },
    );
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: null,
      togglePlay: vi.fn(),
      setTrack: vi.fn(),
    } as any);
  });

  it("renders the daily mix and starts playback", async () => {
    vi.mocked(useParams).mockReturnValue({
      kind: "daily",
      madeSlug: "daily-mix",
    } as any);
    vi.mocked(getMadeForYouDaily).mockResolvedValue(dailyPayload as any);
    vi.mocked(getUserById).mockResolvedValue({
      id: "artist-1",
      username: "artist-1",
      display_name: "Artist One",
    } as any);

    render(<MadeForYouSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("hero-name")).toHaveTextContent("Daily Mix");
    expect(screen.getByTestId("hero-badges")).toHaveTextContent("DAILY / DROPS");
    expect(screen.getByTestId("hero-covers")).toHaveTextContent("2");
    expect(screen.getByTestId("playlist-actions")).toHaveAttribute(
      "data-kind",
      "mix",
    );
    expect(screen.getByTestId("playlist-sidebar")).toHaveAttribute(
      "data-featured-count",
      "1",
    );

    fireEvent.click(screen.getByTestId("hero-play"));

    const store = vi.mocked(usePlayerStore).mock.results[0]?.value;
    expect(store.setTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "daily-track-1",
        context: expect.objectContaining({
          playlist_id: "daily-1",
          queue: ["daily-track-1", "daily-track-2"],
        }),
      }),
      expect.any(Array),
    );
  });

  it("uses the weekly mix branch and toggles playback when already active", async () => {
    const togglePlay = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: true,
      currentTrack: { id: "weekly-track-1", context: { playlist_id: "weekly-1" } },
      togglePlay,
      setTrack: vi.fn(),
    } as any);
    vi.mocked(useParams).mockReturnValue({
      kind: "weekly",
      playlistSlug: "weekly-mix",
    } as any);
    vi.mocked(getMadeForYouWeekly).mockResolvedValue(weeklyPayload as any);
    vi.mocked(getUserById).mockResolvedValue({
      id: "artist-2",
      username: "artist-2",
      display_name: "Artist Two",
    } as any);

    render(<MadeForYouSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("hero-badges")).toHaveTextContent("WEEKLY / WAVE");

    fireEvent.click(screen.getByTestId("hero-play"));

    expect(togglePlay).toHaveBeenCalled();
  });

  it("shows an error for an unsupported slug", async () => {
    vi.mocked(useParams).mockReturnValue({
      kind: "unknown",
      madeSlug: "unsupported",
    } as any);

    render(<MadeForYouSlugPage />);

    await waitFor(() =>
      expect(screen.getByText(/Made for you mix not found/i)).toBeInTheDocument(),
    );
  });
});
