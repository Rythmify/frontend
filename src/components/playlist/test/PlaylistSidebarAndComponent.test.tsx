import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlaylistSidebar from "../PlaylistSidebar";
import PlaylistComponent from "../PlaylistComponent";
import { getPlaylistsByUser } from "@/services/api/playlist/playlist.service";
import { usePlayerStore } from "@/stores/player.store";
import { useAuthStore } from "@/stores/auth.store";

// ── Mocks ────────────────────────────────────────────────────

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getPlaylistsByUser: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn(),
}));

vi.mock("@/pages/[username]/[trackSlug]/components/SharePopup", () => ({
  default: ({ onClose }: any) => (
    <div data-test="share-popup">
      <button onClick={onClose}>x</button>
    </div>
  ),
}));

vi.mock("@/services/audioService", () => ({
  audio: { src: "" },
  seekAudio: vi.fn(),
  setGlobalWaveSurfer: vi.fn(),
  setTrackLoadedLocally: vi.fn(),
}));

vi.mock("wavesurfer.js", () => ({
  default: {
    create: vi.fn(() => ({
      on: vi.fn(),
      destroy: vi.fn(),
    })),
  },
}));

// ── Shared test data ─────────────────────────────────────────────────────────

const mockUser = { id: "u-1", username: "testuser", displayName: "Test User" };

const mockPlaylistDetails = {
  playlist_id: "pl-1",
  name: "Test Playlist",
  is_public: true,
  track_count: 3,
  owner_user_id: "u-1",
  tracks: [{ track_id: "t-1", title: "Track 1", artist_name: "Artist A" }],
};

const sidebarPlaylists = [
  { playlist_id: "pl-2", name: "Another Set" },
  { playlist_id: "pl-3", name: "Third Set" },
];

describe("PlaylistSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getPlaylistsByUser).mockResolvedValue({
      data: { items: sidebarPlaylists, meta: { total: 2 } },
    } as any);
  });

  it("renders the sidebar container", async () => {
    render(
      <MemoryRouter>
        <PlaylistSidebar playlist={mockPlaylistDetails as any} />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("playlist-sidebar")).toBeInTheDocument(),
    );
  });

  it("renders 'Playlists from this user' heading", () => {
    render(
      <MemoryRouter>
        <PlaylistSidebar playlist={mockPlaylistDetails as any} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Playlists from this user/i)).toBeInTheDocument();
  });

  it("renders 'View all' link", () => {
    render(
      <MemoryRouter>
        <PlaylistSidebar playlist={mockPlaylistDetails as any} />
      </MemoryRouter>,
    );
    expect(screen.getByText("View all")).toBeInTheDocument();
  });

  it("navigates 'View all' to the user's sets page", () => {
    render(
      <MemoryRouter>
        <PlaylistSidebar playlist={mockPlaylistDetails as any} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute(
      "href",
      "/u-1/sets",
    );
  });

  it("renders other playlists after load", async () => {
    render(
      <MemoryRouter>
        <PlaylistSidebar playlist={mockPlaylistDetails as any} />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByText("Another Set")).toBeInTheDocument(),
    );
  });

  it("does not render the current playlist in the sidebar list", async () => {
    render(
      <MemoryRouter>
        <PlaylistSidebar playlist={mockPlaylistDetails as any} />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.queryByText("Test Playlist")).not.toBeInTheDocument(),
    );
  });

  it("shows spinner while loading", () => {
    vi.mocked(getPlaylistsByUser).mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <PlaylistSidebar playlist={mockPlaylistDetails as any} />
      </MemoryRouter>,
    );
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows 'No other playlists' when list is empty", async () => {
    vi.mocked(getPlaylistsByUser).mockResolvedValue({
      data: { items: [] },
    } as any);
    render(
      <MemoryRouter>
        <PlaylistSidebar playlist={mockPlaylistDetails as any} />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByText(/No other playlists/)).toBeInTheDocument(),
    );
  });
});
