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
    render(
      <TrackListSection title="3 LIKES" viewAllLink="/you/likes">
        <div>Mock Track</div>
      </TrackListSection>,
    );

    expect(screen.getByTestId("track-list-section-title")).toHaveTextContent(
      "3 LIKES",
    );
  });

  it("renders children correctly", () => {
    render(
      <TrackListSection title="LISTENING HISTORY" viewAllLink="/you/history">
        <div>Track 1</div>
        <div>Track 2</div>
      </TrackListSection>,
    );

    expect(screen.getByText("Track 1")).toBeInTheDocument();
    expect(screen.getByText("Track 2")).toBeInTheDocument();
  });

  it("renders 'View all' button", () => {
    render(
      <TrackListSection title="3 LIKES" viewAllLink="/you/likes">
        <div>Mock Track</div>
      </TrackListSection>,
    );

    expect(screen.getByTestId("track-list-section-view-all")).toHaveTextContent(
      "View all",
    );
  });

  it("navigates to viewAllLink when title is clicked", () => {
    render(
      <TrackListSection title="3 LIKES" viewAllLink="/you/likes">
        <div>Mock Track</div>
      </TrackListSection>,
    );

    fireEvent.click(screen.getByTestId("track-list-section-title"));

    expect(mockNavigate).toHaveBeenCalledWith("/you/likes");
  });

  it("navigates to viewAllLink when 'View all' is clicked", () => {
    render(
      <TrackListSection title="3 LIKES" viewAllLink="/you/likes">
        <div>Mock Track</div>
      </TrackListSection>,
    );

    fireEvent.click(screen.getByTestId("track-list-section-view-all"));

    expect(mockNavigate).toHaveBeenCalledWith("/you/likes");
  });

  it("applies correct container styles", () => {
    render(
      <TrackListSection title="3 LIKES" viewAllLink="/you/likes">
        <div>Mock Track</div>
      </TrackListSection>,
    );

    const container = screen.getByTestId("track-list-section");
    expect(container).toHaveClass("flex", "flex-col", "gap-3", "w-full");
  });

  it("renders header section with correct structure", () => {
    render(
      <TrackListSection title="LISTENING HISTORY" viewAllLink="/you/history">
        <div>Mock Track</div>
      </TrackListSection>,
    );

    const header = screen.getByTestId("track-list-section-header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("flex", "items-center", "justify-between");
  });

  it("renders tracks container", () => {
    render(
      <TrackListSection title="3 LIKES" viewAllLink="/you/likes">
        <div>Track 1</div>
        <div>Track 2</div>
      </TrackListSection>,
    );

    const tracksContainer = screen.getByTestId("track-list-section-tracks");
    expect(tracksContainer).toBeInTheDocument();
    expect(tracksContainer).toHaveClass("flex", "flex-col", "gap-4");
  });

  it("renders component with empty tracks container when no children", () => {
    render(
      <TrackListSection title="NO TRACKS" viewAllLink="/you/likes">
        {/* No children */}
      </TrackListSection>,
    );

    expect(screen.getByTestId("track-list-section")).toBeInTheDocument();
    expect(screen.getByTestId("track-list-section-title")).toBeInTheDocument();
    expect(screen.getByTestId("track-list-section-tracks")).toBeInTheDocument();
  });

  it("handles different viewAllLink values", () => {
    render(
      <TrackListSection title="HISTORY" viewAllLink="/you/history">
        <div>Track</div>
      </TrackListSection>,
    );

    fireEvent.click(screen.getByTestId("track-list-section-view-all"));

    expect(mockNavigate).toHaveBeenCalledWith("/you/history");
  });

  it("title and view all both navigate to same link", () => {
    render(
      <TrackListSection title="TEST" viewAllLink="/test/link">
        <div>Track</div>
      </TrackListSection>,
    );

    // Click title
    fireEvent.click(screen.getByTestId("track-list-section-title"));
    expect(mockNavigate).toHaveBeenCalledWith("/test/link");

    // Reset mock
    vi.clearAllMocks();

    // Click view all
    fireEvent.click(screen.getByTestId("track-list-section-view-all"));
    expect(mockNavigate).toHaveBeenCalledWith("/test/link");
  });
});
