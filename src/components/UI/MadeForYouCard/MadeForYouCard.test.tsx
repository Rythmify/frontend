import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MadeForYouCard, { type MadeForYouItem } from "./MadeForYouCard";
import { useLikesStore } from "@/stores/likes.store";
import { usePlayerStore } from "@/stores/player.store";
import { useHistoryStore } from "@/stores/history.store";
import type { Track } from "@/types/track";
import { useNavigate } from "react-router-dom";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/stores/likes.store", () => ({ useLikesStore: vi.fn() }));
vi.mock("@/stores/player.store", () => ({ usePlayerStore: vi.fn() }));
vi.mock("@/stores/history.store", () => ({ useHistoryStore: vi.fn() }));
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// ─── Fixtures ─────────────────────────────────────────────

const previewTrack: Track = {
  id: "t-001",
  title: "Butterfly Effect",
  artistName: "Travis Scott",
  artistUsername: "travisscott",
  coverUrl: "https://example.com/cover.jpg",
  genre: "Hip-Hop",
  likeCount: 3500,
  repostCount: 400,
  playCount: 75000,
  commentCount: 0,
  duration: "3:45",
  postedAt: "2026-01-15T00:00:00Z",
  audioUrl: "/audio/track1.mp3",
  waveformData: [],
};

const baseItem: MadeForYouItem = {
  id: "daily-drops",
  title: "Daily Drops",
  subtitle: "New releases based on your taste",
  coverUrl: "https://example.com/daily.jpg",
  madeKind: "daily",
  badgeWords: ["DAILY", "DROPS"],
  badgeBg: "#1a237e",
  previewTrack,
};

const makeStore = (overrides: Record<string, unknown> = {}) => ({
  isPlaying: false,
  currentTrack: null,
  setTrack: vi.fn(),
  togglePlay: vi.fn(),
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────

describe("MadeForYouCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(vi.fn());
    vi.mocked(usePlayerStore).mockReturnValue(makeStore() as any);
    vi.mocked(useLikesStore).mockReturnValue({
      isMixLiked: vi.fn().mockReturnValue(false),
      toggleMix: vi.fn(),
    } as any);
    vi.mocked(useHistoryStore).mockReturnValue({
      addMadeForYou: vi.fn(),
    } as any);
  });

  // ── Rendering ───────────────────────────────────────────

  it("renders the card container with the correct item id", () => {
    render(<MadeForYouCard item={baseItem} />);
    expect(
      screen.getByTestId("made-for-you-card-daily-drops"),
    ).toBeInTheDocument();
  });

  it("renders the cover image with correct src and alt", () => {
    render(<MadeForYouCard item={baseItem} />);
    const img = screen.getByTestId("made-for-you-card-image");
    expect(img).toHaveAttribute("src", baseItem.coverUrl);
    expect(img).toHaveAttribute("alt", baseItem.title);
  });

  it("renders both badge words", () => {
    render(<MadeForYouCard item={baseItem} />);
    const badge = screen.getByTestId("made-for-you-card-badge");
    expect(badge).toHaveTextContent("DAILY");
    expect(badge).toHaveTextContent("DROPS");
  });

  it("renders the title", () => {
    render(<MadeForYouCard item={baseItem} />);
    expect(screen.getByTestId("made-for-you-card-title")).toHaveTextContent(
      "Daily Drops",
    );
  });

  it("renders the subtitle", () => {
    render(<MadeForYouCard item={baseItem} />);
    expect(screen.getByTestId("made-for-you-card-subtitle")).toHaveTextContent(
      "New releases based on your taste",
    );
  });

  it("navigates to the made for you slug page when clicked", () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigate);

    render(<MadeForYouCard item={baseItem} />);
    fireEvent.click(screen.getByTestId("made-for-you-card-daily-drops"));

    expect(navigate).toHaveBeenCalledWith(
      "/discover/sets/new-for-you/daily/daily-drops",
    );
  });

  it("renders the play, like, and more buttons", () => {
    render(<MadeForYouCard item={baseItem} />);
    expect(screen.getByTestId("button-play")).toBeInTheDocument();
    expect(screen.getByTestId("button-like")).toBeInTheDocument();
    expect(screen.getByTestId("button-more")).toBeInTheDocument();
  });

  // ── Badge background ─────────────────────────────────────

  it("applies the provided badgeBg color", () => {
    render(<MadeForYouCard item={{ ...baseItem, badgeBg: "#ff0000" }} />);
    expect(screen.getByTestId("made-for-you-card-badge")).toHaveStyle({
      backgroundColor: "#ff0000",
    });
  });

  it("defaults badge background to #1a237e when badgeBg is omitted", () => {
    const { badgeBg: _, ...itemWithoutBg } = baseItem;
    render(<MadeForYouCard item={itemWithoutBg} />);
    expect(screen.getByTestId("made-for-you-card-badge")).toHaveStyle({
      backgroundColor: "#1a237e",
    });
  });

  // ── Play icon state ──────────────────────────────────────

  it("shows play icon when this track is not playing", () => {
    vi.mocked(usePlayerStore).mockReturnValue(
      makeStore({ isPlaying: false, currentTrack: null }) as any,
    );
    render(<MadeForYouCard item={baseItem} />);
    const icon = screen.getByTestId("button-play").querySelector("i");
    expect(icon?.className).toContain("fa-play");
    expect(icon?.className).not.toContain("fa-pause");
  });

  it("shows pause icon when this track is currently playing", () => {
    vi.mocked(usePlayerStore).mockReturnValue(
      makeStore({ isPlaying: true, currentTrack: { id: "t-001" } }) as any,
    );
    render(<MadeForYouCard item={baseItem} />);
    const icon = screen.getByTestId("button-play").querySelector("i");
    expect(icon?.className).toContain("fa-pause");
    expect(icon?.className).not.toContain("fa-play");
  });

  it("shows play icon when a different track is playing", () => {
    vi.mocked(usePlayerStore).mockReturnValue(
      makeStore({
        isPlaying: true,
        currentTrack: { id: "other-track" },
      }) as any,
    );
    render(<MadeForYouCard item={baseItem} />);
    const icon = screen.getByTestId("button-play").querySelector("i");
    expect(icon?.className).toContain("fa-play");
  });

  // ── Play interactions ────────────────────────────────────

  it("calls setTrack and addMadeForYou when play is clicked on a new track", () => {
    const setTrack = vi.fn();
    const addMadeForYou = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue(
      makeStore({ currentTrack: null, setTrack }) as any,
    );
    vi.mocked(useHistoryStore).mockReturnValue({ addMadeForYou } as any);

    render(<MadeForYouCard item={baseItem} />);
    fireEvent.click(screen.getByTestId("button-play"));

    expect(setTrack).toHaveBeenCalledOnce();
    expect(setTrack).toHaveBeenCalledWith(previewTrack);
    expect(addMadeForYou).toHaveBeenCalledOnce();
    expect(addMadeForYou).toHaveBeenCalledWith(baseItem);
  });

  it("calls togglePlay instead of setTrack when the same track is active", () => {
    const setTrack = vi.fn();
    const togglePlay = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue(
      makeStore({ currentTrack: { id: "t-001" }, setTrack, togglePlay }) as any,
    );

    render(<MadeForYouCard item={baseItem} />);
    fireEvent.click(screen.getByTestId("button-play"));

    expect(togglePlay).toHaveBeenCalledOnce();
    expect(setTrack).not.toHaveBeenCalled();
  });

  it("does not call setTrack or addMadeForYou when previewTrack is absent", () => {
    const setTrack = vi.fn();
    const addMadeForYou = vi.fn();
    vi.mocked(usePlayerStore).mockReturnValue(makeStore({ setTrack }) as any);
    vi.mocked(useHistoryStore).mockReturnValue({ addMadeForYou } as any);

    const { previewTrack: _, ...itemWithoutTrack } = baseItem;
    render(<MadeForYouCard item={itemWithoutTrack} />);
    fireEvent.click(screen.getByTestId("button-play"));

    expect(setTrack).not.toHaveBeenCalled();
    expect(addMadeForYou).not.toHaveBeenCalled();
  });

  it("stops propagation when play button is clicked", () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <MadeForYouCard item={baseItem} />
      </div>,
    );
    fireEvent.click(screen.getByTestId("button-play"));
    expect(parentClick).not.toHaveBeenCalled();
  });

  // ── Like interactions ────────────────────────────────────

  it("shows white heart when item is not liked", () => {
    vi.mocked(useLikesStore).mockReturnValue({
      isMixLiked: vi.fn().mockReturnValue(false),
      toggleMix: vi.fn(),
    } as any);
    render(<MadeForYouCard item={baseItem} />);
    const icon = screen.getByTestId("button-like").querySelector("i");
    expect(icon?.className).toContain("fa-solid");
    expect(icon?.className).toContain("fa-heart");
    expect(icon?.className).toContain("text-white");
    expect(icon?.className).not.toContain("text-[#e74c3c]");
  });

  it("shows red heart when item is liked", () => {
    vi.mocked(useLikesStore).mockReturnValue({
      isMixLiked: vi.fn().mockReturnValue(true),
      toggleMix: vi.fn(),
    } as any);
    render(<MadeForYouCard item={baseItem} />);
    const icon = screen.getByTestId("button-like").querySelector("i");
    expect(icon?.className).toContain("fa-solid");
    expect(icon?.className).toContain("fa-heart");
    expect(icon?.className).toContain("text-[#e74c3c]");
  });

  it("calls toggleMix with correct args when like is clicked", () => {
    const toggleMix = vi.fn();
    vi.mocked(useLikesStore).mockReturnValue({
      isMixLiked: vi.fn().mockReturnValue(false),
      toggleMix,
    } as any);

    render(<MadeForYouCard item={baseItem} />);
    fireEvent.click(screen.getByTestId("button-like"));

    expect(toggleMix).toHaveBeenCalledWith({
      id: baseItem.id,
      title: baseItem.title,
      cover_image: baseItem.coverUrl,
      link_to: `/discover/sets/new-for-you/${baseItem.madeKind}/${baseItem.id}`,
      kind: baseItem.madeKind,
    });
  });

  it("stops propagation when like button is clicked", () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <MadeForYouCard item={baseItem} />
      </div>,
    );
    fireEvent.click(screen.getByTestId("button-like"));
    expect(parentClick).not.toHaveBeenCalled();
  });

  // ── Custom width ─────────────────────────────────────────

  it("applies a custom widthClassName when provided", () => {
    render(<MadeForYouCard item={baseItem} widthClassName="w-48" />);
    expect(screen.getByTestId("made-for-you-card-daily-drops")).toHaveClass(
      "w-48",
    );
  });

  it("applies the default width class when widthClassName is omitted", () => {
    render(<MadeForYouCard item={baseItem} />);
    expect(screen.getByTestId("made-for-you-card-daily-drops")).toHaveClass(
      "w-[110px]",
    );
  });
});
