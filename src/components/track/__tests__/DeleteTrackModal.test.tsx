import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DeleteTrackModal from "../DeleteTrackModal";

vi.mock("@/services/api/upload/track.service", () => ({
  deleteTrack: vi.fn().mockResolvedValue(undefined),
}));

describe("DeleteTrackModal", () => {
  it("renders correctly", () => {
    const onClose = vi.fn();
    const onDeleted = vi.fn();
    render(
      <DeleteTrackModal
        trackId="track-1"
        trackTitle="My Awesome Track"
        onClose={onClose}
        onDeleted={onDeleted}
      />
    );

    expect(screen.getByText("Delete track")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByText("My Awesome Track")).toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", () => {
    const onClose = vi.fn();
    const onDeleted = vi.fn();
    render(
      <DeleteTrackModal
        trackId="track-1"
        trackTitle="My Awesome Track"
        onClose={onClose}
        onDeleted={onDeleted}
      />
    );

    fireEvent.click(screen.getByTestId("button-cancel-delete-track"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls deleteTrack and onDeleted when confirm is clicked", async () => {
    const { deleteTrack } = await import("@/services/api/upload/track.service");
    const onClose = vi.fn();
    const onDeleted = vi.fn();
    render(
      <DeleteTrackModal
        trackId="track-1"
        trackTitle="My Awesome Track"
        onClose={onClose}
        onDeleted={onDeleted}
      />
    );

    fireEvent.click(screen.getByTestId("button-confirm-delete-track"));

    await waitFor(() => {
      expect(deleteTrack).toHaveBeenCalledWith("track-1");
      expect(onDeleted).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("shows error when deleteTrack fails", async () => {
    const { deleteTrack } = await import("@/services/api/upload/track.service");
    vi.mocked(deleteTrack).mockRejectedValueOnce(new Error("Failed"));
    const onClose = vi.fn();
    const onDeleted = vi.fn();
    render(
      <DeleteTrackModal
        trackId="track-1"
        trackTitle="My Awesome Track"
        onClose={onClose}
        onDeleted={onDeleted}
      />
    );

    fireEvent.click(screen.getByTestId("button-confirm-delete-track"));

    await waitFor(() => {
      expect(screen.getByText("Failed to delete track. Please try again.")).toBeInTheDocument();
    });
  });
});
