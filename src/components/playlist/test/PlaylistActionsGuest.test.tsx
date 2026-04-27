import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlaylistActionsGuest from "../PlaylistActionsGuest";
import { useLikesStore } from "@/stores/likes.store";

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(),
}));

vi.mock("@/pages/[username]/[trackSlug]/components/SharePopup", () => ({
  default: ({ onClose }: any) => (
    <div data-test="share-popup">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockPlaylist = {
  playlist_id: "pl-guest-1",
  name: "Guest Playlist",
  owner_user_id: "owner-1",
} as any;

describe("PlaylistActionsGuest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLikesStore).mockReturnValue({
      isPlaylistLiked: vi.fn(() => false),
    } as any);
  });

  it("does not navigate on render", () => {
    render(
      <MemoryRouter>
        <PlaylistActionsGuest playlist={mockPlaylist} />
      </MemoryRouter>,
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("navigates to sign in when Like is clicked", () => {
    render(
      <MemoryRouter>
        <PlaylistActionsGuest playlist={mockPlaylist} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("album-action-like"));

    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  it("opens share popup when Share is clicked", () => {
    render(
      <MemoryRouter>
        <PlaylistActionsGuest playlist={mockPlaylist} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("album-action-share"));

    expect(screen.getByTestId("share-popup")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalledWith("/signin");
  });

  it("navigates to sign in when Repost is clicked", () => {
    render(
      <MemoryRouter>
        <PlaylistActionsGuest playlist={mockPlaylist} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("album-action-repost"));

    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });
});
