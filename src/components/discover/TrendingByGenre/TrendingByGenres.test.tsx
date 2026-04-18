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

// ─── Known image URLs (from GENRE_IMAGES map in component) ─

const HIP_HOP_IMG =
  "https://images.unsplash.com/photo-1547355253-ff0740f859b4?w=400&q=80";
const POP_IMG =
  "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80";
const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80";

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
    expect(screen.getByTestId("genre-card-g-001")).toHaveAttribute("data-index", "0");
    expect(screen.getByTestId("genre-card-g-002")).toHaveAttribute("data-index", "1");
    expect(screen.getByTestId("genre-card-g-003")).toHaveAttribute("data-index", "2");
  });

  // ── Genre image mapping ──────────────────────────────────

  it("maps a known genre name to its specific cover image", () => {
    render(
      <TrendingByGenres
        genres={[{ genre_id: "g-001", genre_name: "Hip-Hop" }]}
      />,
    );
    expect(screen.getByTestId("genre-card-g-001")).toHaveAttribute(
      "data-cover",
      HIP_HOP_IMG,
    );
  });

  it("is case-insensitive when resolving the genre image", () => {
    render(
      <TrendingByGenres genres={[{ genre_id: "g-001", genre_name: "POP" }]} />,
    );
    expect(screen.getByTestId("genre-card-g-001")).toHaveAttribute(
      "data-cover",
      POP_IMG,
    );
  });

  it("falls back to the default image for an unknown genre", () => {
    render(
      <TrendingByGenres
        genres={[{ genre_id: "g-001", genre_name: "Afro Jazz Fusion" }]}
      />,
    );
    expect(screen.getByTestId("genre-card-g-001")).toHaveAttribute(
      "data-cover",
      DEFAULT_IMG,
    );
  });

  // ── Mock fallback ────────────────────────────────────────

  it("falls back to the 8 built-in mock genres when genres prop is empty", () => {
    render(<TrendingByGenres genres={[]} />);
    expect(screen.getAllByTestId(/^genre-card-/)).toHaveLength(8);
  });

  it("mock genre cards have a non-empty cover image", () => {
    render(<TrendingByGenres genres={[]} />);
    screen.getAllByTestId(/^genre-card-/).forEach((card) => {
      expect(card.getAttribute("data-cover")).not.toBe("");
    });
  });

  it("prefers API genres over mock data when genres are provided", () => {
    render(
      <TrendingByGenres
        genres={[{ genre_id: "g-001", genre_name: "Hip-Hop" }]}
      />,
    );
    expect(screen.getAllByTestId(/^genre-card-/)).toHaveLength(1);
    expect(screen.queryByTestId("genre-card-genre-1")).not.toBeInTheDocument();
  });
});
