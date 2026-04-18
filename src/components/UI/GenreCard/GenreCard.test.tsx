import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GenreCard from "./GenreCard";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/stores/likes.store", () => ({ useLikesStore: vi.fn() }));
vi.mock("@/stores/history.store", () => ({ useHistoryStore: vi.fn() }));

// ─── Fixtures ─────────────────────────────────────────────

const mockItem = {
  id: "genre-hip-hop-0001",
  genre: "Hip-Hop",
  cover_image: "https://example.com/hiphop.jpg",
  track_count: 123,
};

const mockTogglePlaylist = vi.fn();
const mockIsPlaylistLiked = vi.fn();
const mockAddGenre = vi.fn();

// ─── Tests ────────────────────────────────────────────────

describe("GenreCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLikesStore).mockReturnValue({
      isPlaylistLiked: mockIsPlaylistLiked,
      togglePlaylist: mockTogglePlaylist,
    } as any);
    vi.mocked(useHistoryStore).mockReturnValue({
      addGenre: mockAddGenre,
    } as any);
    mockIsPlaylistLiked.mockReturnValue(false);
  });

  // ── Rendering ───────────────────────────────────────────

  it("renders the card container with correct data-test", () => {
    render(<GenreCard item={mockItem} />);
    expect(screen.getByTestId(`genre-card-${mockItem.id}`)).toBeInTheDocument();
  });

  it("renders the cover image with correct src and alt", () => {
    render(<GenreCard item={mockItem} />);
    const img = screen.getByTestId("genre-card-image");
    expect(img).toHaveAttribute("src", mockItem.cover_image);
    expect(img).toHaveAttribute("alt", mockItem.genre);
  });

  it("does not render image when cover_image is null", () => {
    render(<GenreCard item={{ ...mockItem, cover_image: null }} />);
    expect(screen.queryByTestId("genre-card-image")).not.toBeInTheDocument();
  });

  it("renders the genre badge with the genre name", () => {
    render(<GenreCard item={mockItem} />);
    expect(screen.getByTestId("genre-card-badge")).toHaveTextContent("Hip-Hop");
  });

  it("renders the play button", () => {
    render(<GenreCard item={mockItem} />);
    expect(screen.getByTestId("button-play")).toBeInTheDocument();
  });

  // ── Like state ───────────────────────────────────────────

  it("renders the unliked heart icon when playlist is not liked", () => {
    mockIsPlaylistLiked.mockReturnValue(false);
    render(<GenreCard item={mockItem} index={2} />);
    const icon = screen
      .getByTestId(`button-like-genre-${mockItem.id}`)
      .querySelector("i");
    expect(icon).toHaveClass("fa-regular");
    expect(icon).toHaveClass("fa-heart");
  });

  it("renders the liked heart icon when playlist is liked", () => {
    mockIsPlaylistLiked.mockReturnValue(true);
    render(<GenreCard item={mockItem} index={0} />);
    const icon = screen
      .getByTestId(`button-like-genre-${mockItem.id}`)
      .querySelector("i");
    expect(icon).toHaveClass("fa-solid");
    expect(icon).toHaveClass("fa-heart");
  });

  // ── Like interaction ─────────────────────────────────────

  it("calls togglePlaylist with correct args when like button is clicked", () => {
    render(<GenreCard item={mockItem} index={3} />);
    fireEvent.click(screen.getByTestId(`button-like-genre-${mockItem.id}`));
    expect(mockTogglePlaylist).toHaveBeenCalledWith({
      id: mockItem.id,
      title: mockItem.genre,
      owner: `${mockItem.track_count} tracks`,
      coverUrl: mockItem.cover_image,
    });
  });

  it("stops propagation when like button is clicked", () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <GenreCard item={mockItem} />
      </div>,
    );
    fireEvent.click(screen.getByTestId(`button-like-genre-${mockItem.id}`));
    expect(parentClick).not.toHaveBeenCalled();
  });

  // ── Play interaction ─────────────────────────────────────

  it("calls addGenre when play button is clicked", () => {
    render(<GenreCard item={mockItem} />);
    fireEvent.click(screen.getByTestId("button-play"));
    expect(mockAddGenre).toHaveBeenCalledWith(mockItem);
  });

  it("stops propagation when play button is clicked", () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <GenreCard item={mockItem} />
      </div>,
    );
    fireEvent.click(screen.getByTestId("button-play"));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
