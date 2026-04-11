import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeleteConfirmModal from "../DeleteConfirmModal";
import { deletePlaylist } from "@/services/api/playlist/playlist.service";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  deletePlaylist: vi.fn(),
}));

vi.mock("@/components/MessagingComponents/Modal", () => ({
  Modal: ({ children, isOpen }: any) =>
    isOpen ? <div data-test="modal">{children}</div> : null,
}));

const defaultProps = {
  playlistId: "pl-123",
  playlistName: "My Playlist",
  onClose: vi.fn(),
  onDeleted: vi.fn(),
};

describe("DeleteConfirmModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the playlist name in confirmation text", () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByText(/My Playlist/)).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("button-cancel-delete"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls deletePlaylist with correct id on confirm", async () => {
    vi.mocked(deletePlaylist).mockResolvedValueOnce({
      data: {},
      message: "ok",
    } as any);
    render(<DeleteConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("button-confirm-delete"));
    await waitFor(() => expect(deletePlaylist).toHaveBeenCalledWith("pl-123"));
  });

  it("calls onDeleted and onClose after successful deletion", async () => {
    vi.mocked(deletePlaylist).mockResolvedValueOnce({
      data: {},
      message: "ok",
    } as any);
    render(<DeleteConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("button-confirm-delete"));
    await waitFor(() => {
      expect(defaultProps.onDeleted).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("shows error message if deletion fails", async () => {
    vi.mocked(deletePlaylist).mockRejectedValueOnce(new Error("Network error"));
    render(<DeleteConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("button-confirm-delete"));
    await waitFor(() =>
      expect(screen.getByText(/Failed to delete/)).toBeInTheDocument(),
    );
  });

  it("shows 'Deleting…' text while request is in flight", async () => {
    vi.mocked(deletePlaylist).mockReturnValueOnce(new Promise(() => {}));
    render(<DeleteConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("button-confirm-delete"));
    expect(await screen.findByText("Deleting…")).toBeInTheDocument();
  });

  it("disables buttons while deleting", async () => {
    vi.mocked(deletePlaylist).mockReturnValueOnce(new Promise(() => {}));
    render(<DeleteConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("button-confirm-delete"));
    expect(screen.getByTestId("button-confirm-delete")).toBeDisabled();
    expect(screen.getByTestId("button-cancel-delete")).toBeDisabled();
  });
});
