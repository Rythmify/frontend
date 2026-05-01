import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useParams } from "react-router-dom";

import MoreOfLikeSlugPage from "./MoreOfLikeSlugPage";
import { getRelatedTracks } from "@/services/track.service";
import { getRadioTracks } from "@/services/api/playlist/playlist.service";
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

vi.mock("@/services/track.service", () => ({
  getRelatedTracks: vi.fn(),
}));

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getRadioTracks: vi.fn(),
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
  default: ({ playlist, onPlayPause, ownerUsername, moreOfLikeTitle }: any) => (
    <div data-test="playlist-hero">
      <span data-test="hero-name">{playlist?.name}</span>
      <span data-test="hero-owner">{ownerUsername ?? ""}</span>
      <span data-test="hero-title">{moreOfLikeTitle ?? ""}</span>
      <button data-test="hero-play" onClick={onPlayPause}>
        play
      </button>
    </div>
  ),
}));

vi.mock("@/components/playlist/Made for you/PlaylistActionsForYou", () => ({
  default: ({ playlist, initialTracks, engagementKind, radioSeedTrack }: any) => (
    <div
      data-test="playlist-actions"
      data-count={String(initialTracks?.length ?? 0)}
      data-kind={String(engagementKind)}
      data-seed={radioSeedTrack?.id ?? ""}
      data-playlist={playlist?.playlist_id ?? ""}
    />
  ),
}));

vi.mock("../../../components/playlist/Made for you/PlaylistSidebarForYou", () => ({
  default: ({ featuredArtists, playlist }: any) => (
    <div
      data-test="playlist-sidebar"
      data-featured-count={String(featuredArtists?.length ?? 0)}
      data-playlist={playlist?.playlist_id ?? ""}
    >
      {featuredArtists?.map((artist: any) => (
        <span key={artist.id}>{artist.username}</span>
      ))}
    </div>
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

const mockRelatedTracks = [
  {
    id: "track-1",
    title: "First Related",
    duration: "3:30",
    postedAt: "2026-04-10T00:00:00Z",
    artistId: "artist-a",
    artistName: "Artist A",
    artistUsername: "artist-a",
    coverUrl: "https://cdn.example.com/a.jpg",
    audioUrl: "https://cdn.example.com/a.mp3",
    playCount: 12,
    repostCount: 2,
    likeCount: 5,
    isPrivate: false,
    commentCount: 0,
    genre: "pop",
    waveformData: [],
  },
  {
    id: "track-2",
    title: "Second Related",
    duration: "4:10",
    postedAt: "2026-04-11T00:00:00Z",
    artistId: "artist-b",
    artistName: "Artist B",
    artistUsername: "artist-b",
    coverUrl: "https://cdn.example.com/b.jpg",
    audioUrl: "https://cdn.example.com/b.mp3",
    playCount: 8,
    repostCount: 0,
    likeCount: 3,
    isPrivate: false,
    commentCount: 0,
    genre: "rock",
    waveformData: [],
  },
];

const mockSeedTrack = {
  ...mockRelatedTracks[0],
  title: "Seed Track",
  id: "seed-track",
  artistUsername: "11111111-1111-1111-1111-111111111111",
  artistId: "artist-a",
};

const mockRadioPayload = {
  playlist_id: "radio-1",
  title: "Radio Mix",
  description: "Radio description",
  cover_image: "https://cdn.example.com/radio.jpg",
  reference_track: {
    id: "radio-seed",
    title: "Radio Seed",
    user_id: "artist-c",
    artist_name: "Artist C",
    cover_image: "https://cdn.example.com/radio-seed.jpg",
    genre_name: "hip-hop",
    like_count: 9,
    repost_count: 1,
    play_count: 13,
    created_at: "2026-04-12T00:00:00Z",
    duration: 180,
    stream_url: "https://cdn.example.com/radio-seed.mp3",
  },
  tracks: [
    {
      id: "radio-track-1",
      title: "Radio Track 1",
      user_id: "artist-c",
      artist_name: "Artist C",
      cover_image: "https://cdn.example.com/radio-1.jpg",
      genre_name: "hip-hop",
      like_count: 2,
      repost_count: 0,
      play_count: 14,
      created_at: "2026-04-12T00:00:00Z",
      duration: 200,
      stream_url: "https://cdn.example.com/radio-1.mp3",
    },
    {
      id: "radio-track-2",
      title: "Radio Track 2",
      user_id: "artist-d",
      artist_name: "Artist D",
      cover_image: "https://cdn.example.com/radio-2.jpg",
      genre_name: "hip-hop",
      like_count: 1,
      repost_count: 0,
      play_count: 4,
      created_at: "2026-04-12T00:00:00Z",
      duration: 240,
      stream_url: "https://cdn.example.com/radio-2.mp3",
    },
  ],
};

describe("MoreOfLikeSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "me",
        following_ids: ["artist-a"],
      },
    } as any);
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: null,
      togglePlay: vi.fn(),
      setTrack: vi.fn(),
    } as any);
  });

  it("renders the related-tracks flow and prepares the play queue", async () => {
    vi.mocked(useParams).mockReturnValue({
      username: "listener",
      playlistSlug: "seed-track-1",
    } as any);
    vi.mocked(getRelatedTracks).mockResolvedValue({
      referenceTrack: mockSeedTrack as any,
      tracks: mockRelatedTracks as any,
    } as any);
    vi.mocked(getUserById).mockImplementation(async (id: string) => {
      if (id === "artist-a") {
        return {
          id: "artist-a",
          username: "artist-a",
          display_name: "Artist A",
          followers_count: 15,
        } as any;
      }
      if (id === "artist-b") {
        return {
          id: "artist-b",
          username: "artist-b",
          display_name: "Artist B",
          followers_count: 9,
        } as any;
      }
      if (id === "11111111-1111-1111-1111-111111111111") {
        return {
          id: id,
          username: "album-owner",
          display_name: "Album Owner",
        } as any;
      }
      return null as any;
    });

    render(<MoreOfLikeSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("hero-name")).toHaveTextContent(
      "Related tracks: Seed Track",
    );
    expect(screen.getByTestId("hero-owner")).toHaveTextContent("album-owner");
    expect(screen.getByTestId("hero-title")).toHaveTextContent("Seed Track");
    expect(screen.getByTestId("track-list")).toHaveAttribute("data-count", "3");
    expect(screen.getByTestId("playlist-actions")).toHaveAttribute(
      "data-kind",
      "radioTracks",
    );
    expect(screen.getByTestId("playlist-sidebar")).toHaveAttribute(
      "data-featured-count",
      "2",
    );
    expect(screen.getByText("artist-a")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("hero-play"));

    expect(vi.mocked(usePlayerStore).mock.results[0]?.value.setTrack).toHaveBeenCalled();
  });

  it("uses the radio playlist branch when the slug is a UUID", async () => {
    const setTrack = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue({
      isPlaying: false,
      currentTrack: null,
      togglePlay: vi.fn(),
      setTrack,
    } as any);
    vi.mocked(useParams).mockReturnValue({
      username: "listener",
      playlistSlug: "22222222-2222-2222-2222-222222222222",
    } as any);
    vi.mocked(getRadioTracks).mockResolvedValue(mockRadioPayload as any);
    vi.mocked(getUserById).mockImplementation(async (id: string) => {
      if (id === "artist-c") {
        return {
          id: "artist-c",
          username: "artist-c",
          display_name: "Artist C",
          followers_count: 44,
        } as any;
      }
      if (id === "artist-d") {
        return {
          id: "artist-d",
          username: "artist-d",
          display_name: "Artist D",
          followers_count: 19,
        } as any;
      }
      return null as any;
    });

    render(<MoreOfLikeSlugPage />);

    await waitFor(() =>
      expect(screen.getByTestId("playlist-hero")).toBeInTheDocument(),
    );

    expect(screen.getByTestId("hero-name")).toHaveTextContent("Radio Mix");
    expect(screen.getByTestId("hero-title")).toHaveTextContent("Radio Seed");
    expect(screen.getByTestId("track-list")).toHaveAttribute("data-count", "3");
    expect(screen.getByTestId("playlist-actions")).toHaveAttribute(
      "data-seed",
      "radio-seed",
    );

    fireEvent.click(screen.getByTestId("track-radio-track-1"));

    expect(setTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "radio-track-1",
        context: expect.objectContaining({
          playlist_id: "radio-1",
        }),
      }),
      expect.any(Array),
    );
  });

  it("shows an error when the slug is missing", async () => {
    vi.mocked(useParams).mockReturnValue({
      username: "listener",
      playlistSlug: undefined,
    } as any);

    render(<MoreOfLikeSlugPage />);

    await waitFor(() =>
      expect(screen.getByText(/Related tracks not found/i)).toBeInTheDocument(),
    );
  });
});
