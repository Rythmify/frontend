import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GenreDropdown from "./GenreDropdown";

const getGenresMock = vi.fn();

vi.mock("@/services/api/upload/track.service", () => ({
  getGenres: () => getGenresMock(),
}));

describe("GenreDropdown", () => {
  it("renders genres returned by the API", async () => {
    getGenresMock.mockResolvedValueOnce(["Rock", "Pop"]);

    render(<GenreDropdown value="" onChange={vi.fn()} />);

    fireEvent.focus(screen.getByTestId("dropdown-input"));

    await waitFor(() => {
      expect(screen.getByText("Rock")).toBeInTheDocument();
      expect(screen.getByText("Pop")).toBeInTheDocument();
    });
  });

  it("shows no results when the API returns an empty list", async () => {
    getGenresMock.mockResolvedValueOnce([]);

    render(<GenreDropdown value="" onChange={vi.fn()} />);

    fireEvent.focus(screen.getByTestId("dropdown-input"));

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });
});
