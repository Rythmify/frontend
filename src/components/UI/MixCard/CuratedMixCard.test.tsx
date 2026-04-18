import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CuratedMixCard from "./CuratedMixCard";
import { usePlayerStore } from "@/stores/player.store";
import type { CuratedHomeMixPreview } from "@/services/api/discover.service";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────

const basePreviewTrack = {
  id: "t-001",
  title: "Butterfly Effect",
  artist_name: "Travis Scott",
  user_id: "u-001",
  genre_name: "Hip-Hop",
  duration: 225,
  play_count: 75000,
  like_count: 3500,
  repost_count: 400,
  cover_image: "https://picsum.photos/seed/501/200/200",
  stream_url: "/audio/track1.mp3",
  created_at: "2026-01-15T00:00:00Z",
};

const baseMix: CuratedHomeMixPreview = {
  mix_id: "mix_custom_aaa-001",
  title: "Night Drive",
  cover_url: "https://picsum.photos/seed/601/200/200",
  preview_track: basePreviewTrack,
};

const makeStore = (overrides: Record<string, unknown> = {}) => ({
  isPlaying: false,
  currentTrack: null,
  setTrack: vi.fn(),
  togglePlay: vi.fn(),
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────

describe("CuratedMixCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlayerStore).mockReturnValue(makeStore() as any);
  });

  // ── Rendering ───────────────────────────────────────────

  it("renders the card container with the correct mix_id", () => {
    render(<CuratedMixCard mix={baseMix} />);
    expect(
      screen.getByTestId("curated-mix-card-mix_custom_aaa-001"),
    ).toBeInTheDocument();
  });

  it("renders the title in the badge", () => {
    render(<CuratedMixCard mix={baseMix} />);
    expect(screen.getByTestId("curated-mix-card-badge")).toHaveTextContent(
      "Night Drive",
    );
  });

  it("renders artist_name as subtitle", () => {
    render(<CuratedMixCard mix={baseMix} />);
    expect(screen.getByTestId("curated-mix-card-subtitle")).toHaveTextContent(
      "Travis Scott",
    );
  });

  it("falls back to genre_name when artist_name is null", () => {
    const mix: CuratedHomeMixPreview = {
      ...baseMix,
      preview_track: { ...basePreviewTrack, artist_name: null, genre_name: "Electronic" },
    };
    render(<CuratedMixCard mix={mix} />);
    expect(screen.getByTestId("curated-mix-card-subtitle")).toHaveTextContent(
      "Electronic",
    );
  });

  it("renders empty subtitle when both artist_name and genre_name are null", () => {
    const mix: CuratedHomeMixPreview = {
      ...baseMix,
      preview_track: { ...basePreviewTrack, artist_name: null, genre_name: null },
    };
    render(<CuratedMixCard mix={mix} />);
    expect(screen.getByTestId("curated-mix-card-subtitle")).toHaveTextContent("");
  });

  it("renders the play button", () => {
    render(<CuratedMixCard mix={baseMix} />);
    expect(screen.getByTestId("button-play")).toBeInTheDocument();
  });

  // ── Cover image ──────────────────────────────────────────

  it("shows cover image when cover_url is present", () => {
    render(<CuratedMixCard mix={baseMix} />);
    const img = screen.getByTestId("curated-mix-card-image");
    expect(img).toHaveAttribute("src", baseMix.cover_url);
    expect(img).toHaveAttribute("alt", "Night Drive");
  });

  it("falls back to preview_track.cover_image when cover_url is null", () => {
    const mix: CuratedHomeMixPreview = { ...baseMix, cover_url: null };
    render(<CuratedMixCard mix={mix} />);
    expect(screen.getByTestId("curated-mix-card-image")).toHaveAttribute(
      "src",
      basePreviewTrack.cover_image,
    );
  });

  it("does not render an image when both cover_url and cover_image are null", () => {
    const mix: CuratedHomeMixPreview = {
      ...baseMix,
      cover_url: null,
      preview_track: { ...basePreviewTrack, cover_image: null },
    };
    render(<CuratedMixCard mix={mix} />);
    expect(
      screen.queryByTestId("curated-mix-card-image"),
    ).not.toBeInTheDocument();
  });

  // ── Play icon state ──────────────────────────────────────

  it("shows play icon when this track is not playing", () => {
    vi.mocked(usePlayerStore).mockReturnValue(
      makeStore({ isPlaying: false, currentTrack: null }) as any,
    );
    render(<CuratedMixCard mix={baseMix} />);
    const icon = screen.getByTestId("button-play").querySelector("i");
    expect(icon?.className).toContain("fa-play");
    expect(icon?.className).not.toContain("fa-pause");
  });

  it("shows pause icon when this track is currently playing", () => {
    vi.mocked(usePlayerStore).mockReturnValue(
      makeStore({
        isPlaying: true,
        currentTrack: { id: "t-001" },
      }) as any,
    );
    render(<CuratedMixCard mix={baseMix} />);
    const icon = screen.getByTestId("button-play").querySelector("i");
    expect(icon?.className).toContain("fa-pause");
    expect(icon?.className).not.toContain("fa-play");
  });

  it("shows play icon when a different track is playing", () => {
    vi.mocked(usePlayerStore).mockReturnValue(
      makeStore({
        isPlaying: true,
        currentTrack: { id: "other-track-id" },
      }) as any,
    );
    render(<CuratedMixCard mix={baseMix} />);
    const icon = screen.getByTestId("button-play").querySelector("i");
    expect(icon?.className).toContain("fa-play");
  });

  // ── Play interactions ────────────────────────────────────

  it("calls setTrack with the mapped preview track when not yet playing", () => {
    const setTrack = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue(
      makeStore({ currentTrack: null, setTrack }) as any,
    );
    render(<CuratedMixCard mix={baseMix} />);
    fireEvent.click(screen.getByTestId("button-play"));
    expect(setTrack).toHaveBeenCalledOnce();
    expect(setTrack).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t-001", title: "Butterfly Effect" }),
    );
  });

  it("calls togglePlay when the same track is already active", () => {
    const togglePlay = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue(
      makeStore({ currentTrack: { id: "t-001" }, togglePlay }) as any,
    );
    render(<CuratedMixCard mix={baseMix} />);
    fireEvent.click(screen.getByTestId("button-play"));
    expect(togglePlay).toHaveBeenCalledOnce();
  });

  it("does not call setTrack when togglePlay is expected", () => {
    const setTrack = vi.fn();
    const togglePlay = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue(
      makeStore({ currentTrack: { id: "t-001" }, setTrack, togglePlay }) as any,
    );
    render(<CuratedMixCard mix={baseMix} />);
    fireEvent.click(screen.getByTestId("button-play"));
    expect(setTrack).not.toHaveBeenCalled();
  });

  it("stops propagation on play button click", () => {
    const parentClickSpy = vi.fn();
    render(
      <div onClick={parentClickSpy}>
        <CuratedMixCard mix={baseMix} />
      </div>,
    );
    fireEvent.click(screen.getByTestId("button-play"));
    expect(parentClickSpy).not.toHaveBeenCalled();
  });

  // ── Custom width ─────────────────────────────────────────

  it("applies a custom widthClassName when provided", () => {
    render(<CuratedMixCard mix={baseMix} widthClassName="w-48" />);
    expect(
      screen.getByTestId("curated-mix-card-mix_custom_aaa-001"),
    ).toHaveClass("w-48");
  });

  it("applies the default width class when widthClassName is omitted", () => {
    render(<CuratedMixCard mix={baseMix} />);
    expect(
      screen.getByTestId("curated-mix-card-mix_custom_aaa-001"),
    ).toHaveClass("w-[110px]");
  });
});
