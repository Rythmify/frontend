import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("closes the share popup from its close button", () => {
    render(
      <MemoryRouter>
        <PlaylistActionsGuest playlist={mockPlaylist} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("album-action-share"));
    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByTestId("share-popup")).not.toBeInTheDocument();
  });

  it("shows copy success feedback when Copy link is clicked", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <MemoryRouter>
        <PlaylistActionsGuest playlist={mockPlaylist} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("album-action-copy-link"));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(await screen.findByText("Link copied")).toBeInTheDocument();
  });

  it("logs a copy error when clipboard write fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const writeText = vi.fn(() => Promise.reject(new Error("copy failed")));
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <MemoryRouter>
        <PlaylistActionsGuest playlist={mockPlaylist} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("album-action-copy-link"));
    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        "Failed to copy playlist link:",
        expect.any(Error),
      ),
    );
    errorSpy.mockRestore();
  });

  it("adds to next up when callback is provided", () => {
    const onAddToNextUp = vi.fn();
    render(
      <MemoryRouter>
        <PlaylistActionsGuest
          playlist={mockPlaylist}
          onAddToNextUp={onAddToNextUp}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("album-action-add-to-next-up"));
    expect(onAddToNextUp).toHaveBeenCalledTimes(1);
  });

  it("does nothing when next up callback is missing", () => {
    render(
      <MemoryRouter>
        <PlaylistActionsGuest playlist={mockPlaylist} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("album-action-add-to-next-up"));
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
