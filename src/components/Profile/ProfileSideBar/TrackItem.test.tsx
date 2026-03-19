import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TrackItem from "@/components/Profile/ProfileSideBar/TrackItem";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const defaultProps = {
  id: "1",
  title: "SICKO MODE",
  artist: "Travis Scott",
  coverUrl: "https://example.com/cover.jpg",
  plays: 120000000,
  likes: 2500000,
  reposts: 150000,
  comments: 15000,
  onUnlike: vi.fn(),
};

describe("TrackItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders artist and title", () => {
    render(<TrackItem {...defaultProps} />);
    expect(screen.getByText("Travis Scott")).toBeInTheDocument();
    expect(screen.getByText("SICKO MODE")).toBeInTheDocument();
  });

  it("renders cover image when coverUrl is provided", () => {
    render(<TrackItem {...defaultProps} />);
    const img = screen.getByAltText("SICKO MODE");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("renders stats correctly", () => {
    render(<TrackItem {...defaultProps} />);
    expect(screen.getByText("120.0M")).toBeInTheDocument();
    expect(screen.getByText("2.5M")).toBeInTheDocument();
    expect(screen.getByText("150.0K")).toBeInTheDocument();
    expect(screen.getByText("15,000")).toBeInTheDocument();
  });

  it("shows like and more buttons on hover", () => {
    render(<TrackItem {...defaultProps} />);
    const container = screen.getByText("SICKO MODE").closest(".relative");
    fireEvent.mouseEnter(container!);
    expect(screen.getByText("")).toBeDefined(); // heart icon appears
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(2);
  });

  it("hides like and more buttons on mouse leave", () => {
    render(<TrackItem {...defaultProps} />);
    const container = screen.getByText("SICKO MODE").closest(".relative");
    fireEvent.mouseEnter(container!);
    fireEvent.mouseLeave(container!);
    // after leave, no heart/ellipsis button in hover area
    const heartButtons = screen.queryAllByRole("button");
    // only artist, title, comments buttons remain (no hover buttons)
    expect(heartButtons.length).toBeLessThanOrEqual(3);
  });

  it("calls onUnlike when heart is clicked while liked", () => {
    const onUnlike = vi.fn();
    render(<TrackItem {...defaultProps} onUnlike={onUnlike} />);
    const container = screen.getByText("SICKO MODE").closest(".relative");
    fireEvent.mouseEnter(container!);
    // find the heart button (first button in hover area)
    const allButtons = screen.getAllByRole("button");
    const heartButton = allButtons.find((b) => b.querySelector(".fa-heart"));
    fireEvent.click(heartButton!);
    expect(onUnlike).toHaveBeenCalledWith("1");
  });

  it("navigates to artist page when artist name is clicked", () => {
    render(<TrackItem {...defaultProps} />);
    fireEvent.click(screen.getByText("Travis Scott"));
    expect(mockNavigate).toHaveBeenCalledWith("/travis-scott");
  });

  it("navigates to track page when title is clicked", () => {
    render(<TrackItem {...defaultProps} />);
    fireEvent.click(screen.getByText("SICKO MODE"));
    expect(mockNavigate).toHaveBeenCalledWith("/travis-scott/sicko-mode");
  });

  it("navigates to track page when comments is clicked", () => {
    render(<TrackItem {...defaultProps} />);
    fireEvent.click(screen.getByText("15,000"));
    expect(mockNavigate).toHaveBeenCalledWith("/travis-scott/sicko-mode");
  });

  it("shows more menu when ellipsis button is clicked", () => {
    render(<TrackItem {...defaultProps} />);
    const container = screen.getByText("SICKO MODE").closest(".relative");
    fireEvent.mouseEnter(container!);
    const allButtons = screen.getAllByRole("button");
    const moreButton = allButtons.find((b) => b.querySelector(".fa-ellipsis"));
    fireEvent.click(moreButton!);
    expect(screen.getByText("Repost")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
    expect(screen.getByText("Add to Playlist")).toBeInTheDocument();
    expect(screen.getByText("Station")).toBeInTheDocument();
  });

  it("renders without optional props", () => {
    render(<TrackItem id="2" title="Test" artist="Artist" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
  });
});
