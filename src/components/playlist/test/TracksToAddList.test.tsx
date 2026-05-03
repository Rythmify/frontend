import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TracksToAddList from "../TracksToAddList";

const tracks = [
  { id: "1", title: "Summer", artistName: "Storm", coverUrl: "img.jpg" },
  { id: "2", title: "Winter", artistName: "Luna" },
];

describe("TracksToAddList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders all track titles and artist names", () => {
    render(
      <TracksToAddList tracks={tracks} isPlaylist={false} onRemove={vi.fn()} />,
    );
    expect(screen.getByText("Summer")).toBeInTheDocument();
    expect(screen.getByText("Storm")).toBeInTheDocument();
  });

  it("renders cover images when provided", () => {
    render(
      <TracksToAddList tracks={tracks} isPlaylist={false} onRemove={vi.fn()} />,
    );
    expect(screen.getByRole("img")).toHaveAttribute("src", "img.jpg");
  });

  it("calls onRemove with the correct ID when clicked", () => {
    const remove = vi.fn();
    render(
      <TracksToAddList tracks={tracks} isPlaylist={false} onRemove={remove} />,
    );
    fireEvent.click(screen.getByTestId("button-remove-track-1"));
    expect(remove).toHaveBeenCalledWith("1");
  });

  it("applies scrolling classes when isPlaylist is true", () => {
    const { container } = render(
      <TracksToAddList tracks={tracks} isPlaylist={true} onRemove={vi.fn()} />,
    );
    expect(container.firstChild).toHaveClass("overflow-y-auto", "max-h-64");
  });

  it("returns null/nothing when tracks list is empty", () => {
    const { container } = render(
      <TracksToAddList tracks={[]} isPlaylist={false} onRemove={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders placeholder for tracks without cover images", () => {
    render(
      <TracksToAddList
        tracks={[tracks[1]]}
        isPlaylist={false}
        onRemove={vi.fn()}
      />,
    );
    // Looking for the SVG fallback
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("does not show separator dot if artist name is missing", () => {
    render(
      <TracksToAddList
        tracks={[{ id: "3", title: "Solo" }]}
        isPlaylist={false}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.queryByText("·")).not.toBeInTheDocument();
  });
});
