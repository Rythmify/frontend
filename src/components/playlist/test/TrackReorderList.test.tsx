import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TrackReorderList from "../TrackReorderList";
import {
  reorderPlaylistTracks,
  removeTrackFromPlaylist,
} from "@/services/api/playlist/playlist.service";

// Mock services
vi.mock("@/services/api/playlist/playlist.service", () => ({
  reorderPlaylistTracks: vi.fn(),
  removeTrackFromPlaylist: vi.fn(),
}));

let lastDndContextProps: any = null;

// Mock dnd-kit components to avoid pointer event complexities
vi.mock("@dnd-kit/core", () => ({
  DndContext: (props: any) => {
    lastDndContextProps = props;
    return <div data-test="dnd-context">{props.children}</div>;
  },
  closestCenter: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: {},
  arrayMove: vi.fn((array, from, to) => {
    const next = [...array];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  }),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: vi.fn() } },
}));

// Fixed initialTracks with mandatory position and added_at fields
const initialTracks = [
  {
    track_id: "t1",
    title: "Song 1",
    artist_name: "Artist",
    position: 1,
    added_at: "2026-04-11T12:00:00Z",
  },
  {
    track_id: "t2",
    title: "Song 2",
    artist_name: "Producer",
    position: 2,
    added_at: "2026-04-11T12:05:00Z",
  },
];

describe("TrackReorderList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastDndContextProps = null;
    vi.mocked(removeTrackFromPlaylist).mockResolvedValue({
      data: { success: true },
    } as any);
  });

  it("renders track titles and artist names", () => {
    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={initialTracks}
        onTracksChanged={vi.fn()}
      />,
    );
    expect(screen.getByText("Song 1")).toBeInTheDocument();
    expect(screen.getByText("Song 2")).toBeInTheDocument();
    expect(screen.getByText(/Artist/)).toBeInTheDocument();
  });

  it("renders drag handles and remove buttons for all items", () => {
    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={initialTracks}
        onTracksChanged={vi.fn()}
      />,
    );
    const dragHandles = screen.getAllByLabelText("Drag to reorder");
    const removeButtons = screen.getAllByLabelText("Remove from playlist");

    expect(dragHandles).toHaveLength(2);
    expect(removeButtons).toHaveLength(2);
  });

  it("calls removeTrackFromPlaylist API with correct IDs when remove is clicked", async () => {
    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={initialTracks}
        onTracksChanged={vi.fn()}
      />,
    );
    const removeButtons = screen.getAllByLabelText("Remove from playlist");
    fireEvent.click(removeButtons[0]); // Click first track (t1)

    await waitFor(() =>
      expect(removeTrackFromPlaylist).toHaveBeenCalledWith("p1", "t1"),
    );
  });

  it("removes the specific track from DOM after successful deletion", async () => {
    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={initialTracks}
        onTracksChanged={vi.fn()}
      />,
    );
    fireEvent.click(screen.getAllByLabelText("Remove from playlist")[0]);

    await waitFor(() => {
      expect(screen.queryByText("Song 1")).not.toBeInTheDocument();
      expect(screen.getByText("Song 2")).toBeInTheDocument(); // Ensure other tracks remain
    });
  });

  it("shows empty message when no tracks exist", () => {
    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={[]}
        onTracksChanged={vi.fn()}
      />,
    );
    expect(screen.getByText(/No tracks in this playlist/)).toBeInTheDocument();
  });

  it("shows loading spinner while removal request is pending", async () => {
    // Return a promise that doesn't resolve immediately to test loading state
    vi.mocked(removeTrackFromPlaylist).mockReturnValue(new Promise(() => {}));

    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={initialTracks}
        onTracksChanged={vi.fn()}
      />,
    );
    fireEvent.click(screen.getAllByLabelText("Remove from playlist")[0]);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("calls onTracksChanged callback with updated list after removal", async () => {
    const cb = vi.fn();
    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={initialTracks}
        onTracksChanged={cb}
      />,
    );
    fireEvent.click(screen.getAllByLabelText("Remove from playlist")[0]);

    await waitFor(() => expect(cb).toHaveBeenCalled());
  });

  it("handles reorder drag end and persists the new order", async () => {
    const cb = vi.fn();
    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={initialTracks}
        onTracksChanged={cb}
      />,
    );

    await waitFor(() => expect(lastDndContextProps).toBeTruthy());
    await lastDndContextProps.onDragEnd({
      active: { id: "t1" },
      over: { id: "t2" },
    });

    expect(reorderPlaylistTracks).toHaveBeenCalledWith("p1", [
      { track_id: "t2", position: 1 },
      { track_id: "t1", position: 2 },
    ]);
    expect(cb).toHaveBeenCalledWith([
      expect.objectContaining({ track_id: "t2", position: 1 }),
      expect.objectContaining({ track_id: "t1", position: 2 }),
    ]);
  });

  it("ignores drag end when there is no target or the same item is dropped", async () => {
    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={initialTracks}
        onTracksChanged={vi.fn()}
      />,
    );

    await waitFor(() => expect(lastDndContextProps).toBeTruthy());
    await lastDndContextProps.onDragEnd({
      active: { id: "t1" },
      over: null,
    });
    await lastDndContextProps.onDragEnd({
      active: { id: "t1" },
      over: { id: "t1" },
    });

    expect(reorderPlaylistTracks).not.toHaveBeenCalled();
  });

  it("reverts the local order when reorder persistence fails", async () => {
    const cb = vi.fn();
    vi.mocked(reorderPlaylistTracks).mockRejectedValueOnce(new Error("fail"));

    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={initialTracks}
        onTracksChanged={cb}
      />,
    );

    await waitFor(() => expect(lastDndContextProps).toBeTruthy());
    await lastDndContextProps.onDragEnd({
      active: { id: "t1" },
      over: { id: "t2" },
    });

    await waitFor(() =>
      expect(cb).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ track_id: "t1", position: 1 }),
          expect.objectContaining({ track_id: "t2", position: 2 }),
        ]),
      ),
    );
  });

  it("logs and recovers when track removal fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(removeTrackFromPlaylist).mockRejectedValueOnce(new Error("fail"));

    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={initialTracks}
        onTracksChanged={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByLabelText("Remove from playlist")[0]);

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        "Failed to remove track:",
        expect.any(Error),
      ),
    );
    await waitFor(() =>
      expect(screen.getAllByLabelText("Remove from playlist")[0]).toBeEnabled(),
    );
    errorSpy.mockRestore();
  });

  it("updates tracks even when no change callback is provided", async () => {
    render(
      <TrackReorderList
        playlistId="p1"
        initialTracks={initialTracks}
      />,
    );

    fireEvent.click(screen.getAllByLabelText("Remove from playlist")[0]);

    await waitFor(() =>
      expect(screen.queryByText("Song 1")).not.toBeInTheDocument(),
    );
  });
});
