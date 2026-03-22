// src/components/common/TrackListSection.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TrackListSection from "./TrackListSection";

// ─── Mock Setup ───────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// ─── Test Suite ───────────────────────────────────────────
describe("TrackListSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title correctly", () => {
    // ARRANGE: Set up the component with props
    render(
      <TrackListSection title="3 LIKES" viewAllLink="/you/likes">
        <div>Mock Track</div>
      </TrackListSection>,
    );

    // ASSERT: Check that the title appears in the document
    expect(screen.getByTestId("track-list-section-title")).toHaveTextContent(
      "3 LIKES",
    );
  });

  it("renders children correctly", () => {
    // ARRANGE: Render with multiple children
    render(
      <TrackListSection title="LISTENING HISTORY" viewAllLink="/you/history">
        <div data-testid="child-1">Track 1</div>
        <div data-testid="child-2">Track 2</div>
      </TrackListSection>,
    );

    // ASSERT: Check both children are rendered
    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  it("renders 'View all' button", () => {
    // ARRANGE
    render(
      <TrackListSection title="3 LIKES" viewAllLink="/you/likes">
        <div>Mock Track</div>
      </TrackListSection>,
    );

    // ASSERT
    expect(screen.getByTestId("track-list-section-view-all")).toHaveTextContent(
      "View all",
    );
  });

  it("navigates to viewAllLink when title is clicked", () => {
    // ARRANGE
    render(
      <TrackListSection title="3 LIKES" viewAllLink="/you/likes">
        <div>Mock Track</div>
      </TrackListSection>,
    );

    // ACT: Simulate clicking the title
    fireEvent.click(screen.getByTestId("track-list-section-title"));

    // ASSERT: Check navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/you/likes");
  });

  it("navigates to viewAllLink when 'View all' is clicked", () => {
    // ARRANGE
    render(
      <TrackListSection title="3 LIKES" viewAllLink="/you/likes">
        <div>Mock Track</div>
      </TrackListSection>,
    );

    // ACT: Simulate clicking "View all"
    fireEvent.click(screen.getByTestId("track-list-section-view-all"));

    // ASSERT: Check navigate was called
    expect(mockNavigate).toHaveBeenCalledWith("/you/likes");
  });

  it("applies correct container styles", () => {
    // ARRANGE
    render(
      <TrackListSection title="3 LIKES" viewAllLink="/you/likes">
        <div>Mock Track</div>
      </TrackListSection>,
    );

    // ASSERT: Check CSS classes are applied
    const container = screen.getByTestId("track-list-section");
    expect(container).toHaveClass("flex", "flex-col", "gap-3", "w-full");
  });
});
