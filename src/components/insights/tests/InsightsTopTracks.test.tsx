import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { InsightsTopTracks } from "../InsightsTopTracks";
import type { Track } from "@/services/api/upload/track.service";

const makeTrack = (overrides: Partial<Track> = {}): Track => ({
  id: "track-1",
  title: "Test Track",
  artists: "Test Artist",
  genre: null,
  is_public: true,
  cover_image: null,
  audio_url: "",
  duration: 180,
  status: "ready",
  created_at: "2024-01-01T00:00:00Z",
  play_count: 42,
  like_count: 10,
  comment_count: 3,
  repost_count: 1,
  ...overrides,
});

describe("InsightsTopTracks", () => {
  it("renders the top tracks container", () => {
    render(
      <MemoryRouter>
        <InsightsTopTracks tracks={[]} period="7d" />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("insights-top-tracks")).toBeInTheDocument();
  });

  it("renders the Top tracks heading", () => {
    render(
      <MemoryRouter>
        <InsightsTopTracks tracks={[]} period="7d" />
      </MemoryRouter>,
    );
    expect(screen.getByText("Top tracks")).toBeInTheDocument();
  });

  it("shows the period label", () => {
    render(
      <MemoryRouter>
        <InsightsTopTracks tracks={[]} period="30d" />
      </MemoryRouter>,
    );
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("renders empty state message when no tracks", () => {
    render(
      <MemoryRouter>
        <InsightsTopTracks tracks={[]} period="7d" />
      </MemoryRouter>,
    );
    expect(screen.getByText("Upload tracks to see insights.")).toBeInTheDocument();
  });

  it("renders track list when tracks are provided", () => {
    const tracks = [makeTrack({ id: "t1", title: "Song One", play_count: 100 })];
    render(
      <MemoryRouter>
        <InsightsTopTracks tracks={tracks} period="7d" />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("insights-top-track-t1")).toBeInTheDocument();
    expect(screen.getByText("Song One")).toBeInTheDocument();
  });

  it("renders track play count", () => {
    const tracks = [makeTrack({ id: "t1", play_count: 1234 })];
    render(
      <MemoryRouter>
        <InsightsTopTracks tracks={tracks} period="7d" />
      </MemoryRouter>,
    );
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("renders artist name when provided", () => {
    const tracks = [makeTrack({ artists: "My Artist" })];
    render(
      <MemoryRouter>
        <InsightsTopTracks tracks={tracks} period="7d" />
      </MemoryRouter>,
    );
    expect(screen.getByText("My Artist")).toBeInTheDocument();
  });

  it("renders ranking numbers for multiple tracks", () => {
    const tracks = [
      makeTrack({ id: "t1", title: "First" }),
      makeTrack({ id: "t2", title: "Second" }),
      makeTrack({ id: "t3", title: "Third" }),
    ];
    render(
      <MemoryRouter>
        <InsightsTopTracks tracks={tracks} period="7d" />
      </MemoryRouter>,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders cover image when track has one", () => {
    const tracks = [makeTrack({ cover_image: "https://example.com/cover.jpg", title: "With Cover" })];
    render(
      <MemoryRouter>
        <InsightsTopTracks tracks={tracks} period="7d" />
      </MemoryRouter>,
    );
    const img = screen.getByAltText("With Cover");
    expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("renders the See all link pointing to /artists", () => {
    render(
      <MemoryRouter>
        <InsightsTopTracks tracks={[]} period="7d" />
      </MemoryRouter>,
    );
    const link = screen.getByText("See all");
    expect(link.closest("a")).toHaveAttribute("href", "/artists");
  });
});
