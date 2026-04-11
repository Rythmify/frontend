import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TrackList from "../TrackList";

vi.mock("../../pages/[username]/[trackSlug]/components/SharePopup", () => ({
  default: ({ onClose }: any) => (
    <div data-test="share-popup">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const mockTracks = [
  {
    track_id: "t1",
    title: "Alpha",
    artist_name: "ArtA",
    artist_username: "ua",
    play_count: 100,
    duration: 120,
  },
  {
    track_id: "t2",
    title: "Beta",
    artist_name: "ArtB",
    artist_username: "ub",
    play_count: 200,
    duration: 180,
  },
];

describe("TrackList", () => {
  it("renders all track titles in the list", () => {
    render(
      <MemoryRouter>
        <TrackList tracks={mockTracks} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("renders artist names as valid links", () => {
    render(
      <MemoryRouter>
        <TrackList tracks={mockTracks} />
      </MemoryRouter>,
    );
    const link = screen.getByText("ArtA").closest("a");
    expect(link).toHaveAttribute("href", "/ua");
  });

  it("calls onTrackPlay when a track row is clicked", () => {
    const play = vi.fn();
    render(
      <MemoryRouter>
        <TrackList tracks={mockTracks} onTrackPlay={play} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Alpha"));
    expect(play).toHaveBeenCalledWith(mockTracks[0]);
  });

  it("highlights the currently playing track", () => {
    const { container } = render(
      <MemoryRouter>
        <TrackList tracks={mockTracks} currentTrackId="t1" />
      </MemoryRouter>,
    );
    const activeRow = container.querySelector(".bg-white\\/\\[0\\.08\\]");
    expect(activeRow).toBeInTheDocument();
  });

  it("renders play counts formatted", () => {
    render(
      <MemoryRouter>
        <TrackList tracks={mockTracks} />
      </MemoryRouter>,
    );
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });

  it("opens share popup on share button click", () => {
    render(
      <MemoryRouter>
        <TrackList tracks={mockTracks} />
      </MemoryRouter>,
    );
    // Hover logic usually required for CSS-based buttons, but simulate click if possible
    const shareBtn = screen.getAllByTestId("button-share-track")[0];
    fireEvent.click(shareBtn);
    expect(screen.getByTestId("share-popup")).toBeInTheDocument();
  });

  it("renders empty state safely", () => {
    render(
      <MemoryRouter>
        <TrackList tracks={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("track-list")).toBeInTheDocument();
  });
});
