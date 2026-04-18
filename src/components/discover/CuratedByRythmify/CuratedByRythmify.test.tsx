import { type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CuratedByRythmify from "./CuratedByRythmify";
import { mockCuratedMixes } from "@/services/mocks/discover";
import type { CuratedHomeMixPreview } from "@/services/api/discover.service";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({
    title,
    children,
  }: {
    title: string;
    children: ReactNode;
  }) => (
    <div data-test="carousel-wrapper">
      <h2 data-test="carousel-title">{title}</h2>
      <div data-test="carousel-scroll-container">{children}</div>
    </div>
  ),
}));

vi.mock("@/components/UI/MixCard/CuratedMixCard", () => ({
  default: ({ mix }: { mix: CuratedHomeMixPreview }) => (
    <div data-test={`curated-mix-card-${mix.mix_id}`}>
      <span data-test="card-title">{mix.title}</span>
      <span data-test="card-subtitle">
        {mix.preview_track?.artist_name ?? ""}
      </span>
    </div>
  ),
}));

// ─── Fixtures ─────────────────────────────────────────────

const mockMixes: CuratedHomeMixPreview[] = [
  {
    mix_id: "mix_custom_aaa-001",
    title: "Night Drive",
    cover_url: "https://picsum.photos/seed/601/200/200",
    preview_track: {
      id: "t-001",
      title: "Butterfly Effect",
      artist_name: "Travis Scott",
      user_id: "u-001",
      genre_name: "Hip-Hop",
      duration: 225,
      play_count: 75000,
      like_count: 3500,
      repost_count: 400,
      cover_image: "https://picsum.photos/seed/601/200/200",
      stream_url: "/audio/track1.mp3",
      created_at: "2026-01-15T00:00:00Z",
    },
  },
  {
    mix_id: "mix_custom_bbb-002",
    title: "Synthwave Sunsets",
    cover_url: "https://picsum.photos/seed/602/200/200",
    preview_track: {
      id: "t-002",
      title: "Blinding Lights",
      artist_name: "The Weeknd",
      user_id: "u-002",
      genre_name: "Synthwave",
      duration: 200,
      play_count: 95000,
      like_count: 5200,
      repost_count: 700,
      cover_image: "https://picsum.photos/seed/602/200/200",
      stream_url: "/audio/track2.mp3",
      created_at: "2026-02-01T00:00:00Z",
    },
  },
  {
    mix_id: "mix_custom_ccc-003",
    title: "Pop Afternoons",
    cover_url: null,
    preview_track: {
      id: "t-003",
      title: "Levitating",
      artist_name: "Dua Lipa",
      user_id: "u-003",
      genre_name: "Pop",
      duration: 203,
      play_count: 65000,
      like_count: 3200,
      repost_count: 300,
      cover_image: "https://picsum.photos/seed/603/200/200",
      stream_url: "/audio/track3.mp3",
      created_at: "2026-02-15T00:00:00Z",
    },
  },
];

// ─── Tests ────────────────────────────────────────────────

describe("CuratedByRythmify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the section container", () => {
    render(<CuratedByRythmify mixes={mockMixes} />);
    expect(
      screen.getByTestId("section-curated-by-rythmify"),
    ).toBeInTheDocument();
  });

  it("renders the 'Curated by Rythmify' title", () => {
    render(<CuratedByRythmify mixes={mockMixes} />);
    expect(screen.getByTestId("carousel-title")).toHaveTextContent(
      "Curated by Rythmify",
    );
  });

  it("renders a card for each mix in props", () => {
    render(<CuratedByRythmify mixes={mockMixes} />);
    mockMixes.forEach((mix) => {
      expect(
        screen.getByTestId(`curated-mix-card-${mix.mix_id}`),
      ).toBeInTheDocument();
    });
  });

  it("renders the correct number of cards from props", () => {
    render(<CuratedByRythmify mixes={mockMixes} />);
    expect(screen.getAllByTestId(/^curated-mix-card-/)).toHaveLength(
      mockMixes.length,
    );
  });

  it("passes the correct title to each card", () => {
    render(<CuratedByRythmify mixes={mockMixes} />);
    expect(screen.getByTestId("curated-mix-card-mix_custom_aaa-001")).toHaveTextContent(
      "Night Drive",
    );
    expect(screen.getByTestId("curated-mix-card-mix_custom_bbb-002")).toHaveTextContent(
      "Synthwave Sunsets",
    );
  });

  it("falls back to mockCuratedMixes when mixes prop is empty", () => {
    render(<CuratedByRythmify mixes={[]} />);
    expect(screen.getAllByTestId(/^curated-mix-card-/)).toHaveLength(
      mockCuratedMixes.length,
    );
  });

  it("renders mock cards with correct mix_ids when falling back", () => {
    render(<CuratedByRythmify mixes={[]} />);
    mockCuratedMixes.forEach((mix) => {
      expect(
        screen.getByTestId(`curated-mix-card-${mix.mix_id}`),
      ).toBeInTheDocument();
    });
  });

  it("prefers API data over mock data when mixes are provided", () => {
    render(<CuratedByRythmify mixes={mockMixes} />);
    mockCuratedMixes
      .filter((m) => !mockMixes.find((a) => a.mix_id === m.mix_id))
      .forEach((mix) => {
        expect(
          screen.queryByTestId(`curated-mix-card-${mix.mix_id}`),
        ).not.toBeInTheDocument();
      });
  });
});
