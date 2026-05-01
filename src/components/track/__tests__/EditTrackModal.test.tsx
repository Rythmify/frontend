import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EditTrackModal from "../EditTrackModal";
import type { Track } from "@/types/track";

vi.mock("@/services/api/upload/track.service", () => ({
  updateTrack: vi.fn().mockResolvedValue(undefined),
  updateTrackCover: vi.fn().mockResolvedValue(undefined),
  getGenres: vi.fn().mockResolvedValue([{ id: "g1", name: "Pop" }, { id: "g2", name: "Rock" }]),
  setTrackVisibility: vi.fn().mockResolvedValue(undefined),
}));

const mockTrack: Track = {
  id: "track-1",
  title: "Old Title",
  artistName: "Test Artist",
  artistUsername: "test-artist",
  coverUrl: "http://example.com/cover.jpg",
  genre: "Pop",
  likeCount: 0,
  repostCount: 0,
  playCount: 0,
  commentCount: 0,
  duration: "1:00",
  postedAt: "now",
  waveformData: [],
  audioUrl: "http://example.com/audio.mp3",
  trackSlug: "old-title",
  isPrivate: false,
};

describe("EditTrackModal", () => {
  it("renders correctly", async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    render(
      <EditTrackModal
        track={mockTrack}
        onClose={onClose}
        onSaved={onSaved}
      />
    );

    expect(screen.getByText("Edit track")).toBeInTheDocument();
    expect(screen.getByTestId("input-track-title")).toHaveValue("Old Title");
    
    await waitFor(() => {
      expect(screen.getByTestId("select-track-genre")).toBeInTheDocument();
    });
  });

  it("calls onClose when cancel is clicked", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    render(
      <EditTrackModal
        track={mockTrack}
        onClose={onClose}
        onSaved={onSaved}
      />
    );

    fireEvent.click(screen.getByTestId("button-cancel-edit-track"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls update APIs and onSaved when save is clicked", async () => {
    const { updateTrack } = await import("@/services/api/upload/track.service");
    const onClose = vi.fn();
    const onSaved = vi.fn();
    render(
      <EditTrackModal
        track={mockTrack}
        onClose={onClose}
        onSaved={onSaved}
      />
    );

    fireEvent.change(screen.getByTestId("input-track-title"), { target: { value: "New Title" } });
    fireEvent.change(screen.getByTestId("textarea-track-description"), { target: { value: "A description" } });
    
    fireEvent.click(screen.getByTestId("button-save-changes-edit-track-modal"));

    await waitFor(() => {
      expect(updateTrack).toHaveBeenCalledWith("track-1", {
        title: "New Title",
        description: "A description",
        genre: "Pop",
        tags: undefined,
      });
      expect(onSaved).toHaveBeenCalledWith({
        title: "New Title",
        genre: "Pop",
        isPrivate: false,
        coverUrl: "http://example.com/cover.jpg",
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("disables save button when title is empty", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    render(
      <EditTrackModal
        track={mockTrack}
        onClose={onClose}
        onSaved={onSaved}
      />
    );

    fireEvent.change(screen.getByTestId("input-track-title"), { target: { value: "" } });
    expect(screen.getByTestId("button-save-changes-edit-track-modal")).toBeDisabled();
  });
});
