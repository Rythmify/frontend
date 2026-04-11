import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

vi.mock("./TracksToAddList", () => ({
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
  tracksToAdd,
  setTracksToAdd: vi.fn(),
  isPlaylist: false,
  defaultPlaylistId: "pl-1",
  onAdd: vi.fn(),
  likedTracks,
  onCreate: vi.fn(),
};

describe("CreatePlaylistTab", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the title input", () => {
    render(<CreatePlaylistTab {...defaultProps} />);
    expect(screen.getByDisplayValue("My New Playlist")).toBeInTheDocument();
  });

  it("calls setPlaylistTitle when title changes", () => {
    render(<CreatePlaylistTab {...defaultProps} />);
    fireEvent.change(screen.getByDisplayValue("My New Playlist"), {
      target: { value: "Chill Vibes" },
    });
    expect(defaultProps.setPlaylistTitle).toHaveBeenCalledWith("Chill Vibes");
  });

  it("renders the privacy toggle", () => {
    render(<CreatePlaylistTab {...defaultProps} />);
    expect(screen.getByTestId("privacy-toggle")).toBeInTheDocument();
  });

  it("calls onCreate when Save is clicked", () => {
    render(<CreatePlaylistTab {...defaultProps} />);
    fireEvent.click(screen.getByTestId("button-save-playlist"));
    expect(defaultProps.onCreate).toHaveBeenCalled();
  });

  it("disables Save when creating is true", () => {
    render(<CreatePlaylistTab {...defaultProps} creating={true} />);
    expect(screen.getByTestId("button-save-playlist")).toBeDisabled();
  });

  it("renders suggested liked tracks section", () => {
    render(<CreatePlaylistTab {...defaultProps} />);
    expect(screen.getByText(/Looking for more tracks\?/)).toBeInTheDocument();
    expect(screen.getByText("Liked Track 1")).toBeInTheDocument();
  });

  it("calls onAdd when clicking 'Add to Playlist' on a liked track suggestion", () => {
    render(<CreatePlaylistTab {...defaultProps} />);
    fireEvent.click(screen.getByTestId("button-add-liked-track-lt-1"));
    expect(defaultProps.onAdd).toHaveBeenCalledWith("pl-1", expect.any(Array));
  });
});
