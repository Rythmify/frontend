import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TrackCard from "./Card";

// ─── Mock Setup ───────────────────────────────────────────
const mockNavigate = vi.fn();
const mockSetTrack = vi.fn();
const mockTogglePlay = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@heroui/react", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn(),
}));

import { usePlayerStore } from "@/stores/player.store";

const mockTrack = {
  id: 1,
  title: "Butterfly Effect",
  artistName: "Travis Scott",
  artistUsername: "travisscott",
  trackSlug: "butterfly-effect",
  coverUrl: "https://example.com/cover.jpg",
  genre: "Hip-Hop",
  likeCount: 2543,
  repostCount: 845,
  playCount: 15230,
  commentCount: 234,
  duration: "3:45",
  postedAt: "2026-03-02T10:00:00Z",
  waveformData: [],
  audioUrl: "https://example.com/audio/track1.mp3",
  isPrivate: false,
};

const defaultStore = {
  currentTrack: null,
  isPlaying: false,
  setTrack: mockSetTrack,
  togglePlay: mockTogglePlay,
};

// ─── Test Suite ───────────────────────────────────────────
describe("TrackCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePlayerStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      defaultStore,
    );
  });

  it("renders cover image with correct src and alt", () => {
    render(<TrackCard track={mockTrack} />);
    const img = screen.getByTestId("trackcard-image");
    expect(img).toHaveAttribute("src", mockTrack.coverUrl);
    expect(img).toHaveAttribute("alt", mockTrack.title);
  });

  it("renders track title", () => {
    render(<TrackCard track={mockTrack} />);
    expect(screen.getByTestId("trackcard-title")).toHaveTextContent(
      mockTrack.title,
    );
  });

  it("renders artist name", () => {
    render(<TrackCard track={mockTrack} />);
    expect(screen.getByTestId("trackcard-artist")).toHaveTextContent(
      mockTrack.artistName,
    );
  });

  it("navigates to track page when card is clicked", () => {
    render(<TrackCard track={mockTrack} />);
    fireEvent.click(screen.getByTestId("card-track"));
    expect(mockNavigate).toHaveBeenCalledWith(
      `/${mockTrack.artistUsername}/${mockTrack.trackSlug}`,
    );
  });

  it("shows play icon when track is not playing", () => {
    render(<TrackCard track={mockTrack} />);
    const icon = screen.getByTestId("button-play").querySelector("i");
    expect(icon?.className).toContain("fa-play");
  });

  it("shows pause icon when this track is currently playing", () => {
    (usePlayerStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultStore,
      currentTrack: mockTrack,
      isPlaying: true,
    });
    render(<TrackCard track={mockTrack} />);
    const icon = screen.getByTestId("button-play").querySelector("i");
    expect(icon?.className).toContain("fa-pause");
  });

  it("calls setTrack when play is clicked on a different track", () => {
    render(<TrackCard track={mockTrack} />);
    fireEvent.click(screen.getByTestId("button-play"));
    expect(mockSetTrack).toHaveBeenCalledWith(mockTrack);
    expect(mockTogglePlay).not.toHaveBeenCalled();
  });

  it("calls togglePlay when play is clicked on the current track", () => {
    (usePlayerStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultStore,
      currentTrack: mockTrack,
      isPlaying: true,
    });
    render(<TrackCard track={mockTrack} />);
    fireEvent.click(screen.getByTestId("button-play"));
    expect(mockTogglePlay).toHaveBeenCalled();
    expect(mockSetTrack).not.toHaveBeenCalled();
  });

  it("play button click does not navigate", () => {
    render(<TrackCard track={mockTrack} />);
    fireEvent.click(screen.getByTestId("button-play"));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("like button toggles liked state", () => {
    render(<TrackCard track={mockTrack} />);
    const likeBtn = screen.getByTestId("button-like");
    const icon = likeBtn.querySelector("i");

    // Initially not liked — uses actionIcon (no text-red-500)
    expect(icon?.className).not.toContain("text-red-500");

    fireEvent.click(likeBtn);

    // After click — liked state → actionIconActive (text-red-500)
    expect(icon?.className).toContain("text-red-500");
  });

  it("like button click does not navigate", () => {
    render(<TrackCard track={mockTrack} />);
    fireEvent.click(screen.getByTestId("button-like"));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("more button click does not navigate", () => {
    render(<TrackCard track={mockTrack} />);
    fireEvent.click(screen.getByTestId("button-more"));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
