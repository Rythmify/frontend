import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditPlaylistModal from "../EditPlaylistModal";
import * as playlistService from "@/services/api/playlist/playlist.service";
import * as trackService from "@/services/api/upload/track.service";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/services/api/playlist/playlist.service");
vi.mock("@/services/api/upload/track.service");
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("../TrackReorderList", () => ({
  default: () => <div data-test="reorder-list">Reorder List</div>,
}));
const mockPlaylist = {
  playlist_id: "pl-1",
  name: "Original Name",
  description: "Original Desc",
  is_public: true,
  owner_user_id: "owner-1",
  tracks: [],
};

function getTitleInput() {
  return screen.getByDisplayValue("Original Name");
}
describe("EditPlaylistModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    (trackService.getGenres as Mock).mockResolvedValue([
      { id: "genre-pop", name: "Pop" },
      { id: "genre-rock", name: "Rock" },
    ]);
    (playlistService.updatePlaylist as Mock).mockResolvedValue({
      data: { ...mockPlaylist, name: "New Name" },
    });
  });

  it("updates state when inputs change and calls onSaved", async () => {
    const onSaved = vi.fn();
    render(
      <EditPlaylistModal
        playlist={mockPlaylist as any}
        onClose={vi.fn()}
        onSaved={onSaved}
      />,
    );

    fireEvent.change(getTitleInput(), {
      target: { value: "New Name" },
    });

    fireEvent.click(screen.getByTestId("button-save-changes-edit-modal"));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it("updates slug automatically when name changes", async () => {
    render(
      <EditPlaylistModal
        playlist={mockPlaylist as any}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    const nameInput = getTitleInput();
    fireEvent.change(nameInput, { target: { value: "Summer Vibes 2024!" } });

    const slugInput = screen.getByDisplayValue(/summer-vibes-2024/);
    expect(slugInput).toBeInTheDocument();
  });

  it("manages tag addition and removal", async () => {
    render(
      <EditPlaylistModal
        playlist={mockPlaylist as any}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    const tagInput = screen.getByPlaceholderText(/Add tags/i);
    fireEvent.change(tagInput, { target: { value: "Chill" } });
    fireEvent.keyDown(tagInput, { key: "Enter" });

    expect(screen.getByText("#Chill")).toBeInTheDocument();

    const removeBtn = screen.getByTestId("button-remove-tag-Chill");
    fireEvent.click(removeBtn);
    expect(screen.queryByText("#Chill")).not.toBeInTheDocument();
  });

  it("submits the full form data on save", async () => {
    const onSaved = vi.fn();
    (playlistService.updatePlaylist as Mock).mockResolvedValue({
      data: { ...mockPlaylist, name: "New Name" },
    });

    render(
      <EditPlaylistModal
        playlist={mockPlaylist as any}
        onClose={vi.fn()}
        onSaved={onSaved}
      />,
    );

    fireEvent.change(getTitleInput(), {
      target: { value: "New Name" },
    });
    fireEvent.click(screen.getByTestId("button-save-changes-edit-modal"));

    await waitFor(() => {
      expect(playlistService.updatePlaylist).toHaveBeenCalledWith(
        "pl-1",
        expect.objectContaining({
          name: "New Name",
        }),
      );
      expect(onSaved).toHaveBeenCalled();
    });
  });

  it("switches to tracks tab", () => {
    render(
      <EditPlaylistModal
        playlist={mockPlaylist as any}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("button-tab-tracks"));
    expect(screen.getByTestId("reorder-list")).toBeInTheDocument();
  });

  it("uploads a new cover image and lets the user remove tags with backspace", async () => {
    const onSaved = vi.fn();
    const createObjectURL = vi.fn(() => "blob:cover");
    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURL,
      configurable: true,
    });

    render(
      <MemoryRouter>
        <EditPlaylistModal
          playlist={{ ...mockPlaylist, tags: [{ name: "Chill" }] } as any}
          onClose={vi.fn()}
          onSaved={onSaved}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("edit-playlist-cover"));
    const input = document.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(["img"], "cover.png", { type: "image/png" })] },
    });

    expect(createObjectURL).toHaveBeenCalled();
    expect(screen.getByAltText("cover")).toHaveAttribute("src", "blob:cover");

    const tagInput = document.querySelector("input[placeholder='']") as HTMLInputElement;
    fireEvent.keyDown(tagInput, { key: "Backspace" });
    expect(screen.queryByText("#Chill")).not.toBeInTheDocument();
  });

  it("normalizes string genre options returned by the API", async () => {
    (trackService.getGenres as Mock).mockResolvedValue(["Pop", "Rock"]);

    render(
      <MemoryRouter>
        <EditPlaylistModal
          playlist={mockPlaylist as any}
          onClose={vi.fn()}
          onSaved={vi.fn()}
        />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Pop")).toBeInTheDocument());
    expect(screen.getByText("Rock")).toBeInTheDocument();
  });

  it("handles save failure and cancel", async () => {
    (playlistService.updatePlaylist as Mock).mockRejectedValueOnce(new Error("fail"));
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <EditPlaylistModal
          playlist={mockPlaylist as any}
          onClose={onClose}
          onSaved={vi.fn()}
        />
      </MemoryRouter>,
    );

    fireEvent.change(getTitleInput(), { target: { value: "Updated" } });
    fireEvent.click(screen.getByTestId("button-save-changes-edit-modal"));
    await waitFor(() =>
      expect(
        screen.getByText("Failed to save changes. Please try again."),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("button-cancel-edit"));
    expect(onClose).toHaveBeenCalled();
  });
});
