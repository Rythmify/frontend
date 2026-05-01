import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MixedForYou from "./MixedForYou";
import type { PersonalMix } from "@/services/api/discover.service";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/stores/auth.store", () => ({ useAuthStore: vi.fn() }));

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({ title, children }: any) => (
    <div data-test="carousel-wrapper">
      <h2 data-test="carousel-title">{title}</h2>
      <div data-test="carousel-scroll-container">{children}</div>
    </div>
  ),
}));

vi.mock("@/components/UI/MixCard/MixCard", () => ({
  default: ({ mix, index }: any) => (
    <div data-test={`mix-card-${mix.id}`} data-index={String(index)} />
  ),
}));

import { useAuthStore } from "@/stores/auth.store";

// ─── Fixtures ─────────────────────────────────────────────

const makePreviewTrack = () => ({
  id: "pt-001",
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
});

const makeMix = (id: string): PersonalMix => ({
  id,
  label: `Mix ${id}`,
  flavor: "listening_history",
  genre_name: "Pop",
  cover_image: null,
  track_count: 5,
  generated_at: "2026-01-01T00:00:00Z",
  preview_track: makePreviewTrack(),
});

// ─── Test Suite ───────────────────────────────────────────

describe("MixedForYou", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({ user: null } as any);
  });

  it("renders the section container", () => {
    render(<MixedForYou mixes={[]} />);
    expect(screen.getByTestId("section-mixed-for-you")).toBeInTheDocument();
  });

  it("uses displayName in the title when available", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { displayName: "Alice", username: "alice" },
    } as any);
    render(<MixedForYou mixes={[makeMix("m1")]} />);
    expect(screen.getByTestId("carousel-title")).toHaveTextContent("Mixed for Alice");
  });

  it("falls back to username when displayName is absent", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { displayName: undefined, username: "bob" },
    } as any);
    render(<MixedForYou mixes={[makeMix("m1")]} />);
    expect(screen.getByTestId("carousel-title")).toHaveTextContent("Mixed for bob");
  });

  it("defaults to 'You' when user is null", () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: null } as any);
    render(<MixedForYou mixes={[makeMix("m1")]} />);
    expect(screen.getByTestId("carousel-title")).toHaveTextContent("Mixed for You");
  });

  it("renders a MixCard for each mix", () => {
    render(<MixedForYou mixes={[makeMix("m1"), makeMix("m2")]} />);
    expect(screen.getByTestId("mix-card-m1")).toBeInTheDocument();
    expect(screen.getByTestId("mix-card-m2")).toBeInTheDocument();
  });

  it("renders the correct number of mix cards", () => {
    render(<MixedForYou mixes={[makeMix("m1"), makeMix("m2"), makeMix("m3")]} />);
    expect(screen.getAllByTestId(/^mix-card-/)).toHaveLength(3);
  });

  it("passes the correct index to each MixCard", () => {
    render(<MixedForYou mixes={[makeMix("m1"), makeMix("m2")]} />);
    expect(screen.getByTestId("mix-card-m1")).toHaveAttribute("data-index", "0");
    expect(screen.getByTestId("mix-card-m2")).toHaveAttribute("data-index", "1");
  });

  it("renders no cards when mixes prop is empty", () => {
    render(<MixedForYou mixes={[]} />);
    expect(screen.queryAllByTestId(/^mix-card-/)).toHaveLength(0);
  });
});
