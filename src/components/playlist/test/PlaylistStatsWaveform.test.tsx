import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PlaylistStatsWaveform from "@/components/playlist/PlaylistStatsWaveform";

const mockGetTrackComments = vi.fn();

vi.mock("@/pages/[username]/[trackSlug]/components/TrackWaveform", () => ({
  default: () => <div data-test="mock-track-waveform" />,
}));

vi.mock("@/services/mocks/Track.service", () => ({
  getTrackComments: (...args: unknown[]) => mockGetTrackComments(...args),
}));

const playlist = {
  playlist_id: "pl-1",
  name: "Test Album",
  is_public: true,
  track_count: 2,
  like_count: 12,
  repost_count: 4,
  tracks: [
    {
      track_id: "t1",
      position: 1,
      added_at: "2026-01-01T00:00:00Z",
      title: "Alpha",
      artist_name: "ArtA",
      artist_username: "ua",
      duration: 90,
      play_count: 10,
      audio_url: "/audio/a.mp3",
      is_public: true,
    },
    {
      track_id: "t2",
      position: 2,
      added_at: "2026-01-01T00:01:00Z",
      title: "Beta",
      artist_name: "ArtB",
      artist_username: "ub",
      duration: 150,
      play_count: 20,
      audio_url: "/audio/b.mp3",
      is_public: true,
    },
  ],
} as any;

describe("PlaylistStatsWaveform", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the stats badge when not playing", () => {
    render(<PlaylistStatsWaveform playlist={playlist} />);

    expect(screen.getByTestId("playlist-stats-badge")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Tracks")).toBeInTheDocument();
    expect(screen.getByText("4:00")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-track-waveform")).not.toBeInTheDocument();
  });

  it("shows the waveform and fetched comment avatars when playing", async () => {
    mockGetTrackComments.mockResolvedValue([
      { id: 1, avatarUrl: "https://example.com/a.jpg", timestamp: 12 },
      { id: 2, avatarUrl: "https://example.com/b.jpg", timestamp: 34 },
    ]);

    render(
      <PlaylistStatsWaveform
        playlist={playlist}
        isPlaying
        activeTrackId="t1"
      />,
    );

    expect(screen.getByTestId("mock-track-waveform")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByTestId("playlist-comment-avatars")).toBeInTheDocument(),
    );

    expect(screen.getAllByAltText("commenter")).toHaveLength(2);
  });

  it("uses the comments prop when provided", () => {
    render(
      <PlaylistStatsWaveform
        playlist={playlist}
        isPlaying
        activeTrackId="t1"
        comments={[
          { id: 10, avatarUrl: "https://example.com/c.jpg", timestamp: 5 },
        ]}
      />,
    );

    expect(screen.getByTestId("playlist-comment-avatars")).toBeInTheDocument();
    expect(screen.getAllByAltText("commenter")).toHaveLength(1);
    expect(mockGetTrackComments).not.toHaveBeenCalled();
  });
});
