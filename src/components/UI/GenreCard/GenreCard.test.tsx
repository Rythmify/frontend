import React from "react";
import { render, screen, fireEvent, configure } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GenreCard from "./GenreCard";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import { useAuthStore } from "@/stores/auth.store";

configure({ testIdAttribute: "data-test" });

// ─── Mocks ────────────────────────────────────────────────

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("@/stores/likes.store", () => ({ useLikesStore: vi.fn() }));
vi.mock("@/stores/history.store", () => ({ useHistoryStore: vi.fn() }));
vi.mock("@/stores/auth.store", () => ({
  useAuthStore: Object.assign(vi.fn(), {
    subscribe: vi.fn(),
    getState: vi.fn(() => ({})),
    setState: vi.fn(),
  }),
}));
vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn(() => ({
    setTrack: vi.fn(),
    currentTrack: null,
    isPlaying: false,
    togglePlay: vi.fn(),
  })),
}));
vi.mock("@heroui/react", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ─── Fixtures ─────────────────────────────────────────────

const mockItem = {
  id: "genre-hip-hop-0001",
  genre: "Hip-Hop",
  cover_image: "https://example.com/hiphop.jpg",
  track_count: 123,
  previewTrack: {
    id: "track-1",
    title: "Track 1",
    artistName: "Artist 1",
    artistUsername: "artist1",
    coverUrl: "https://example.com/cover1.jpg",
    genre: "Hip-Hop",
    likeCount: 10,
    repostCount: 5,
    playCount: 100,
    commentCount: 2,
    duration: "3:00",
    postedAt: "1 day ago",
    waveformData: [],
    audioUrl: "https://example.com/audio1.mp3",
    trackSlug: "track-1",
  },
};

const mockToggleGenre = vi.fn();
const mockIsGenreLiked = vi.fn();
const mockAddGenre = vi.fn();

const renderCard = (props: any = {}) =>
  render(
    <MemoryRouter>
      <GenreCard item={mockItem} {...props} />
    </MemoryRouter>,
  );

// ─── Tests ────────────────────────────────────────────────

describe("GenreCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLikesStore).mockReturnValue({
      isGenreLiked: mockIsGenreLiked,
      toggleGenre: mockToggleGenre,
    } as any);
    vi.mocked(useHistoryStore).mockReturnValue({
      addGenre: mockAddGenre,
    } as any);
    mockIsGenreLiked.mockReturnValue(false);
  });

  // ── Rendering ───────────────────────────────────────────

  it("renders the card container with correct data-test", () => {
    renderCard();
    expect(screen.getByTestId(`genre-card-${mockItem.id}`)).toBeInTheDocument();
  });

  it("renders the cover image with correct src and alt", () => {
    renderCard();
    const img = screen.getByTestId("genre-card-image");
    expect(img).toHaveAttribute("src", mockItem.cover_image);
    expect(img).toHaveAttribute("alt", mockItem.genre);
  });

  it("does not render image when cover_image is null", () => {
    renderCard({ item: { ...mockItem, cover_image: null } });
    expect(screen.queryByTestId("genre-card-image")).not.toBeInTheDocument();
  });

  it("renders the genre badge with the genre name", () => {
    renderCard();
    expect(screen.getByTestId("genre-card-badge")).toHaveTextContent("Hip-Hop");
  });

  it("renders the play button", () => {
    renderCard();
    expect(screen.getByTestId("button-play")).toBeInTheDocument();
  });

  // ── Like state ───────────────────────────────────────────

  it("renders the unliked heart icon when playlist is not liked", () => {
    mockIsGenreLiked.mockReturnValue(false);
    renderCard({ index: 2 });
    const icon = screen.getByTestId("button-like").querySelector("i");
    expect(icon).toHaveClass("fa-solid");
    expect(icon).toHaveClass("fa-heart");
  });

  it("renders the liked heart icon when playlist is liked", () => {
    mockIsGenreLiked.mockReturnValue(true);
    renderCard({ index: 0 });
    const icon = screen.getByTestId("button-like").querySelector("i");
    expect(icon).toHaveClass("fa-solid");
    expect(icon).toHaveClass("fa-heart");
  });

  // ── Like interaction ─────────────────────────────────────

  it("calls toggleGenre with correct args when like button is clicked", () => {
    vi.mocked(useAuthStore).mockReturnValue(true as any); // Mock authenticated
    renderCard({ index: 3 });
    fireEvent.click(screen.getByTestId("button-like"));
    expect(mockToggleGenre).toHaveBeenCalledWith({
      id: mockItem.id,
      genre: mockItem.genre,
      cover_image: mockItem.cover_image,
    });
  });

  it("stops propagation when like button is clicked", () => {
    const parentClick = vi.fn();
    render(
      <MemoryRouter>
        <div onClick={parentClick}>
          <GenreCard item={mockItem} />
        </div>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("button-like"));
    expect(parentClick).not.toHaveBeenCalled();
  });

  // ── Play interaction ─────────────────────────────────────

  it("calls addGenre when play button is clicked", () => {
    renderCard();
    fireEvent.click(screen.getByTestId("button-play"));
    expect(mockAddGenre).toHaveBeenCalledWith(mockItem);
  });

  it("stops propagation when play button is clicked", () => {
    const parentClick = vi.fn();
    render(
      <MemoryRouter>
        <div onClick={parentClick}>
          <GenreCard item={mockItem} />
        </div>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("button-play"));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
