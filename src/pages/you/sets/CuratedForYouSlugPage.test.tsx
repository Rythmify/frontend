import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useParams } from "react-router-dom";

import CuratedForYouSlugPage from "./CuratedForYouSlugPage";
import { getCuratedMixByIdFromHome } from "@/services/api/discover.service";
import { getRelatedTracks } from "@/services/track.service";
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

vi.mock("@/services/api/discover.service", () => ({
  getCuratedMixByIdFromHome: vi.fn(),
}));

vi.mock("@/services/track.service", () => ({
  getRelatedTracks: vi.fn(),
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

vi.mock("../../../components/playlist/PlaylistHero", () => ({
  default: ({ playlist, onPlayPause }: any) => (
    <div data-test="playlist-hero">
      <span data-test="hero-name">{playlist?.name}</span>
      <button data-test="hero-play" onClick={onPlayPause}>
        play
      </button>
    </div>
  ),
}));

vi.mock("@/components/playlist/PlaylistActionsGuest", () => ({
  default: () => <div data-test="playlist-actions-guest" />,
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

const mixPreview = {
  mix_id: "mix-1",
  title: "Curated Mix",
  description: "Picked for you",
  cover_url: "https://cdn.example.com/mix.jpg",
  preview_track: {
    id: "preview-1",
    created_at: "2026-04-12T00:00:00Z",
  },
};

const relatedTracks = [
  {
    id: "track-1",
    title: "Related A",
    duration: "3:20",
    postedAt: "2026-04-12T00:00:00Z",
    artistId: "artist-1",
    artistName: "Artist One",
    artistUsername: "artist-1",
    coverUrl: "https://cdn.example.com/a.jpg",
    audioUrl: "https://cdn.example.com/a.mp3",
    playCount: 7,
    repostCount: 0,
    likeCount: 1,
    isPrivate: false,
    commentCount: 0,
    genre: "pop",
    waveformData: [],
  },
];

describe("CuratedForYouSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ mixSlug: "mix-1" } as any);
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

  it("shows loading before the mix resolves", () => {
    vi.mocked(getCuratedMixByIdFromHome).mockReturnValue(new Promise(() => {}) as any);

    render(<CuratedForYouSlugPage />);

    expect(screen.getByText(/Loading mix/i)).toBeInTheDocument();
  });

  it("renders the mix and queues tracks for playback", async () => {
    vi.mocked(getCuratedMixByIdFromHome).mockResolvedValue(mixPreview as any);
    vi.mocked(getRelatedTracks).mockResolvedValue({
      referenceTrack: {
        id: "preview-1",
        title: "Preview Track",
        artistId: "artist-1",
        artistName: "Artist One",
        artistUsername: "artist-1",
        postedAt: "2026-04-12T00:00:00Z",
        duration: "3:10",
        coverUrl: "https://cdn.example.com/preview.jpg",
        audioUrl: "https://cdn.example.com/preview.mp3",
      },
      tracks: relatedTracks as any,
    } as any);
    vi.mocked(getUserById).mockResolvedValue({
      id: "artist-1",
      username: "artist-1",
      display_name: "Artist One",
    } as any);

    render(<CuratedForYouSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("hero-name")).toHaveTextContent("Curated Mix");
    expect(screen.getByTestId("playlist-actions-guest")).toBeInTheDocument();
    expect(screen.getByTestId("track-list")).toHaveAttribute("data-count", "1");
    expect(screen.getByTestId("playlist-sidebar")).toHaveAttribute(
      "data-featured-count",
      "1",
    );

    fireEvent.click(screen.getByTestId("hero-play"));

    const store = vi.mocked(usePlayerStore).mock.results[0]?.value;
    expect(store.setTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "track-1",
        context: expect.objectContaining({
          playlist_id: "mix-1",
          queue: ["track-1"],
        }),
      }),
      expect.any(Array),
    );
  });

  it("shows an error when the curated mix cannot be loaded", async () => {
    vi.mocked(getCuratedMixByIdFromHome).mockResolvedValue(null as any);

    render(<CuratedForYouSlugPage />);

    await waitFor(() =>
      expect(screen.getByText(/Mix not found/i)).toBeInTheDocument(),
    );
  });
});
