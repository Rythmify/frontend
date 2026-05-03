import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TrackToolbar } from "../TrackToolbar";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  mockNavigate.mockClear();
});

const defaultProps = {
  search: "",
  onSearchChange: vi.fn(),
  filter: "Public" as const,
  onFilterChange: vi.fn(),
  trackCount: 5,
};

describe("TrackToolbar", () => {
  it("renders the toolbar actions area", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("track-toolbar-actions")).toBeInTheDocument();
  });

  it("renders Upload or drop tracks button", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} />
      </MemoryRouter>,
    );
    expect(
      screen.getByTestId("toolbar-action-upload-or-drop-tracks"),
    ).toBeInTheDocument();
  });

  it("renders Distribute tracks button", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("toolbar-action-distribute-tracks")).toBeInTheDocument();
  });

  it("renders Monetize tracks button", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("toolbar-action-monetize-tracks")).toBeInTheDocument();
  });

  it("navigates to /upload when Upload button is clicked", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("toolbar-action-upload-or-drop-tracks"));
    expect(mockNavigate).toHaveBeenCalledWith("/upload");
  });

  it("navigates to /artists/distribution when Distribute is clicked", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("toolbar-action-distribute-tracks"));
    expect(mockNavigate).toHaveBeenCalledWith("/artists/distribution");
  });

  it("navigates to /premium when Monetize is clicked", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("toolbar-action-monetize-tracks"));
    expect(mockNavigate).toHaveBeenCalledWith("/premium");
  });

  it("renders the search input", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("track-search-input")).toBeInTheDocument();
  });

  it("calls onSearchChange when search input changes", () => {
    const onSearchChange = vi.fn();
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} onSearchChange={onSearchChange} />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("track-search-input"), {
      target: { value: "hello" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("hello");
  });

  it("renders the visibility filter tabs", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("track-visibility-filter")).toBeInTheDocument();
    expect(screen.getByTestId("filter-public")).toBeInTheDocument();
    expect(screen.getByTestId("filter-private")).toBeInTheDocument();
  });

  it("calls onFilterChange with 'Private' when Private filter is clicked", () => {
    const onFilterChange = vi.fn();
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("filter-private"));
    expect(onFilterChange).toHaveBeenCalledWith("Private");
  });

  it("calls onFilterChange with 'Public' when Public filter is clicked", () => {
    const onFilterChange = vi.fn();
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} filter="Private" onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("filter-public"));
    expect(onFilterChange).toHaveBeenCalledWith("Public");
  });

  it("renders the track count", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} trackCount={7} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("track-count")).toHaveTextContent("7 tracks");
  });

  it("renders singular 'track' for count of 1", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} trackCount={1} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("track-count")).toHaveTextContent("1 track");
  });

  it("renders the sort by date button", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("sort-by-date-btn")).toBeInTheDocument();
  });

  it("shows current search value in input", () => {
    render(
      <MemoryRouter>
        <TrackToolbar {...defaultProps} search="rock" />
      </MemoryRouter>,
    );
    const input = screen.getByTestId("track-search-input") as HTMLInputElement;
    expect(input.value).toBe("rock");
  });
});
