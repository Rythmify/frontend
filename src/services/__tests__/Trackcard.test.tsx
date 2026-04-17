import { vi, describe, it, expect, beforeEach } from "vitest";

vi.hoisted(() => {
  if (typeof window !== "undefined") {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray() })),
      putImageData: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
    }) as any;

    class MockResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    window.ResizeObserver = MockResizeObserver as any;

    Element.prototype.scrollIntoView = vi.fn();
  }
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TrackCard from "../../components/track/TrackCard";
import type { Track } from "../../types/track";
import { MemoryRouter } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

vi.mock("wavesurfer.js", () => ({
  default: {
    create: vi.fn(() => ({
      on: vi.fn(),
      destroy: vi.fn(),
      load: vi.fn(),
      setSinkId: vi.fn(),
      setVolume: vi.fn(),
    })),
  },
}));

vi.mock("../api/audioService", () => ({
  audio: {
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    src: "http://localhost/test.mp3",
  },
  seekAudio: vi.fn(),
  setGlobalWaveSurfer: vi.fn(),
  setTrackLoadedLocally: vi.fn(),
}));

vi.mock("../../services/engagement.service", () => ({
  likeTrack: vi.fn().mockResolvedValue(undefined),
  unlikeTrack: vi.fn().mockResolvedValue(undefined),
  repostTrack: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../stores/player.store", () => ({
  usePlayerStore: Object.assign(
    vi.fn((selector) => {
      const state = {
        currentTrack: null,
        isPlaying: false,
        duration: 240,
        currentTime: 0,
        setTrack: vi.fn(),
        togglePlay: vi.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    }),
    {
      subscribe: vi.fn(() => vi.fn()),
      getState: vi.fn(() => ({
        setCurrentTime: vi.fn(),
        setDuration: vi.fn(),
        next: vi.fn(),
      })),
    }
  ),
}));

vi.mock("../../stores/auth.store", () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: "user-123", username: "me", displayName: "Me" },
  })),
}));

const mockTrack: Track = {
  id: "1",
  title: "Test Track",
  artistName: "Test Artist",
  artistUsername: "test-artist",
  coverUrl: "http://example.com/cover.jpg",
  genre: "Electronic",
  likeCount: 10,
  repostCount: 5,
  playCount: 100,
  commentCount: 2,
  duration: "3:45",
  postedAt: "2 hours ago",
  waveformData: [1, 2, 3],
  audioUrl: "http://example.com/audio.mp3",
  trackSlug: "test-track",
};

describe("TrackCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "user-123", username: "me", displayName: "Me" },
    });
  });

  const renderCard = (track = mockTrack, props = {}) => {
    return render(
      <MemoryRouter>
        <TrackCard track={track} {...props} />
      </MemoryRouter>
    );
  };

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders track information correctly (Visitor)", () => {
    renderCard();
    expect(screen.getByText("Test Track")).toBeInTheDocument();
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
  });

  it("shows like and repost buttons for visitor", () => {
    renderCard();
    expect(screen.getByTestId("track-card-btn-like")).toBeInTheDocument();
    expect(screen.getByTestId("track-card-btn-repost")).toBeInTheDocument();
  });

  it("renders genre badge", () => {
    renderCard();
    expect(screen.getByTestId("track-card-genre")).toBeInTheDocument();
    expect(screen.getByTestId("track-card-genre")).toHaveTextContent("Electronic");
  });

  it("renders posted at timestamp", () => {
    renderCard();
    expect(screen.getByTestId("track-card-posted-at")).toHaveTextContent("2 hours ago");
  });

  it("renders play count", () => {
    renderCard();
    expect(screen.getByTestId("track-card-play-count")).toBeInTheDocument();
  });

  it("renders comment count", () => {
    renderCard();
    expect(screen.getByTestId("track-card-comment-count")).toBeInTheDocument();
  });

  it("renders cover image when coverUrl is provided", () => {
    renderCard();
    const cover = screen.getByAltText("Test Track");
    expect(cover).toBeInTheDocument();
    expect(cover).toHaveAttribute("src", "http://example.com/cover.jpg");
  });

  it("renders repostedBy line when repostedBy prop is provided", () => {
    renderCard(mockTrack, { repostedBy: "some-user" });
    expect(screen.getByTestId("track-card-reposted-by-link")).toBeInTheDocument();
    expect(screen.getByTestId("track-card-reposted-by-link")).toHaveTextContent("some-user");
  });

  it("does not render repostedBy line when repostedBy prop is not provided", () => {
    renderCard();
    expect(screen.queryByTestId("track-card-reposted-by-link")).not.toBeInTheDocument();
  });

  it("renders artist link with correct href", () => {
    renderCard();
    const artistLink = screen.getByTestId("track-card-artist-link");
    expect(artistLink).toHaveAttribute("href", "/test-artist");
  });

  it("renders title link with correct href", () => {
    renderCard();
    const titleLink = screen.getByTestId("track-card-title-link");
    expect(titleLink).toHaveAttribute("href", "/test-artist/test-track");
  });

  // ── Like interactions ──────────────────────────────────────────────────────

  it("optimistically updates like count when clicked", async () => {
    const { likeTrack } = await import("../../services/engagement.service");
    renderCard();

    const likeBtn = screen.getByTestId("track-card-btn-like");
    fireEvent.click(likeBtn);

    expect(likeBtn).toHaveTextContent("11");
    expect(likeTrack).toHaveBeenCalledWith(mockTrack.id);
  });

  it("reverts like count if API fails", async () => {
    const { likeTrack } = await import("../../services/engagement.service");
    vi.mocked(likeTrack).mockRejectedValueOnce(new Error("API Error"));

    renderCard();
    const likeBtn = screen.getByTestId("track-card-btn-like");

    fireEvent.click(likeBtn);
    expect(likeBtn).toHaveTextContent("11");

    await waitFor(() => {
      expect(likeBtn).toHaveTextContent("10");
    });
  });

  it("decrements like count when unliking", async () => {
    const { likeTrack, unlikeTrack } = await import("../../services/engagement.service");
    renderCard();

    const likeBtn = screen.getByTestId("track-card-btn-like");

    // Like first
    fireEvent.click(likeBtn);
    expect(likeBtn).toHaveTextContent("11");
    expect(likeTrack).toHaveBeenCalledWith(mockTrack.id);

    // Unlike
    fireEvent.click(likeBtn);
    expect(likeBtn).toHaveTextContent("10");
    expect(unlikeTrack).toHaveBeenCalledWith(mockTrack.id);
  });

  it("reverts unlike if API fails", async () => {
    const { unlikeTrack } = await import("../../services/engagement.service");

    renderCard();
    const likeBtn = screen.getByTestId("track-card-btn-like");

    // Like first (succeeds)
    fireEvent.click(likeBtn);
    await waitFor(() => expect(likeBtn).toHaveTextContent("11"));

    // Unlike fails
    vi.mocked(unlikeTrack).mockRejectedValueOnce(new Error("API Error"));
    fireEvent.click(likeBtn);
    expect(likeBtn).toHaveTextContent("10");

    await waitFor(() => {
      expect(likeBtn).toHaveTextContent("11");
    });
  });

  // ── Repost interactions ────────────────────────────────────────────────────

  it("optimistically updates repost count when clicked", async () => {
    const { repostTrack } = await import("../../services/engagement.service");
    renderCard();

    const repostBtn = screen.getByTestId("track-card-btn-repost");
    fireEvent.click(repostBtn);

    expect(repostBtn).toHaveTextContent("6");
    expect(repostTrack).toHaveBeenCalledWith(mockTrack.id);
  });

  it("reverts repost count if API fails", async () => {
    const { repostTrack } = await import("../../services/engagement.service");
    vi.mocked(repostTrack).mockRejectedValueOnce(new Error("API Error"));

    renderCard();
    const repostBtn = screen.getByTestId("track-card-btn-repost");

    fireEvent.click(repostBtn);
    expect(repostBtn).toHaveTextContent("6");

    await waitFor(() => {
      expect(repostBtn).toHaveTextContent("5");
    });
  });

  // ── Owner actions ──────────────────────────────────────────────────────────

  it("renders owner actions only when user is the artist", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "user-123", username: "test-artist", displayName: "Artist" },
    });

    renderCard();
    expect(screen.getByTestId("track-card-btn-edit")).toBeInTheDocument();
    expect(screen.getByTestId("track-card-btn-replace")).toBeInTheDocument();
    expect(screen.queryByTestId("track-card-btn-like")).not.toBeInTheDocument();
    expect(screen.queryByTestId("track-card-btn-repost")).not.toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "user-123", username: "test-artist", displayName: "Artist" },
    });
    const onEdit = vi.fn();
    renderCard(mockTrack, { onEdit });

    fireEvent.click(screen.getByTestId("track-card-btn-edit"));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("calls onReplaceFile when replace button is clicked", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "user-123", username: "test-artist", displayName: "Artist" },
    });
    const onReplaceFile = vi.fn();
    renderCard(mockTrack, { onReplaceFile });

    fireEvent.click(screen.getByTestId("track-card-btn-replace"));
    expect(onReplaceFile).toHaveBeenCalledTimes(1);
  });

  // ── Share popup ────────────────────────────────────────────────────────────

  it("opens share popup when share button is clicked", () => {
    renderCard();
    fireEvent.click(screen.getByTestId("track-card-btn-share"));
    expect(screen.getByTestId("share-popup")).toBeInTheDocument();
  });

  // ── More dropdown ──────────────────────────────────────────────────────────

  it("opens more dropdown when more button is clicked", () => {
    renderCard();
    fireEvent.click(screen.getByTestId("track-card-btn-more"));
    expect(screen.getByTestId("track-card-more-dropdown")).toBeInTheDocument();
  });

  it("closes more dropdown when clicking outside", async () => {
    renderCard();
    fireEvent.click(screen.getByTestId("track-card-btn-more"));
    expect(screen.getByTestId("track-card-more-dropdown")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByTestId("track-card-more-dropdown")).not.toBeInTheDocument();
    });
  });

  // ── Comment bar ────────────────────────────────────────────────────────────

  it("does not show comment bar initially", () => {
    renderCard();
    expect(screen.queryByTestId("track-card-comment-bar")).not.toBeInTheDocument();
  });

  it("does not show comment bar when disableComments is true", () => {
    renderCard(mockTrack, { disableComments: true });
    expect(screen.queryByTestId("track-card-comment-bar")).not.toBeInTheDocument();
  });

  // ── Stat updates on prop change ────────────────────────────────────────────

  it("updates like count when track prop changes", () => {
    const { rerender } = renderCard();
    const likeBtn = screen.getByTestId("track-card-btn-like");
    expect(likeBtn).toHaveTextContent("10");

    rerender(
      <MemoryRouter>
        <TrackCard track={{ ...mockTrack, likeCount: 99 }} />
      </MemoryRouter>
    );
    expect(likeBtn).toHaveTextContent("99");
  });

  it("updates repost count when track prop changes", () => {
    const { rerender } = renderCard();
    const repostBtn = screen.getByTestId("track-card-btn-repost");
    expect(repostBtn).toHaveTextContent("5");

    rerender(
      <MemoryRouter>
        <TrackCard track={{ ...mockTrack, repostCount: 50 }} />
      </MemoryRouter>
    );
    expect(repostBtn).toHaveTextContent("50");
  });
});