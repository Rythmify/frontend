import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MadeForYou from "./MadeForYou";
import type { CuratedMixSummary } from "@/services/api/discover.service";

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
      <div>{children}</div>
    </div>
  ),
}));

vi.mock("@/components/UI/MadeForYouCard/MadeForYouCard", () => ({
  default: ({ item }: any) => (
    <div
      data-test={`made-for-you-card-${item.id}`}
      data-title={item.title}
      data-subtitle={item.subtitle}
      data-cover={item.coverUrl ?? ""}
      data-badge-0={item.badgeWords[0]}
      data-badge-1={item.badgeWords[1]}
    />
  ),
}));

// ─── Fixtures ─────────────────────────────────────────────

const makePreviewTrack = (id: string) => ({
  id,
  title: "Track",
  artist_name: "Artist",
  user_id: "u-001",
  genre_name: "Pop",
  duration: 200,
  play_count: 1000,
  like_count: 100,
  repost_count: 10,
  cover_image: "https://example.com/cover.jpg",
  stream_url: "/audio/track.mp3",
  created_at: "2026-01-01T00:00:00Z",
});

const mockDailyMix: CuratedMixSummary = {
  id: "mix-daily-001",
  label: "Daily Drops",
  description: "New releases based on your taste",
  track_count: 20,
  refreshes_at: "2026-04-09T00:00:00Z",
  cover_url: "https://example.com/daily.jpg",
  preview_track: makePreviewTrack("t-daily"),
};

const mockWeeklyMix: CuratedMixSummary = {
  id: "mix-weekly-001",
  label: "Weekly Wave",
  description: "The best of Rythmify this week",
  track_count: 30,
  refreshes_at: "2026-04-15T00:00:00Z",
  cover_url: "https://example.com/weekly.jpg",
  preview_track: makePreviewTrack("t-weekly"),
};

// ─── Tests ────────────────────────────────────────────────

describe("MadeForYou", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ───────────────────────────────────────────

  it("renders the section container", () => {
    render(<MadeForYou madeForYou={null} />);
    expect(screen.getByTestId("section-made-for-you")).toBeInTheDocument();
  });

  it("renders the 'Made for you' carousel title", () => {
    render(<MadeForYou madeForYou={null} />);
    expect(screen.getByTestId("carousel-title")).toHaveTextContent(
      "Made for you",
    );
  });

  // ── Fallback (madeForYou = null) ─────────────────────────

  it("renders exactly 2 fallback cards when madeForYou is null", () => {
    render(<MadeForYou madeForYou={null} />);
    expect(screen.getAllByTestId(/^made-for-you-card-/)).toHaveLength(2);
  });

  it("renders the daily-drops fallback card", () => {
    render(<MadeForYou madeForYou={null} />);
    expect(
      screen.getByTestId("made-for-you-card-daily-drops"),
    ).toBeInTheDocument();
  });

  it("renders the weekly-wave fallback card", () => {
    render(<MadeForYou madeForYou={null} />);
    expect(
      screen.getByTestId("made-for-you-card-weekly-wave"),
    ).toBeInTheDocument();
  });

  it("fallback daily card has correct badge words", () => {
    render(<MadeForYou madeForYou={null} />);
    const card = screen.getByTestId("made-for-you-card-daily-drops");
    expect(card).toHaveAttribute("data-badge-0", "DAILY");
    expect(card).toHaveAttribute("data-badge-1", "DROPS");
  });

  it("fallback weekly card has correct badge words", () => {
    render(<MadeForYou madeForYou={null} />);
    const card = screen.getByTestId("made-for-you-card-weekly-wave");
    expect(card).toHaveAttribute("data-badge-0", "WEEKLY");
    expect(card).toHaveAttribute("data-badge-1", "WAVE");
  });

  // ── API data ─────────────────────────────────────────────

  it("renders exactly 2 cards when madeForYou is provided", () => {
    render(
      <MadeForYou
        madeForYou={{ daily_mix: mockDailyMix, weekly_mix: mockWeeklyMix }}
      />,
    );
    expect(screen.getAllByTestId(/^made-for-you-card-/)).toHaveLength(2);
  });

  it("uses the mix id from the API as the card id", () => {
    render(
      <MadeForYou
        madeForYou={{ daily_mix: mockDailyMix, weekly_mix: mockWeeklyMix }}
      />,
    );
    expect(
      screen.getByTestId("made-for-you-card-mix-daily-001"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("made-for-you-card-mix-weekly-001"),
    ).toBeInTheDocument();
  });

  it("passes mix.label as the card title", () => {
    render(
      <MadeForYou
        madeForYou={{ daily_mix: mockDailyMix, weekly_mix: mockWeeklyMix }}
      />,
    );
    expect(
      screen.getByTestId("made-for-you-card-mix-daily-001"),
    ).toHaveAttribute("data-title", "Daily Drops");
    expect(
      screen.getByTestId("made-for-you-card-mix-weekly-001"),
    ).toHaveAttribute("data-title", "Weekly Wave");
  });

  it("passes mix.description as the card subtitle", () => {
    render(
      <MadeForYou
        madeForYou={{ daily_mix: mockDailyMix, weekly_mix: mockWeeklyMix }}
      />,
    );
    expect(
      screen.getByTestId("made-for-you-card-mix-daily-001"),
    ).toHaveAttribute("data-subtitle", "New releases based on your taste");
  });

  it("passes mix.cover_url as the card cover when present", () => {
    render(
      <MadeForYou
        madeForYou={{ daily_mix: mockDailyMix, weekly_mix: mockWeeklyMix }}
      />,
    );
    expect(
      screen.getByTestId("made-for-you-card-mix-daily-001"),
    ).toHaveAttribute("data-cover", "https://example.com/daily.jpg");
  });

  it("falls back to the fallback coverUrl when mix.cover_url is null", () => {
    const mixNoCover: CuratedMixSummary = {
      ...mockDailyMix,
      cover_url: null,
    };
    render(
      <MadeForYou
        madeForYou={{ daily_mix: mixNoCover, weekly_mix: mockWeeklyMix }}
      />,
    );
    const card = screen.getByTestId("made-for-you-card-mix-daily-001");
    expect(card.getAttribute("data-cover")).not.toBe("");
    expect(card.getAttribute("data-cover")).not.toBeNull();
  });

  it("does not render any fallback-id cards when API data is provided", () => {
    render(
      <MadeForYou
        madeForYou={{ daily_mix: mockDailyMix, weekly_mix: mockWeeklyMix }}
      />,
    );
    expect(
      screen.queryByTestId("made-for-you-card-daily-drops"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("made-for-you-card-weekly-wave"),
    ).not.toBeInTheDocument();
  });
});
