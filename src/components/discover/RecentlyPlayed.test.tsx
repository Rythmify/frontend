import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecentlyPlayed from "./RecentlyPlayed";
import type { HistoryEntry } from "@/stores/history.store";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/stores/history.store", () => ({ useHistoryStore: vi.fn() }));
vi.mock("@/services/api/discover.service", () => ({
  getRecentlyPlayed: vi.fn(),
}));
vi.mock("@/services/api/discover.mapper", () => ({
  mapRecentlyPlayedEntry: (t: any) => ({ ...t, id: t.id }),
}));

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({ title, children }: any) => (
    <div data-test="carousel-wrapper">
      <h2 data-test="carousel-title">{title}</h2>
      <div data-test="carousel-scroll-container">{children}</div>
    </div>
  ),
}));

vi.mock("@/components/UI/card/Card", () => ({
  default: ({ track }: any) => <div data-test={`track-card-${track.id}`} />,
}));
vi.mock("@/components/UI/StationCard/StationCard", () => ({
  default: ({ station }: any) => (
    <div data-test={`station-card-${station.id}`} />
  ),
}));
vi.mock("@/components/UI/MixCard/MixCard", () => ({
  default: ({ mix }: any) => <div data-test={`mix-card-${mix.id}`} />,
}));
vi.mock("@/components/UI/PlaylistCard/PlaylistCard", () => ({
  default: ({ item }: any) => <div data-test={`playlist-card-${item.id}`} />,
}));
vi.mock("@/components/UI/AlbumCard", () => ({
  default: ({ item }: any) => <div data-test={`album-card-${item.id}`} />,
}));
vi.mock("@/components/UI/GenreCard/GenreCard", () => ({
  default: ({ item }: any) => <div data-test={`genre-card-${item.id}`} />,
}));
vi.mock("@/components/UI/MadeForYouCard/MadeForYouCard", () => ({
  default: ({ item }: any) => <div data-test={`mfy-card-${item.id}`} />,
}));

import { useHistoryStore } from "@/stores/history.store";
import { getRecentlyPlayed } from "@/services/api/discover.service";

// ─── Fixtures ─────────────────────────────────────────────

const makeTrack = (id: string) => ({
  id,
  title: `Track ${id}`,
  artistName: "Artist",
  artistUsername: "artist",
  coverUrl: "",
  genre: "Pop",
  likeCount: 0,
  repostCount: 0,
  playCount: 0,
  commentCount: 0,
  duration: "3:00",
  postedAt: "2026-01-01",
  audioUrl: "",
  waveformData: [],
});

const makeTrackEntry = (id: string): HistoryEntry => ({
  type: "track",
  item: makeTrack(id),
  playedAt: "2026-01-01T00:00:00Z",
});

// ─── Test Suite ───────────────────────────────────────────

describe("RecentlyPlayed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRecentlyPlayed).mockResolvedValue([]);
    vi.mocked(useHistoryStore).mockReturnValue({ entries: [] } as any);
  });

  it("renders the section container", () => {
    vi.mocked(useHistoryStore).mockReturnValue({
      entries: [makeTrackEntry("t1")],
    } as any);
    render(<RecentlyPlayed />);
    expect(screen.getByTestId("section-recently-played")).toBeInTheDocument();
  });

  it("renders the 'Recently played' carousel title", () => {
    vi.mocked(useHistoryStore).mockReturnValue({
      entries: [makeTrackEntry("t1")],
    } as any);
    render(<RecentlyPlayed />);
    expect(screen.getByTestId("carousel-title")).toHaveTextContent(
      "Recently played",
    );
  });

  it("renders a StationCard for station entries", () => {
    const stationEntry = {
      type: "station",
      item: { id: "s1", name: "Station 1", previewTrack: undefined },
      playedAt: "",
    } as unknown as HistoryEntry;
    vi.mocked(useHistoryStore).mockReturnValue({
      entries: [stationEntry],
    } as any);
    render(<RecentlyPlayed />);
    expect(screen.getByTestId("station-card-s1")).toBeInTheDocument();
  });

  it("renders a MixCard for mix entries", () => {
    const mixEntry = {
      type: "mix",
      item: { id: "m1", preview_track: null },
      playedAt: "",
    } as unknown as HistoryEntry;
    vi.mocked(useHistoryStore).mockReturnValue({
      entries: [mixEntry],
    } as any);
    render(<RecentlyPlayed />);
    expect(screen.getByTestId("mix-card-m1")).toBeInTheDocument();
  });

  it("renders a PlaylistCard for playlist entries", () => {
    const playlistEntry = {
      type: "playlist",
      item: { id: "p1", title: "My Playlist" },
      playedAt: "",
    } as unknown as HistoryEntry;
    vi.mocked(useHistoryStore).mockReturnValue({
      entries: [playlistEntry],
    } as any);
    render(<RecentlyPlayed />);
    expect(screen.getByTestId("playlist-card-p1")).toBeInTheDocument();
  });

  it("renders an AlbumCard for album entries", () => {
    const albumEntry = {
      type: "album",
      item: { id: "al1", previewTrack: undefined },
      playedAt: "",
    } as unknown as HistoryEntry;
    vi.mocked(useHistoryStore).mockReturnValue({
      entries: [albumEntry],
    } as any);
    render(<RecentlyPlayed />);
    expect(screen.getByTestId("album-card-al1")).toBeInTheDocument();
  });

  it("renders a GenreCard for genre entries", () => {
    const genreEntry = {
      type: "genre",
      item: { id: "g1", previewTrack: undefined },
      playedAt: "",
    } as unknown as HistoryEntry;
    vi.mocked(useHistoryStore).mockReturnValue({
      entries: [genreEntry],
    } as any);
    render(<RecentlyPlayed />);
    expect(screen.getByTestId("genre-card-g1")).toBeInTheDocument();
  });

  it("renders a MadeForYouCard for madeForYou entries", () => {
    const mfyEntry = {
      type: "madeForYou",
      item: { id: "mfy1", previewTrack: undefined },
      playedAt: "",
    } as unknown as HistoryEntry;
    vi.mocked(useHistoryStore).mockReturnValue({
      entries: [mfyEntry],
    } as any);
    render(<RecentlyPlayed />);
    expect(screen.getByTestId("mfy-card-mfy1")).toBeInTheDocument();
  });

  it("does not crash when getRecentlyPlayed rejects", async () => {
    vi.mocked(getRecentlyPlayed).mockRejectedValue(new Error("Network error"));
    expect(() => render(<RecentlyPlayed />)).not.toThrow();
    await waitFor(() => expect(getRecentlyPlayed).toHaveBeenCalled());
  });
});
