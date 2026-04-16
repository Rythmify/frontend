import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PlaylistList from "../PlaylistList";

const mockPlaylists = [
  {
    playlist_id: "pl-1",
    name: "Jazz",
    track_count: 10,
    cover_image: "jazz.jpg",
  },
  { playlist_id: "pl-2", name: "Rock", track_count: 5, cover_image: null },
] as any;

const tracksToAdd = [{ id: "t-1", title: "Song", coverUrl: "track.jpg" }];

const defaultProps = {
  playlists: mockPlaylists,
  tracksToAdd,
  adding: null,
  success: null,
  onAdd: vi.fn(),
};

describe("PlaylistList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders all playlist names and counts", () => {
    render(<PlaylistList {...defaultProps} />);
    expect(screen.getByText("Jazz")).toBeInTheDocument();
    expect(screen.getByText("10 tracks")).toBeInTheDocument();
    expect(screen.getByText("Rock")).toBeInTheDocument();
  });

  it("calls onAdd with the correct ID", () => {
    render(<PlaylistList {...defaultProps} />);
    fireEvent.click(screen.getByTestId("button-add-to-playlist-pl-1"));
    expect(defaultProps.onAdd).toHaveBeenCalledWith("pl-1");
  });

  it("disables button when adding state matches ID", () => {
    render(<PlaylistList {...defaultProps} adding="pl-1" />);
    expect(screen.getByTestId("button-add-to-playlist-pl-1")).toBeDisabled();
    expect(
      screen.getByTestId("button-add-to-playlist-pl-2"),
    ).not.toBeDisabled();
  });

  it("shows 'Added' label when success state matches ID", () => {
    render(<PlaylistList {...defaultProps} success="pl-1" />);
    expect(screen.getByText("Added")).toBeInTheDocument();
    expect(screen.getByText("Added")).toHaveClass("text-accent");
  });

  it("uses playlist cover image when available", () => {
    render(<PlaylistList {...defaultProps} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs[0]).toHaveAttribute("src", "jazz.jpg");
  });

  it("falls back to the first track cover when playlist has no cover", () => {
    render(<PlaylistList {...defaultProps} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs[1]).toHaveAttribute("src", "track.jpg");
  });

  it("renders nothing when the playlist array is empty", () => {
    const { container } = render(
      <PlaylistList {...defaultProps} playlists={[]} />,
    );
    expect(container.querySelectorAll(".p-3")).toHaveLength(0);
  });
});
