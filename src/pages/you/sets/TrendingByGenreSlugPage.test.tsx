import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import TrendingByGenreSlugPage from "./TrendingByGenreSlugPage";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ playlistSlug: "genre-1" }),
  };
});

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: () => ({
    setTrack: vi.fn(),
    togglePlay: vi.fn(),
    isPlaying: false,
    currentTrack: null,
  }),
}));

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getTrendingByGenre: vi.fn(async () => ({
    genre_id: "genre-1",
    genre_name: "Rock",
    tracks: [
      {
        id: "track-1",
        title: "Track 1",
        duration: 120,
        cover_image: null,
        created_at: "2026-01-01T00:00:00.000Z",
        artist_name: "Artist",
        user_id: "user-1",
        like_count: 0,
        repost_count: 0,
        stream_url: "",
        play_count: 0,
      },
    ],
  })),
}));

vi.mock("@/services/user.service", () => ({
  getUserById: vi.fn(async () => null),
}));

vi.mock("@/components/playlist/PlaylistHero", () => ({
  default: () => <div data-test="playlist-hero" />,
}));

vi.mock("@/components/playlist/Made for you/PlaylistSidebarForYou", () => ({
  default: () => <div data-test="playlist-sidebar" />,
}));

vi.mock("@/components/playlist/TrackList", () => ({
  default: () => <div data-test="track-list" />,
}));

vi.mock("@/components/Upload/GuestPageFooter", () => ({
  default: () => <div data-test="guest-footer" />,
}));

vi.mock("@/components/playlist/Album/PlaylistActionsAlbum", () => ({
  default: () => <div data-test="playlist-actions-album" />,
}));

vi.mock("@/components/playlist/PlaylistActionsGuest", () => ({
  default: () => <div data-test="playlist-actions-guest" />,
}));

describe("TrendingByGenreSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders guest actions when the user is not authenticated", async () => {
    vi.mocked(useAuthStore).mockImplementation((selector: any) =>
      selector({ isAuthenticated: false }),
    );

    render(<TrendingByGenreSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-actions-guest")).toBeInTheDocument(),
    );
  });

  it("renders album actions when the user is authenticated", async () => {
    vi.mocked(useAuthStore).mockImplementation((selector: any) =>
      selector({ isAuthenticated: true }),
    );

    render(<TrendingByGenreSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-actions-album")).toBeInTheDocument(),
    );
  });
});
