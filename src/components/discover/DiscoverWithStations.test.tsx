import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DiscoverWithStations from "./DiscoverWithStations";
import type { DiscoveryStation } from "@/services/api/discover.service";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({ title, children }: any) => (
    <div data-test="carousel-wrapper">
      <h2 data-test="carousel-title">{title}</h2>
      <div data-test="carousel-scroll-container">{children}</div>
    </div>
  ),
}));

vi.mock("@/components/UI/StationCard/StationCard", () => ({
  default: ({ station, colorIndex }: any) => (
    <div
      data-test={`station-card-${station.id}`}
      data-color-index={String(colorIndex)}
    />
  ),
}));

vi.mock("@/services/api/discover.mapper", () => ({
  mapDiscoveryStation: (s: any) => ({ id: s.id, name: s.artist_name }),
}));

// ─── Fixtures ─────────────────────────────────────────────

const makeStation = (id: string): DiscoveryStation => ({
  id,
  artist_id: `a-${id}`,
  artist_name: `Artist ${id}`,
  images: { left: null, center: null, right: null },
  preview_track: {
    id: `pt-${id}`,
    title: "Preview",
    artist_name: "Artist",
    user_id: "u-001",
    genre_name: "Pop",
    duration: 200,
    play_count: 100,
    like_count: 10,
    repost_count: 1,
    cover_image: null,
    stream_url: null,
    created_at: "2026-01-01T00:00:00Z",
  },
  track_count: 5,
});

// ─── Test Suite ───────────────────────────────────────────

describe("DiscoverWithStations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the section container", () => {
    render(<DiscoverWithStations stations={[makeStation("s1")]} />);
    expect(screen.getByTestId("section-discover-with-stations")).toBeInTheDocument();
  });

  it("renders the 'Discover with Stations' carousel title", () => {
    render(<DiscoverWithStations stations={[makeStation("s1")]} />);
    expect(screen.getByTestId("carousel-title")).toHaveTextContent(
      "Discover with Stations",
    );
  });

  it("renders a StationCard for each station", () => {
    render(<DiscoverWithStations stations={[makeStation("s1"), makeStation("s2")]} />);
    expect(screen.getByTestId("station-card-s1")).toBeInTheDocument();
    expect(screen.getByTestId("station-card-s2")).toBeInTheDocument();
  });

  it("renders the correct number of station cards", () => {
    render(
      <DiscoverWithStations
        stations={[makeStation("s1"), makeStation("s2"), makeStation("s3")]}
      />,
    );
    expect(screen.getAllByTestId(/^station-card-/)).toHaveLength(3);
  });

  it("passes the correct colorIndex to each StationCard", () => {
    render(<DiscoverWithStations stations={[makeStation("s1"), makeStation("s2")]} />);
    expect(screen.getByTestId("station-card-s1")).toHaveAttribute("data-color-index", "0");
    expect(screen.getByTestId("station-card-s2")).toHaveAttribute("data-color-index", "1");
  });

  it("renders no cards when stations prop is empty", () => {
    render(<DiscoverWithStations stations={[]} />);
    expect(screen.queryAllByTestId(/^station-card-/)).toHaveLength(0);
  });
});
