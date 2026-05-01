import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import QueuePanel from "../QueuePanel";
import { MemoryRouter } from "react-router-dom";

// Mock the stores
const mockRemoveFromQueue = vi.fn();
const mockSetTrack = vi.fn();
const mockClearQueue = vi.fn();
const mockToggleQueue = vi.fn();

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn(() => ({
    queue: [
      { id: "t1", title: "Track 1", artistName: "Artist 1" },
      { id: "t2", title: "Track 2", artistName: "Artist 2" }
    ],
    queueIndex: 0,
    currentTrack: { id: "t1", title: "Track 1", artistName: "Artist 1" },
    isQueueOpen: true,
    removeFromQueue: mockRemoveFromQueue,
    setTrack: mockSetTrack,
    clearQueue: mockClearQueue,
    toggleQueue: mockToggleQueue,
  }))
}));

describe("QueuePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the queue panel when open", () => {
    render(<MemoryRouter><QueuePanel onClose={mockToggleQueue} /></MemoryRouter>);
    expect(screen.getByTestId("queue-panel")).toBeInTheDocument();
    expect(screen.getByText("Next up")).toBeInTheDocument();
  });

  it("displays tracks in the queue", () => {
    render(<MemoryRouter><QueuePanel onClose={mockToggleQueue} /></MemoryRouter>);
    // "Track 1" should be displayed, possibly multiple times if also current track
    const tracks = screen.getAllByText(/Track \d/);
    expect(tracks.length).toBeGreaterThan(0);
  });

  it("calls clearQueue when Clear button is clicked", () => {
    render(<MemoryRouter><QueuePanel onClose={mockToggleQueue} /></MemoryRouter>);
    const clearBtn = screen.getByTestId("queue-clear-btn");
    fireEvent.click(clearBtn);
    expect(mockClearQueue).toHaveBeenCalled();
  });

  it("calls toggleQueue when close button is clicked", () => {
    render(<MemoryRouter><QueuePanel onClose={mockToggleQueue} /></MemoryRouter>);
    const closeBtn = screen.getByTestId("queue-close-btn");
    fireEvent.click(closeBtn);
    expect(mockToggleQueue).toHaveBeenCalled();
  });

  it("calls removeFromQueue when remove button on a track is clicked", () => {
    render(<MemoryRouter><QueuePanel onClose={mockToggleQueue} /></MemoryRouter>);
    const removeBtns = screen.getAllByTestId(/queue-remove-/);
    if (removeBtns.length > 0) {
      fireEvent.click(removeBtns[0]);
      expect(mockRemoveFromQueue).toHaveBeenCalled();
    }
  });

  it("calls playQueueTrack when a queue row is clicked", () => {
    render(<MemoryRouter><QueuePanel onClose={mockToggleQueue} /></MemoryRouter>);
    const rows = screen.getAllByTestId(/queue-row-/);
    if (rows.length > 0) {
      fireEvent.click(rows[0]);
      expect(mockSetTrack).toHaveBeenCalled();
    }
  });
});
