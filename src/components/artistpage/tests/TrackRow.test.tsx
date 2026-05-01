import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrackRow } from "../TrackRow";
import type { Track } from "@/services/api/upload/track.service";

const makeTrack = (overrides: Partial<Track> = {}): Track => ({
  id: "track-abc",
  title: "My Song",
  artists: "The Artist",
  genre: "Electronic",
  is_public: true,
  cover_image: null,
  audio_url: "http://audio.mp3",
  duration: 180,
  status: "ready",
  created_at: "2024-06-15T00:00:00Z",
  play_count: 42,
  like_count: 10,
  comment_count: 3,
  repost_count: 1,
  ...overrides,
});

const defaultProps = {
  track: makeTrack(),
  selected: false,
  onToggle: vi.fn(),
  onEdit: vi.fn(),
  onAddToPlaylist: vi.fn(),
  onDelete: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TrackRow", () => {
  it("renders the track row with data-test id", () => {
    render(<TrackRow {...defaultProps} />);
    expect(screen.getByTestId("track-row-track-abc")).toBeInTheDocument();
  });

  it("renders the track title", () => {
    render(<TrackRow {...defaultProps} />);
    expect(screen.getByText("My Song")).toBeInTheDocument();
  });

  it("renders the artist name", () => {
    render(<TrackRow {...defaultProps} />);
    expect(screen.getByText("The Artist")).toBeInTheDocument();
  });

  it("renders the formatted duration", () => {
    render(<TrackRow {...defaultProps} />);
    expect(screen.getByText("3:00")).toBeInTheDocument();
  });

  it("renders the formatted date", () => {
    render(<TrackRow {...defaultProps} />);
    expect(screen.getByText(/Jun/)).toBeInTheDocument();
  });

  it("renders the play count", () => {
    render(<TrackRow {...defaultProps} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders the like count", () => {
    render(<TrackRow {...defaultProps} />);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders the checkbox unchecked when not selected", () => {
    render(<TrackRow {...defaultProps} selected={false} />);
    const checkbox = screen.getByTestId("track-checkbox-track-abc") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it("renders the checkbox checked when selected", () => {
    render(<TrackRow {...defaultProps} selected={true} />);
    const checkbox = screen.getByTestId("track-checkbox-track-abc") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("calls onToggle with track id when checkbox changes", () => {
    const onToggle = vi.fn();
    render(<TrackRow {...defaultProps} onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId("track-checkbox-track-abc"));
    expect(onToggle).toHaveBeenCalledWith("track-abc");
  });

  it("renders the options button", () => {
    render(<TrackRow {...defaultProps} />);
    expect(screen.getByTestId("track-options-btn-track-abc")).toBeInTheDocument();
  });

  it("opens dropdown menu when options button is clicked", () => {
    render(<TrackRow {...defaultProps} />);
    fireEvent.click(screen.getByTestId("track-options-btn-track-abc"));
    expect(screen.getByTestId("track-edit-btn-track-abc")).toBeInTheDocument();
  });

  it("calls onEdit when edit option is clicked", () => {
    const onEdit = vi.fn();
    render(<TrackRow {...defaultProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByTestId("track-options-btn-track-abc"));
    fireEvent.click(screen.getByTestId("track-edit-btn-track-abc"));
    expect(onEdit).toHaveBeenCalled();
  });

  it("calls onAddToPlaylist when add-to-playlist option is clicked", () => {
    const onAddToPlaylist = vi.fn();
    render(<TrackRow {...defaultProps} onAddToPlaylist={onAddToPlaylist} />);
    fireEvent.click(screen.getByTestId("track-options-btn-track-abc"));
    fireEvent.click(screen.getByTestId("track-add-to-playlist-btn-track-abc"));
    expect(onAddToPlaylist).toHaveBeenCalled();
  });

  it("calls onDelete when delete option is clicked", () => {
    const onDelete = vi.fn();
    render(<TrackRow {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId("track-options-btn-track-abc"));
    fireEvent.click(screen.getByTestId("track-delete-btn-track-abc"));
    expect(onDelete).toHaveBeenCalled();
  });

  it("closes dropdown when clicking outside", () => {
    render(
      <div>
        <div data-test="outside">Outside</div>
        <TrackRow {...defaultProps} />
      </div>,
    );
    fireEvent.click(screen.getByTestId("track-options-btn-track-abc"));
    expect(screen.getByTestId("track-edit-btn-track-abc")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByTestId("track-edit-btn-track-abc")).not.toBeInTheDocument();
  });

  it("renders HD badge when track status is ready", () => {
    render(<TrackRow {...defaultProps} track={makeTrack({ status: "ready" })} />);
    expect(screen.getByText("HD")).toBeInTheDocument();
  });

  it("does not render HD badge when track status is not ready", () => {
    render(<TrackRow {...defaultProps} track={makeTrack({ status: "processing" })} />);
    expect(screen.queryByText("HD")).not.toBeInTheDocument();
  });

  it("renders cover image when provided", () => {
    const track = makeTrack({ cover_image: "https://example.com/cover.jpg" });
    render(<TrackRow {...defaultProps} track={track} />);
    const img = screen.getByAltText("My Song");
    expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("renders dash for comment count when null", () => {
    render(<TrackRow {...defaultProps} track={makeTrack({ comment_count: null })} />);
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(1);
  });
});
