import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import PlaylistActions from "../PlaylistActions";
import PlaylistActionsAlbum from "../Album/PlaylistActionsAlbum";
import { useLikesStore } from "@/stores/likes.store";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: () => ({
    addToQueue: vi.fn(),
  }),
}));

vi.mock("@/pages/[username]/[trackSlug]/components/SharePopup", () => ({
  default: () => null,
}));

vi.mock("../EditPlaylistModal", () => ({
  default: () => null,
}));

vi.mock("../DeleteConfirmModal", () => ({
  default: () => null,
}));

vi.mock("../AddToPlaylistModal", () => ({
  default: () => null,
}));

const mockWriteText = vi.fn(() => Promise.resolve());
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  configurable: true,
});

const playlist = {
  playlist_id: "pl-1",
  name: "Test Playlist",
  owner_user_id: "owner-1",
  cover_image: null,
  is_public: true,
  tracks: [],
} as any;

describe("Playlist copy feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
    vi.mocked(useLikesStore).mockReturnValue({
      isPlaylistLiked: vi.fn(() => false),
      togglePlaylist: vi.fn(),
    } as any);
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: true,
    } as any);
  });

  it("shows a success message after copying from PlaylistActions", async () => {
    render(
      <MemoryRouter>
        <PlaylistActions playlist={playlist} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("button-copy-link"));

    expect(mockWriteText).toHaveBeenCalledWith(window.location.href);
    expect(await screen.findByText("Link copied")).toBeInTheDocument();
  });

  it("shows a success message after copying from PlaylistActionsAlbum", async () => {
    render(
      <MemoryRouter>
        <PlaylistActionsAlbum playlist={playlist} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("album-action-copy-link"));

    expect(mockWriteText).toHaveBeenCalledWith(window.location.href);
    expect(await screen.findByText("Link copied")).toBeInTheDocument();
  });
});
