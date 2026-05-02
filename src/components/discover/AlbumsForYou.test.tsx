import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AlbumsForYou from "./AlbumsForYou";
import type { DiscoveryAlbum } from "@/services/api/discover.service";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/services/api/discover.service", () => ({
  getAlbumsForYou: vi.fn(),
  getAlbumPreviewTrackId: vi.fn().mockReturnValue(null),
}));

vi.mock("@/services/api/discover.mapper", () => ({
  mapDiscoveryTrack: (t: any) => ({ id: t.id }),
}));

vi.mock("@/stores/likes.store", () => ({ useLikesStore: vi.fn() }));

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({ title, children }: any) => (
    <div data-test="carousel-wrapper">
      <h2 data-test="carousel-title">{title}</h2>
      <div data-test="carousel-scroll-container">{children}</div>
    </div>
  ),
}));

vi.mock("@/components/UI/AlbumCard", () => ({
  default: ({ item }: any) => <div data-test={`album-card-${item.id}`} />,
}));

import { getAlbumsForYou } from "@/services/api/discover.service";
import { useLikesStore } from "@/stores/likes.store";

// ─── Fixtures ─────────────────────────────────────────────

const mockSeedAlbums = vi.fn();

const makeAlbum = (id: string): DiscoveryAlbum => ({
  id,
  name: `Album ${id}`,
  cover_image: null,
  owner_id: "o-001",
  owner_name: "Owner",
  track_count: 5,
  like_count: 100,
  created_at: "2026-01-01T00:00:00Z",
  preview_track: null,
});

// ─── Test Suite ───────────────────────────────────────────

describe("AlbumsForYou", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLikesStore).mockImplementation((selector: any) =>
      selector({ seedAlbums: mockSeedAlbums }),
    );
  });

  it("renders the section container", async () => {
    vi.mocked(getAlbumsForYou).mockResolvedValue({ data: [] } as any);
    render(<AlbumsForYou />);
    expect(screen.getByTestId("section-albums-for-you")).toBeInTheDocument();
  });

  it("renders the 'Albums for you' carousel title", async () => {
    vi.mocked(getAlbumsForYou).mockResolvedValue({
      data: [makeAlbum("a1")],
    } as any);
    render(<AlbumsForYou />);
    await waitFor(() =>
      expect(screen.getByTestId("album-card-a1")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("carousel-title")).toHaveTextContent(
      "Albums for you",
    );
  });

  it("renders album cards after data loads", async () => {
    vi.mocked(getAlbumsForYou).mockResolvedValue({
      data: [makeAlbum("a1"), makeAlbum("a2")],
    } as any);
    render(<AlbumsForYou />);
    await waitFor(() => {
      expect(screen.getByTestId("album-card-a1")).toBeInTheDocument();
      expect(screen.getByTestId("album-card-a2")).toBeInTheDocument();
    });
  });

  it("renders the correct number of album cards", async () => {
    vi.mocked(getAlbumsForYou).mockResolvedValue({
      data: [makeAlbum("a1"), makeAlbum("a2"), makeAlbum("a3")],
    } as any);
    render(<AlbumsForYou />);
    await waitFor(() =>
      expect(screen.getAllByTestId(/^album-card-/)).toHaveLength(3),
    );
  });

  it("renders no cards when API returns an empty array", async () => {
    vi.mocked(getAlbumsForYou).mockResolvedValue({ data: [] } as any);
    render(<AlbumsForYou />);
    await waitFor(() => {
      expect(screen.queryAllByTestId(/^album-card-/)).toHaveLength(0);
    });
  });

  it("calls seedAlbums with the loaded albums", async () => {
    const albums = [makeAlbum("a1"), makeAlbum("a2")];
    vi.mocked(getAlbumsForYou).mockResolvedValue({ data: albums } as any);
    render(<AlbumsForYou />);
    await waitFor(() => expect(mockSeedAlbums).toHaveBeenCalledWith(albums));
  });

  it("does not call seedAlbums when API returns empty array", async () => {
    vi.mocked(getAlbumsForYou).mockResolvedValue({ data: [] } as any);
    render(<AlbumsForYou />);
    await waitFor(() =>
      expect(screen.getByTestId("section-albums-for-you")).toBeInTheDocument(),
    );
    expect(mockSeedAlbums).not.toHaveBeenCalled();
  });
});
