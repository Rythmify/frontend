import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlaylistHero from "../PlaylistHero";
import { getGenres } from "@/services/api/upload/track.service";

vi.mock("@/services/api/upload/track.service", () => ({
  getGenres: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({ user: { displayName: "Mariam", username: "mariam", id: "u-1" } }),
}));

vi.mock("../PlaylistCover", () => ({
  default: ({ playlistName }: any) => (
    <div data-test="mock-playlist-cover">{playlistName}</div>
  ),
}));

vi.mock("../PlaylistStatsWaveform", () => ({
  default: () => <div data-test="mock-playlist-waveform" />,
}));

const playlist = {
  playlist_id: "pl-1",
  name: "Electronic Mix",
  is_public: false,
  track_count: 12,
  owner_user_id: "u-2",
  cover_image: "cover.jpg",
  created_at: "2026-01-01T00:00:00Z",
  release_date: "2026-01-01T00:00:00Z",
  subtype: "playlist",
  genre_id: "genre-electronic",
  tracks: [{ title: "Seed Track" }],
} as any;

describe("PlaylistHero", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the playlist title, owner label, and private badge", async () => {
    vi.mocked(getGenres).mockResolvedValue([{ id: "genre-electronic", name: "Electronic" }] as any);

    render(
      <MemoryRouter>
        <PlaylistHero playlist={playlist} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Electronic Mix" })).toBeInTheDocument();
    expect(screen.getByText("u-2")).toBeInTheDocument();
    expect(screen.getByTestId("mock-playlist-cover")).toHaveTextContent("Electronic Mix");

    await waitFor(() => expect(screen.getByText("# Electronic")).toBeInTheDocument());
    expect(screen.getByText(/Private/)).toBeInTheDocument();
  });

  it("uses genre fallback when getGenres fails", async () => {
    vi.mocked(getGenres).mockRejectedValue(new Error("boom"));

    render(
      <MemoryRouter>
        <PlaylistHero playlist={playlist} />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("# genre-electronic")).toBeInTheDocument());
  });

  it("renders the more-of-like and station title variants", () => {
    render(
      <MemoryRouter>
        <PlaylistHero
          playlist={playlist}
          moreOfLike
          moreOfLikeTitle="Seed Title"
          ownerUsername="artist-x"
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("Related Tracks: Seed Title")).toBeInTheDocument();
    expect(screen.getByText("Made for Mariam")).toBeInTheDocument();

    render(
      <MemoryRouter>
        <PlaylistHero
          playlist={playlist}
          isStation
          ownerUsername="artist-x"
          showUploadButton={false}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("artist-x's Station")).toBeInTheDocument();
    expect(screen.getByText("Artist Station")).toBeInTheDocument();
  });

  it("renders the play/pause button and forwards clicks", () => {
    const onPlayPause = vi.fn();
    render(
      <MemoryRouter>
        <PlaylistHero playlist={playlist} onPlayPause={onPlayPause} isPlaying />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("button-play-pause-hero-playlist"));
    expect(onPlayPause).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("mock-playlist-waveform")).toBeInTheDocument();
  });
});
