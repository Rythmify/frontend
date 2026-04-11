import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlaylistActions from "../PlaylistActions";
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

vi.mock("../EditPlaylistModal", () => ({
  default: ({ onClose, onSaved }: any) => (
    <div data-test="edit-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onSaved({ name: "Updated" })}>Save</button>
    </div>
  ),
}));

vi.mock("../DeleteConfirmModal", () => ({
  default: ({ onClose, onDeleted }: any) => (
    <div data-test="delete-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={onDeleted}>Confirm</button>
    </div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockPlaylist = {
  playlist_id: "pl-1",
  name: "Test",
  is_public: true,
  track_count: 3,
  owner_user_id: "u-1",
} as any;

describe("PlaylistActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLikesStore).mockReturnValue({
      isPlaylistLiked: vi.fn(() => false),
      togglePlaylist: vi.fn(),
    } as any);
  });

  it("renders the action bar and all major buttons", () => {
    render(
      <MemoryRouter>
        <PlaylistActions playlist={mockPlaylist} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("playlist-action-bar")).toBeInTheDocument();
    expect(screen.getByTestId("button-share")).toBeInTheDocument();
    expect(screen.getByTestId("button-copy-link")).toBeInTheDocument();
  });

  it("opens share popup when Share is clicked", () => {
    render(
      <MemoryRouter>
        <PlaylistActions playlist={mockPlaylist} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("button-share"));
    expect(screen.getByTestId("share-popup")).toBeInTheDocument();
  });

  it("opens edit modal when Edit is clicked", () => {
    render(
      <MemoryRouter>
        <PlaylistActions playlist={mockPlaylist} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("button-edit"));
    expect(screen.getByTestId("edit-modal")).toBeInTheDocument();
  });

  it("calls onPlaylistUpdated when edit is saved", () => {
    const onUpdate = vi.fn();
    render(
      <MemoryRouter>
        <PlaylistActions playlist={mockPlaylist} onPlaylistUpdated={onUpdate} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("button-edit"));
    fireEvent.click(screen.getByText("Save"));
    expect(onUpdate).toHaveBeenCalledWith({ name: "Updated" });
  });

  it("navigates back when delete is confirmed", () => {
    render(
      <MemoryRouter>
        <PlaylistActions playlist={mockPlaylist} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("button-delete"));
    fireEvent.click(screen.getByText("Confirm"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("toggles like state when Like button is clicked", () => {
    const toggle = vi.fn();
    vi.mocked(useLikesStore).mockReturnValue({
      isPlaylistLiked: () => false,
      togglePlaylist: toggle,
    } as any);
    render(
      <MemoryRouter>
        <PlaylistActions playlist={mockPlaylist} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("button-like"));
    expect(toggle).toHaveBeenCalled();
  });

  it("copies current URL to clipboard", () => {
    const writeText = vi.fn();
    Object.assign(navigator, { clipboard: { writeText } });
    render(
      <MemoryRouter>
        <PlaylistActions playlist={mockPlaylist} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("button-copy-link"));
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });
});
