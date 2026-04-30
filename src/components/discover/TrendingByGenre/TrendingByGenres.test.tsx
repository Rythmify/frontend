import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TrendingByGenres from "./TrendingByGenres";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div data-test="carousel-wrapper">
      <h2 data-test="carousel-title">{title}</h2>
      <div data-test="carousel-scroll-container">{children}</div>
    </div>
  ),
}));

vi.mock("@/components/UI/GenreCard/GenreCard", () => ({
  default: ({ item, index }: any) => (
    <div
      data-test={`genre-card-${item.id}`}
      data-genre={item.genre}
      data-cover={item.cover_image ?? ""}
      data-index={String(index)}
    />
  ),
}));

// ─── Test data ───────────────────────────────────────────

const makePreviewTrack = (coverImage: string) => ({
  id: "t-001",
  title: "Track",
  artist_name: "Artist",
  user_id: "u-001",
  genre_name: "Pop",
  duration: 200,
  play_count: 1000,
  like_count: 100,
  repost_count: 10,
  cover_image: coverImage,
  stream_url: "/audio/track.mp3",
  created_at: "2026-01-01T00:00:00Z",
});

// ─── Tests ────────────────────────────────────────────────

describe("TrendingByGenres", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ───────────────────────────────────────────

  it("renders the section container", () => {
    render(<TrendingByGenres genres={[]} />);
    expect(
      screen.getByTestId("section-trending-by-genres"),
    ).toBeInTheDocument();
  });

  it("renders the 'Trending by genres' carousel title", () => {
    render(<TrendingByGenres genres={[]} />);
    expect(screen.getByTestId("carousel-title")).toHaveTextContent(
      "Trending by genres",
    );
  });

  // ── API data ─────────────────────────────────────────────

  it("renders a card for each provided genre", () => {
    const genres = [
      { genre_id: "g-001", genre_name: "Hip-Hop" },
      { genre_id: "g-002", genre_name: "Pop" },
      { genre_id: "g-003", genre_name: "Jazz" },
    ];
    render(<TrendingByGenres genres={genres} />);
    expect(screen.getAllByTestId(/^genre-card-/)).toHaveLength(3);
  });

  it("uses genre_id as the card id", () => {
    render(
      <TrendingByGenres
        genres={[{ genre_id: "g-abc-123", genre_name: "Rock" }]}
      />,
    );
    expect(screen.getByTestId("genre-card-g-abc-123")).toBeInTheDocument();
  });

  it("passes genre_name to the card", () => {
    render(
      <TrendingByGenres
        genres={[{ genre_id: "g-001", genre_name: "Hip-Hop" }]}
      />,
    );
    expect(screen.getByTestId("genre-card-g-001")).toHaveAttribute(
      "data-genre",
      "Hip-Hop",
    );
  });

  it("passes sequential index to each card", () => {
    const genres = [
      { genre_id: "g-001", genre_name: "Pop" },
      { genre_id: "g-002", genre_name: "Rock" },
      { genre_id: "g-003", genre_name: "Jazz" },
    ];
    render(<TrendingByGenres genres={genres} />);
    expect(screen.getByTestId("genre-card-g-001")).toHaveAttribute(
      "data-index",
      "0",
    );
    expect(screen.getByTestId("genre-card-g-002")).toHaveAttribute(
      "data-index",
      "1",
    );
    expect(screen.getByTestId("genre-card-g-003")).toHaveAttribute(
      "data-index",
      "2",
    );
  });

  // ── Cover image from preview_track ──────────────────────

  it("uses preview_track.cover_image as the card cover", () => {
    render(
      <TrendingByGenres
        genres={[{
          genre_id: "g-001",
          genre_name: "Hip-Hop",
          preview_track: makePreviewTrack("https://example.com/cover.jpg"),
        }]}
      />,
    );
    expect(screen.getByTestId("genre-card-g-001")).toHaveAttribute(
      "data-cover",
      "https://example.com/cover.jpg",
    );
  });

  it("passes empty string as cover when genre has no preview_track", () => {
    render(
      <TrendingByGenres
        genres={[{ genre_id: "g-001", genre_name: "Hip-Hop" }]}
      />,
    );
    expect(screen.getByTestId("genre-card-g-001")).toHaveAttribute("data-cover", "");
  });

  // ── Empty genres ─────────────────────────────────────────

  it("renders no cards when genres prop is empty", () => {
    render(<TrendingByGenres genres={[]} />);
    expect(screen.queryAllByTestId(/^genre-card-/)).toHaveLength(0);
  });
});
