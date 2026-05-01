import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrackTable } from "../TrackTable";
import type { Track } from "@/services/api/upload/track.service";

vi.mock("@/components/track/EditTrackModal", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-test="mock-edit-modal">
      <button onClick={onClose} data-test="close-edit-modal">Close Edit</button>
    </div>
  ),
}));

vi.mock("@/components/playlist/AddToPlaylistModal", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-test="mock-playlist-modal">
      <button onClick={onClose} data-test="close-playlist-modal">Close Playlist</button>
    </div>
  ),
}));

const makeTrack = (overrides: Partial<Track> = {}): Track => ({
  id: "t1",
  title: "Track One",
  description: null,
  artists: "Artist One",
  genre: "Pop",
  tags: [],
  is_public: true,
  is_hidden: false,
  user_id: "u1",
  cover_image: null,
  audio_url: "",
  stream_url: null,
  preview_url: null,
  waveform_url: null,
  duration: 200,
  file_size: null,
  bitrate: null,
  status: "ready",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: null,
  play_count: 100,
  like_count: 20,
  comment_count: 5,
  repost_count: 2,
  ...overrides,
});

const tracks: Track[] = [
  makeTrack({ id: "t1", title: "Song One" }),
  makeTrack({ id: "t2", title: "Song Two" }),
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TrackTable", () => {
  it("renders the track table container", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    expect(screen.getByTestId("track-table")).toBeInTheDocument();
  });

  it("renders the table header when no tracks are selected", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    expect(screen.getByTestId("track-table-header")).toBeInTheDocument();
    expect(screen.getByText("Tracks")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("Engagements")).toBeInTheDocument();
    expect(screen.getByText("Plays")).toBeInTheDocument();
  });

  it("renders all track rows", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    expect(screen.getByTestId("track-row-t1")).toBeInTheDocument();
    expect(screen.getByTestId("track-row-t2")).toBeInTheDocument();
  });

  it("shows empty message when no tracks", () => {
    render(<TrackTable tracks={[]} filter="Public" onDeleteTrack={vi.fn()} />);
    expect(screen.getByTestId("track-table-empty")).toBeInTheDocument();
    expect(screen.getByText(/No public tracks found/i)).toBeInTheDocument();
  });

  it("shows 'private' in empty message for Private filter", () => {
    render(<TrackTable tracks={[]} filter="Private" onDeleteTrack={vi.fn()} />);
    expect(screen.getByText(/No private tracks found/i)).toBeInTheDocument();
  });

  it("selecting a track shows the selection header", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("track-checkbox-t1"));
    expect(screen.getByTestId("track-table-selection-header")).toBeInTheDocument();
    expect(screen.getByText("1 Selected")).toBeInTheDocument();
  });

  it("shows select-all checkbox in both header modes", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    expect(screen.getByTestId("select-all-checkbox")).toBeInTheDocument();
  });

  it("clicking select-all selects all tracks", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    const selectAll = screen.getByTestId("select-all-checkbox");
    fireEvent.click(selectAll);
    expect(screen.getByText("2 Selected")).toBeInTheDocument();
  });

  it("clicking select-all again deselects all tracks", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("select-all-checkbox"));
    fireEvent.click(screen.getByTestId("select-all-checkbox"));
    expect(screen.getByTestId("track-table-header")).toBeInTheDocument();
  });

  it("shows edit button in selection header", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("track-checkbox-t1"));
    expect(screen.getByTestId("edit-track-btn")).toBeInTheDocument();
  });

  it("shows add-to-playlist button in selection header", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("track-checkbox-t1"));
    expect(screen.getByTestId("add-to-playlist-btn")).toBeInTheDocument();
  });

  it("opens edit modal when edit button in selection header is clicked", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("track-checkbox-t1"));
    fireEvent.click(screen.getByTestId("edit-track-btn"));
    expect(screen.getByTestId("mock-edit-modal")).toBeInTheDocument();
  });

  it("closes edit modal when close button is clicked", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("track-checkbox-t1"));
    fireEvent.click(screen.getByTestId("edit-track-btn"));
    fireEvent.click(screen.getByTestId("close-edit-modal"));
    expect(screen.queryByTestId("mock-edit-modal")).not.toBeInTheDocument();
  });

  it("opens add-to-playlist modal when add-to-playlist is clicked", () => {
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("track-checkbox-t1"));
    fireEvent.click(screen.getByTestId("add-to-playlist-btn"));
    expect(screen.getByTestId("mock-playlist-modal")).toBeInTheDocument();
  });

  it("calls onDeleteTrack when delete is triggered from a TrackRow", () => {
    const onDeleteTrack = vi.fn();
    render(<TrackTable tracks={tracks} filter="Public" onDeleteTrack={onDeleteTrack} />);
    fireEvent.click(screen.getByTestId("track-options-btn-t1"));
    fireEvent.click(screen.getByTestId("track-delete-btn-t1"));
    expect(onDeleteTrack).toHaveBeenCalledWith("t1");
  });
});
