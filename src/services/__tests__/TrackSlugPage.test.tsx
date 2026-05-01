import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import TrackSlugPage from "../../pages/[username]/[trackSlug]/TrackSlugPage";
import type { Track } from "../../types/track";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// ── Mocks ──────────────────────────────────────────────────────────────────

const { mockTrack, mockNavigate } = vi.hoisted(() => {
  const mt: Track = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Msh Awl Mara",
    artistName: "Lege-Cy",
    artistUsername: "samo-lotfy",
    coverUrl: "https://picsum.photos/seed/1/300/300",
    genre: "R&B",
    likeCount: 14000,
    repostCount: 35,
    playCount: 507000,
    commentCount: 120,
    duration: "3:12",
    postedAt: "2 months ago",
    waveformData: [20, 40, 60, 30],
    audioUrl: "/audio/Track 1.mp3",
    trackSlug: "msh-awl-mara",
  };
  return { mockTrack: mt, mockNavigate: vi.fn() };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../services/track.service", () => ({
  getTrackBySlug: vi.fn().mockResolvedValue(mockTrack),
  getRelatedTracks: vi.fn().mockResolvedValue({ tracks: [] }),
  getTrackComments: vi.fn().mockResolvedValue([]),
  postComment: vi.fn().mockResolvedValue({}),
  incrementPlayCount: vi.fn(),
}));

vi.mock("../../services/user.service", () => ({
  getUserById: vi.fn().mockResolvedValue({}),
  followUser: vi.fn().mockResolvedValue({}),
  unfollowUser: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../stores/player.store", () => ({
  usePlayerStore: Object.assign(
    vi.fn(() => ({
      currentTrack: null,
      isPlaying: false,
      setTrack: vi.fn(),
      togglePlay: vi.fn(),
    })),
    {
      subscribe: vi.fn(() => vi.fn()),
      getState: vi.fn(() => ({
        seek: vi.fn(),
        play: vi.fn(),
        togglePlay: vi.fn(),
      })),
    }
  ),
}));

const { authStoreMock } = vi.hoisted(() => ({
  authStoreMock: () => {
    const store = Object.assign(
      vi.fn(() => ({
        user: { id: "user-123", username: "me", following_ids: [] },
        isAuthenticated: true,
      })),
      {
        getState: vi.fn(() => ({
          user: { id: "user-123", username: "me", following_ids: [] },
          isAuthenticated: true,
        })),
        subscribe: vi.fn(() => vi.fn()),
      }
    );
    return { useAuthStore: store };
  },
}));

vi.mock("@/stores/auth.store", authStoreMock);
vi.mock("../../stores/auth.store", authStoreMock);

// Mock children
vi.mock("../../pages/[username]/[trackSlug]/components/TrackHero", () => ({
  default: ({ track, isPlaying, onPlayPause }: any) => (
    <div data-test="track-hero">
      <span data-test="track-title">{track.title}</span>
      <button data-test="button-play-pause-hero" onClick={() => onPlayPause()}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  ),
}));

vi.mock("../../pages/[username]/[trackSlug]/components/TrackActions", () => ({
  default: () => <div data-test="track-actions-wrapper" />,
}));

vi.mock("../../pages/[username]/[trackSlug]/components/TrackList", () => ({
  default: ({ tracks }: any) => (
    <div data-test="track-list">{tracks?.length} tracks</div>
  ),
}));

vi.mock("../../pages/[username]/[trackSlug]/components/TrackSidebar", () => ({
  default: () => <div data-test="track-sidebar" />,
}));

vi.mock("../../pages/[username]/[trackSlug]/components/TrackCommentList", () => ({
  default: () => <div data-test="track-comment-list" />,
}));

import { getTrackBySlug } from "../../services/track.service";
import { usePlayerStore } from "../../stores/player.store";

describe("TrackSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = (username = "samo-lotfy", trackId = "msh-awl-mara") =>
    render(
      <MemoryRouter initialEntries={[`/${username}/${trackId}`]}>
        <Routes>
          <Route path="/:username/:trackId" element={<TrackSlugPage />} />
        </Routes>
      </MemoryRouter>
    );

  it("shows a loading skeleton before data arrives", () => {
    vi.mocked(getTrackBySlug).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByTestId("track-slug-loading")).toBeInTheDocument();
  });

  it("renders the full page once data loads", async () => {
    vi.mocked(getTrackBySlug).mockResolvedValue(mockTrack);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("track-slug-page")).toBeInTheDocument();
    });
  });

  it("displays the track title in the hero", async () => {
    vi.mocked(getTrackBySlug).mockResolvedValue(mockTrack);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("track-title")).toHaveTextContent("Msh Awl Mara");
    });
  });

  it("renders the sidebar column", async () => {
    vi.mocked(getTrackBySlug).mockResolvedValue(mockTrack);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("track-sidebar-col")).toBeInTheDocument();
    });
  });

  it("shows an error state when the fetch fails", async () => {
    vi.mocked(getTrackBySlug).mockRejectedValueOnce(new Error("Network error"));
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("track-slug-error")).toBeInTheDocument();
    });
  });
});
