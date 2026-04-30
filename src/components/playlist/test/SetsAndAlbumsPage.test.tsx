import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SetsPage from "@/pages/you/sets/SetsPage";
import {
  getMyPlaylists,
  getLikedPlaylists,
} from "@/services/api/playlist/playlist.service";
import { useLikesStore } from "@/stores/likes.store";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getMyPlaylists: vi.fn(),
  getLikedPlaylists: vi.fn(),
}));

vi.mock("@/stores/likes.store", () => ({ useLikesStore: vi.fn() }));

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({ children }: any) => <div data-test="carousel">{children}</div>,
}));
vi.mock("@/components/UI/PlaylistCard/PlaylistCard", () => ({
  default: ({ item }: any) => (
    <div data-test="playlist-card-ui">{item.title || item.name}</div>
  ),
}));
vi.mock("@/components/playlist/PlaylistCard", () => ({
  default: ({ playlist }: any) => (
    <div data-test="album-card">{playlist.name}</div>
  ),
}));

vi.mock("@/components/playlist/SetsHeader", () => ({
  default: (props: any) => (
    <div data-test="sets-header">
      <input
        data-test="filter-input"
        value={props.filterText}
        onChange={(e) => props.setFilterText(e.target.value)}
      />
    </div>
  ),
}));

const mockRes = (items: any[]) => ({
  data: { items, meta: { total: items.length } },
});

describe("SetsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLikesStore).mockReturnValue({ likedAlbums: [] } as any);
  });

  it("renders created playlists after load", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(
      mockRes([{ name: "My Set", playlist_id: "1" }]) as any,
    );
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockRes([]) as any);
    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByText("My Set")).toBeInTheDocument());
  });

  it("renders liked playlists after load", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(mockRes([]) as any);
    vi.mocked(getLikedPlaylists).mockResolvedValue(
      mockRes([{ name: "Liked Set", playlist_id: "2" }]) as any,
    );
    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByText("Liked Set")).toBeInTheDocument(),
    );
  });

  it("shows empty message when filter yields no results", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(
      mockRes([{ name: "Jazz" }]) as any,
    );
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockRes([]) as any);
    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );
    await waitFor(() =>
      fireEvent.change(screen.getByTestId("filter-input"), {
        target: { value: "Metal" },
      }),
    );
    expect(
      screen.getByText(/No playlists match your search/),
    ).toBeInTheDocument();
  });

  it("deduplicates playlists present in both created and liked", async () => {
    const p = { name: "Shared", playlist_id: "s1" };
    vi.mocked(getMyPlaylists).mockResolvedValue(mockRes([p]) as any);
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockRes([p]) as any);
    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getAllByTestId("playlist-card-ui")).toHaveLength(1),
    );
  });

  it("shows error message on API failure", async () => {
    vi.mocked(getMyPlaylists).mockRejectedValue(new Error());
    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Failed to load your library/),
      ).toBeInTheDocument(),
    );
  });

});
