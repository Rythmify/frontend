import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreatePlaylistTab from "../CreatePlaylistTab";

vi.mock("@/components/Upload/PrivacyToggle", () => ({
  default: ({ value, onChange }: any) => (
    <button
      data-test="privacy-toggle"
      onClick={() => onChange(value === "public" ? "private" : "public")}
    >
      {value}
    </button>
  ),
}));

vi.mock("../TracksToAddList", () => ({
  default: ({ tracks, onRemove }: any) => (
    <div data-test="tracks-to-add-list">
      {tracks.map((t: any) => (
        <div key={t.id}>
          <span>{t.title}</span>
          <button data-test={`remove-${t.id}`} onClick={() => onRemove(t.id)}>
            x
          </button>
        </div>
      ))}
    </div>
  ),
}));

const tracksToAdd = [
  { id: "t-1", title: "Track One", artistName: "Artist X", coverUrl: "" },
];
const likedTracks = [
  {
    id: "lt-1",
    title: "Liked Track 1",
    artistName: "Singer A",
    coverUrl: "img.jpg",
  },
];

const defaultProps = {
  playlistTitle: "My New Playlist",
  setPlaylistTitle: vi.fn(),
  privacy: "public" as const,
  setPrivacy: vi.fn(),
  creating: false,
  success: false,
  error: null,
  moreOfLike: false,
  tracksToAdd,
  setTracksToAdd: vi.fn(),
  isPlaylist: false,
  defaultPlaylistId: "pl-1",
  hasPlaylists: true,
  onAdd: vi.fn(),
  likedTracks,
  onCreate: vi.fn(),
};

describe("CreatePlaylistTab", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the title input", () => {
    render(
      <MemoryRouter>
        <CreatePlaylistTab {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByDisplayValue("My New Playlist")).toBeInTheDocument();
  });

  it("calls setPlaylistTitle when title changes", () => {
    render(
      <MemoryRouter>
        <CreatePlaylistTab {...defaultProps} />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByDisplayValue("My New Playlist"), {
      target: { value: "Chill Vibes" },
    });
    expect(defaultProps.setPlaylistTitle).toHaveBeenCalledWith("Chill Vibes");
  });

  it("renders the privacy toggle", () => {
    render(
      <MemoryRouter>
        <CreatePlaylistTab {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("privacy-toggle")).toBeInTheDocument();
  });

  it("calls onCreate when Save is clicked", () => {
    render(
      <MemoryRouter>
        <CreatePlaylistTab {...defaultProps} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("button-save-playlist"));
    expect(defaultProps.onCreate).toHaveBeenCalled();
  });

  it("shows Saved! when success is true", () => {
    render(
      <MemoryRouter>
        <CreatePlaylistTab {...defaultProps} success={true} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("button-save-playlist")).toHaveTextContent(
      "Saved!",
    );
  });

  it("disables Save when creating is true", () => {
    render(
      <MemoryRouter>
        <CreatePlaylistTab {...defaultProps} creating={true} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("button-save-playlist")).toBeDisabled();
  });

  it("shows an error message when create fails", () => {
    render(
      <MemoryRouter>
        <CreatePlaylistTab
          {...defaultProps}
          error="Failed to create playlist. Please try again."
        />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("create-playlist-error")).toHaveTextContent(
      "Failed to create playlist. Please try again.",
    );
  });

  it("renders suggested liked tracks section", () => {
    render(
      <MemoryRouter>
        <CreatePlaylistTab {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Looking for more tracks\?/)).toBeInTheDocument();
    expect(screen.getByText("Liked Track 1")).toBeInTheDocument();
  });

  it("calls onAdd when clicking 'Add to Playlist' on a liked track suggestion", () => {
    render(
      <MemoryRouter>
        <CreatePlaylistTab {...defaultProps} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("button-add-liked-track-lt-1"));
    expect(defaultProps.setTracksToAdd).toHaveBeenCalledWith(expect.any(Function));
  });

  it("hides liked track suggestions when the user has no playlists yet", () => {
    render(
      <MemoryRouter>
        <CreatePlaylistTab {...defaultProps} hasPlaylists={false} />
      </MemoryRouter>,
    );
    expect(
      screen.queryByText(/Looking for more tracks\?/),
    ).not.toBeInTheDocument();
  });
});
