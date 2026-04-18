import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GenreCard from "./GenreCard";

const mockTogglePlaylist = vi.fn();
const mockIsPlaylistLiked = vi.fn();

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(),
}));

import { useLikesStore } from "@/stores/likes.store";

const mockItem = {
  id: "genre-hip-hop-0001",
  genre: "Hip-Hop",
  cover_image: "https://example.com/hiphop.jpg",
  track_count: 123,
};

describe("GenreCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLikesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isPlaylistLiked: mockIsPlaylistLiked,
      togglePlaylist: mockTogglePlaylist,
    });
  });

  it("renders cover image, genre title, and track count", () => {
    mockIsPlaylistLiked.mockReturnValue(false);

    render(<GenreCard item={mockItem} index={1} />);

    const img = screen.getByRole("img", { name: mockItem.genre });
    expect(img).toHaveAttribute("src", mockItem.cover_image);
    expect(img).toHaveAttribute("alt", mockItem.genre);

    expect(screen.getByText(mockItem.genre)).toBeInTheDocument();
    expect(
      screen.getByText(`${mockItem.track_count} tracks`),
    ).toBeInTheDocument();
  });

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

  it("calls togglePlaylist when the like button is clicked", () => {
    mockIsPlaylistLiked.mockReturnValue(false);

    render(<GenreCard item={mockItem} index={3} />);

    fireEvent.click(screen.getByTestId(`button-like-genre-${mockItem.id}`));

    expect(mockTogglePlaylist).toHaveBeenCalledWith({
      id: mockItem.id,
      title: mockItem.genre,
      owner: `${mockItem.track_count} tracks`,
      coverUrl: mockItem.cover_image,
    });
  });
});
