import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MoreOfWhatYouLike from "./MoreOfWhatYouLike";
import type { DiscoveryTrack } from "@/services/api/discover.service";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({ title, children }: any) => (
    <div data-test="carousel-wrapper">
      <h2 data-test="carousel-title">{title}</h2>
      <div data-test="carousel-scroll-container">{children}</div>
    </div>
  ),
}));

vi.mock("@/components/UI/card/Card", () => ({
  default: ({ track }: any) => <div data-test={`track-card-${track.id}`} />,
}));

vi.mock("@/services/api/discover.mapper", () => ({
  mapDiscoveryTrack: (t: any) => ({ id: t.id, title: t.title ?? "" }),
}));

// ─── Fixtures ─────────────────────────────────────────────

const makeTrack = (id: string): DiscoveryTrack => ({
  id,
  title: `Track ${id}`,
  artist_name: "Artist",
  user_id: "u-001",
  genre_name: "Pop",
  duration: 200,
  play_count: 1000,
  like_count: 100,
  repost_count: 10,
  cover_image: null,
  stream_url: null,
  created_at: "2026-01-01T00:00:00Z",
});

// ─── Test Suite ───────────────────────────────────────────

describe("MoreOfWhatYouLike", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the section container", () => {
    render(<MoreOfWhatYouLike tracks={[]} />);
    expect(screen.getByTestId("section-more-of-what-you-like")).toBeInTheDocument();
  });

  it("renders the 'More of what you like' carousel title", () => {
    render(<MoreOfWhatYouLike tracks={[makeTrack("t1")]} />);
    expect(screen.getByTestId("carousel-title")).toHaveTextContent(
      "More of what you like",
    );
  });

  it("renders a TrackCard for each provided track", () => {
    render(<MoreOfWhatYouLike tracks={[makeTrack("t1"), makeTrack("t2"), makeTrack("t3")]} />);
    expect(screen.getByTestId("track-card-t1")).toBeInTheDocument();
    expect(screen.getByTestId("track-card-t2")).toBeInTheDocument();
    expect(screen.getByTestId("track-card-t3")).toBeInTheDocument();
  });

  it("renders the correct number of cards", () => {
    render(<MoreOfWhatYouLike tracks={[makeTrack("t1"), makeTrack("t2")]} />);
    expect(screen.getAllByTestId(/^track-card-/)).toHaveLength(2);
  });

  it("renders no cards when tracks prop is empty", () => {
    render(<MoreOfWhatYouLike tracks={[]} />);
    expect(screen.queryAllByTestId(/^track-card-/)).toHaveLength(0);
  });
});
