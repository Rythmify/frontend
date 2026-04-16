import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SetsPage from "./SetsPage";
import {
  getLikedPlaylists,
  getMyPlaylists,
} from "@/services/api/playlist/playlist.service";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getMyPlaylists: vi.fn(),
  getLikedPlaylists: vi.fn(),
}));

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({ children }: any) => <div data-test="carousel">{children}</div>,
}));

vi.mock("@/components/UI/PlaylistCard/PlaylistCard", () => ({
  default: ({ item }: any) => (
    <div
      data-test="playlist-card"
      data-liked={String(item.isLiked)}
      data-private={String(item.isPrivate)}
      data-cover={item.coverUrl ?? ""}
    >
      {item.title}
    </div>
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
      <button
        data-test="filter-created"
        onClick={() => props.setActiveFilter("Created")}
      >
        Created
      </button>
      <button
        data-test="filter-liked"
        onClick={() => props.setActiveFilter("Liked")}
      >
        Liked
      </button>
    </div>
  ),
}));

const mockResponse = (items: any[]) => ({
  data: {
    items,
    meta: { limit: items.length, offset: 0, total: items.length },
  },
});

const createdPlaylist = {
  playlist_id: "pl-created",
  owner_user_id: "owner-1",
  name: "Created Mix",
  description: null,
  is_public: true,
  cover_image: "https://cdn.example.com/created.jpg",
  created_at: "2026-04-11T00:00:00Z",
  track_count: 1,
  like_count: 0,
};

const likedPlaylist = {
  playlist_id: "pl-liked",
  owner_user_id: "owner-2",
  name: "Liked Jam",
  description: null,
  is_public: false,
  cover_image: null,
  created_at: "2026-04-11T00:00:00Z",
  track_count: 2,
  like_count: 1,
};

const sharedPlaylist = {
  playlist_id: "pl-shared",
  owner_user_id: "owner-3",
  name: "Shared Groove",
  description: null,
  is_public: true,
  cover_image: null,
  created_at: "2026-04-11T00:00:00Z",
  track_count: 3,
  like_count: 4,
};

describe("SetsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeletons while fetching", () => {
    vi.mocked(getMyPlaylists).mockReturnValue(new Promise(() => {}) as any);
    vi.mocked(getLikedPlaylists).mockReturnValue(new Promise(() => {}) as any);

    const { container } = render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(6);
  });

  it("renders deduped playlists and maps card state", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(
      mockResponse([createdPlaylist, sharedPlaylist]) as any,
    );
    vi.mocked(getLikedPlaylists).mockResolvedValue(
      mockResponse([sharedPlaylist, likedPlaylist]) as any,
    );

    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getAllByTestId("playlist-card")).toHaveLength(3),
    );

    expect(screen.getByText("Created Mix")).toHaveAttribute(
      "data-liked",
      "false",
    );
    expect(screen.getByText("Created Mix")).toHaveAttribute(
      "data-private",
      "false",
    );
    expect(screen.getByText("Created Mix")).toHaveAttribute(
      "data-cover",
      "https://cdn.example.com/created.jpg",
    );
    expect(screen.getByText("Shared Groove")).toHaveAttribute(
      "data-liked",
      "true",
    );
    expect(screen.getByText("Liked Jam")).toHaveAttribute(
      "data-private",
      "true",
    );
  });

  it("filters by created and liked playlists", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(
      mockResponse([createdPlaylist, sharedPlaylist]) as any,
    );
    vi.mocked(getLikedPlaylists).mockResolvedValue(
      mockResponse([sharedPlaylist, likedPlaylist]) as any,
    );

    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getAllByTestId("playlist-card")).toHaveLength(3),
    );

    fireEvent.click(screen.getByTestId("filter-created"));
    expect(screen.getAllByTestId("playlist-card")).toHaveLength(2);
    expect(screen.queryByText("Liked Jam")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filter-liked"));
    expect(screen.getAllByTestId("playlist-card")).toHaveLength(2);
    expect(screen.queryByText("Created Mix")).not.toBeInTheDocument();
  });

  it("shows the empty search message when no playlists match", async () => {
    vi.mocked(getMyPlaylists).mockResolvedValue(mockResponse([createdPlaylist]) as any);
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockResponse([]) as any);

    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText("Created Mix")).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByTestId("filter-input"), {
      target: { value: "does-not-match" },
    });

    expect(
      screen.getByText(/No playlists match your search/i),
    ).toBeInTheDocument();
  });

  it("shows the load error when playlists fail to fetch", async () => {
    vi.mocked(getMyPlaylists).mockRejectedValue(new Error("network"));
    vi.mocked(getLikedPlaylists).mockResolvedValue(mockResponse([]) as any);

    render(
      <MemoryRouter>
        <SetsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to load your library/i),
      ).toBeInTheDocument(),
    );
  });
});
