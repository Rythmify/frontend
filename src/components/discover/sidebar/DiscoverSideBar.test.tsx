import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DiscoverSidebar from "./DiscoverSideBar";

// ─── Mock Browser APIs ────────────────────────────────────

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/services/api/discover.service", () => ({
  getSuggestedArtists: vi.fn(),
  getListeningHistory: vi.fn(),
}));

vi.mock("@/services/api/discover.mapper", () => ({
  mapSuggestedArtistToArtistCard: (a: any) => ({
    id: a.id,
    username: a.username ?? a.display_name,
    avatar: undefined,
    followers: a.follower_count ?? 0,
    isVerified: false,
  }),
  mapTrackSummaryToTrack: (api: any) => ({
    id: api.id,
    title: api.title ?? "",
    artistName: "",
    artistUsername: "",
    coverUrl: "",
    genre: "",
    likeCount: 0,
    repostCount: 0,
    playCount: 0,
    commentCount: 0,
    duration: "0:00",
    postedAt: "",
    audioUrl: "",
    waveformData: [],
  }),
}));

vi.mock("@/stores/likes.store", () => ({ useLikesStore: vi.fn() }));
vi.mock("@/stores/history.store", () => ({ useHistoryStore: vi.fn() }));

vi.mock("./ArtistToolsCard", () => ({
  default: () => <div data-test="mock-artist-tools-card" />,
}));
vi.mock("@/components/UI/TrackItem", () => ({
  default: ({ id }: any) => <div data-test={`mock-track-item-${id}`} />,
}));
vi.mock("@/components/UI/TrackListSection/TrackListSection", () => ({
  default: ({ title, children }: any) => (
    <div data-test="mock-track-list-section" data-title={title}>
      {children}
    </div>
  ),
}));
vi.mock("@/components/UI/ArtistListSection/ArtistListSection", () => ({
  default: ({ artists }: any) => (
    <div
      data-test="mock-artist-list-section"
      data-count={String(artists.length)}
    />
  ),
}));
vi.mock("@/components/UI/GoMobile", () => ({
  default: () => <div data-test="mock-go-mobile" />,
}));

import {
  getSuggestedArtists,
  getListeningHistory,
} from "@/services/api/discover.service";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";

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

// ─── Test Suite ───────────────────────────────────────────

describe("DiscoverSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSuggestedArtists).mockResolvedValue({ data: [] } as any);
    vi.mocked(getListeningHistory).mockResolvedValue({ data: [] } as any);
    vi.mocked(useLikesStore).mockImplementation((selector: any) =>
      selector({ likedTracks: [] }),
    );
    vi.mocked(useHistoryStore).mockImplementation((selector: any) =>
      selector({ entries: [] }),
    );
  });

  // ── Layout ───────────────────────────────────────────────

  it("renders the sidebar container", () => {
    render(<DiscoverSidebar />);
    expect(screen.getByTestId("discover-sidebar")).toBeInTheDocument();
  });

  it("renders the artist tools section", () => {
    render(<DiscoverSidebar />);
    expect(
      screen.getByTestId("discover-sidebar-artist-tools"),
    ).toBeInTheDocument();
  });

  it("renders the suggested artists section", () => {
    render(<DiscoverSidebar />);
    expect(
      screen.getByTestId("discover-sidebar-suggested-artists"),
    ).toBeInTheDocument();
  });

  it("renders the go mobile section", () => {
    render(<DiscoverSidebar />);
    expect(
      screen.getByTestId("discover-sidebar-go-mobile"),
    ).toBeInTheDocument();
  });

  // ── Liked tracks ─────────────────────────────────────────

  it("hides liked tracks section when likedTracks is empty", () => {
    render(<DiscoverSidebar />);
    expect(
      screen.queryByTestId("discover-sidebar-liked-tracks"),
    ).not.toBeInTheDocument();
  });

  it("shows liked tracks section when likedTracks is not empty", () => {
    vi.mocked(useLikesStore).mockImplementation((selector: any) =>
      selector({ likedTracks: [makeTrack("t1")] }),
    );
    render(<DiscoverSidebar />);
    expect(
      screen.getByTestId("discover-sidebar-liked-tracks"),
    ).toBeInTheDocument();
  });

  // ── Listening history ────────────────────────────────────

  it("hides history section when store entries and API tracks are empty", async () => {
    render(<DiscoverSidebar />);
    await waitFor(() => {
      expect(
        screen.queryByTestId("discover-sidebar-listening-history"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows history section when store has track entries", () => {
    vi.mocked(useHistoryStore).mockImplementation((selector: any) =>
      selector({
        entries: [{ type: "track", item: makeTrack("t1"), playedAt: "" }],
      }),
    );
    render(<DiscoverSidebar />);
    expect(
      screen.getByTestId("discover-sidebar-listening-history"),
    ).toBeInTheDocument();
  });

  it("shows history section when API returns listening history", async () => {
    vi.mocked(getListeningHistory).mockResolvedValue({
      data: [{ track: { id: "api-t1", title: "API Track" } }],
    } as any);
    render(<DiscoverSidebar />);
    await waitFor(() =>
      expect(
        screen.getByTestId("discover-sidebar-listening-history"),
      ).toBeInTheDocument(),
    );
  });

  // ── Error resilience ─────────────────────────────────────

  it("does not crash when getSuggestedArtists rejects", async () => {
    vi.mocked(getSuggestedArtists).mockRejectedValue(
      new Error("Network error"),
    );
    render(<DiscoverSidebar />);
    await waitFor(() =>
      expect(screen.getByTestId("discover-sidebar")).toBeInTheDocument(),
    );
  });

  it("does not crash when getListeningHistory rejects", async () => {
    vi.mocked(getListeningHistory).mockRejectedValue(
      new Error("Network error"),
    );
    render(<DiscoverSidebar />);
    await waitFor(() =>
      expect(screen.getByTestId("discover-sidebar")).toBeInTheDocument(),
    );
  });
});
