import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TrackList from "../TrackList";
import { repostTrack } from "@/services/mocks/Track.service";

vi.mock("@/pages/[username]/[trackSlug]/components/SharePopup", () => ({
  default: ({ onClose }: any) => (
    <div data-test="share-popup">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock("../AddToPlaylistModal", () => ({
  default: ({ onClose }: any) => (
    <div data-test="add-to-playlist-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock("@/services/mocks/Track.service", () => ({
  repostTrack: vi.fn().mockResolvedValue({ reposted: true, repostCount: 1 }),
}));

const mockTracks = [
  {
    track_id: "t1",
    title: "Alpha",
    artist_name: "ArtA",
    artist_username: "ua",
    play_count: 100,
    duration: 120,
    position: 1,
    added_at: "2026-04-17T00:00:00Z", 
  },
  {
    track_id: "t2",
    title: "Beta",
    artist_name: "ArtB",
    artist_username: "ub",
    play_count: 200,
    duration: 180,
    position: 2, 
    added_at: "2026-04-17T00:00:00Z", 
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
    expect(screen.getByTestId("link-track-title-t1")).toHaveAttribute(
      "href",
      "/ua/t1",
    );
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
    fireEvent.click(screen.getByTestId("track-Item-t1"));
    expect(play).toHaveBeenCalledWith(mockTracks[0]);
  });

  it("highlights the currently playing track", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <TrackList tracks={mockTracks} currentTrackId="t1" />
      </MemoryRouter>,
    );
    expect(getByTestId("track-Item-t1")).toHaveClass("bg-bg");
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
    const { container } = render(
      <MemoryRouter>
        <TrackList tracks={mockTracks} />
      </MemoryRouter>,
    );

    const firstRow = container.querySelector(".group") as HTMLElement;
    fireEvent.mouseEnter(firstRow);

    const shareBtn = screen.getAllByTestId("button-share-track")[0];
    fireEvent.click(shareBtn);
    expect(screen.getByTestId("share-popup")).toBeInTheDocument();
  });

  it("opens add to playlist modal from the more menu", () => {
    const { container } = render(
      <MemoryRouter>
        <TrackList tracks={mockTracks} />
      </MemoryRouter>,
    );

    const firstRow = container.querySelector(".group") as HTMLElement;
    fireEvent.mouseEnter(firstRow);
    fireEvent.click(screen.getAllByTestId("button-more-track-t1")[0]);
    fireEvent.click(screen.getByTestId("dropdown-playlist-track-t1"));

    expect(screen.getByTestId("add-to-playlist-modal")).toBeInTheDocument();
  });

  it("calls repostTrack when repost is clicked", async () => {
    const { container } = render(
      <MemoryRouter>
        <TrackList tracks={mockTracks} />
      </MemoryRouter>,
    );

    const firstRow = container.querySelector(".group") as HTMLElement;
    fireEvent.mouseEnter(firstRow);
    fireEvent.click(screen.getAllByTestId("button-repost-track-t1")[0]);

    expect(repostTrack).toHaveBeenCalledWith("t1");
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
