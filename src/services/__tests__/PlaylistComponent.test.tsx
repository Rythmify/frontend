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
import PlaylistComponent from "../../components/playlist/PlaylistComponent";
import { MemoryRouter } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

vi.mock("wavesurfer.js", () => ({
  default: {
    create: vi.fn(() => ({
      on: vi.fn(),
      destroy: vi.fn(),
      load: vi.fn(),
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
  likePlaylist: vi.fn().mockResolvedValue(undefined),
  unlikePlaylist: vi.fn().mockResolvedValue(undefined),
  repostPlaylist: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../stores/player.store", () => ({
  usePlayerStore: Object.assign(
    vi.fn(() => ({
      currentTrack: null,
      isPlaying: false,
      setTrack: vi.fn(),
      togglePlay: vi.fn(),
    })),
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
    user: { id: "user-123", username: "me" },
  })),
}));

const mockPlaylist = {
  id: 1,
  title: "Test Playlist",
  playlistSlug: "test-playlist",
  creatorName: "Test Creator",
  creatorUsername: "test-creator",
  coverUrl: "http://example.com/cover.jpg",
  trackCount: 2,
  isPrivate: false,
  likeCount: 50,
  repostCount: 20,
  postedAt: "3 days ago",
  tracks: [
    { id: 101, title: "Track 1", artistName: "A1", duration: "3:00", playCount: 500, coverUrl: "", audioUrl: "", waveformData: [] },
    { id: 102, title: "Track 2", artistName: "A2", duration: "4:00", playCount: 300, coverUrl: "", audioUrl: "", waveformData: [] },
  ],
};

describe("PlaylistComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComp = (playlist = mockPlaylist, props = {}) => {
    return render(
      <MemoryRouter>
        <PlaylistComponent playlist={playlist as any} {...props} />
      </MemoryRouter>
    );
  };

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders playlist title and creator", () => {
    renderComp();
    expect(screen.getByText("Test Playlist")).toBeInTheDocument();
    expect(screen.getByText("Test Creator")).toBeInTheDocument();
  });

  it("renders posted at timestamp", () => {
    renderComp();
    expect(screen.getByTestId("playlist-component-posted-at")).toHaveTextContent("3 days ago");
  });

  it("renders track count badge", () => {
    renderComp();
    expect(screen.getByTestId("playlist-component-track-count")).toHaveTextContent("2 tracks");
  });

  it("renders cover image when coverUrl is provided", () => {
    renderComp();
    const cover = screen.getByAltText("Test Playlist");
    expect(cover).toBeInTheDocument();
    expect(cover).toHaveAttribute("src", "http://example.com/cover.jpg");
  });

  it("renders creator link with correct href", () => {
    renderComp();
    expect(screen.getByTestId("playlist-component-creator-link")).toHaveAttribute("href", "/test-creator");
  });

  it("renders title link with correct href", () => {
    renderComp();
    expect(screen.getByTestId("playlist-component-title-link")).toHaveAttribute(
      "href",
      "/test-creator/sets/test-playlist"
    );
  });

  it("renders track list", () => {
    renderComp();
    expect(screen.getByTestId("playlist-component-track-list")).toBeInTheDocument();
    expect(screen.getByTestId("playlist-component-track-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("playlist-component-track-row-1")).toBeInTheDocument();
  });

  it("renders total plays stat", () => {
    renderComp();
    expect(screen.getByTestId("playlist-component-total-plays")).toBeInTheDocument();
    // 500 + 300 = 800
    expect(screen.getByTestId("playlist-component-total-plays")).toHaveTextContent("800");
  });

  it("shows repostedBy line when repostedBy prop is provided", () => {
    renderComp(mockPlaylist, { repostedBy: "some-user" });
    expect(screen.getByTestId("playlist-component-reposted-by-link")).toBeInTheDocument();
    expect(screen.getByTestId("playlist-component-reposted-by-link")).toHaveTextContent("some-user");
  });

  it("does not show repostedBy line when repostedBy is not provided", () => {
    renderComp();
    expect(screen.queryByTestId("playlist-component-reposted-by-link")).not.toBeInTheDocument();
  });

  it("shows number of tracks when more than 5 tracks exist", () => {
    renderComp({ ...mockPlaylist, trackCount: 10 } as any);
    expect(screen.getByText("View all 10 tracks →")).toBeInTheDocument();
  });

  it("does not show view all link when trackCount is 5 or fewer", () => {
    renderComp({ ...mockPlaylist, trackCount: 5 } as any);
    expect(screen.queryByTestId("playlist-component-view-all-link")).not.toBeInTheDocument();
  });

  it("view all link points to correct href", () => {
    renderComp({ ...mockPlaylist, trackCount: 10 } as any);
    expect(screen.getByTestId("playlist-component-view-all-link")).toHaveAttribute(
      "href",
      "/test-creator/sets/test-playlist"
    );
  });

  it("shows private lock when isPrivate is true", () => {
    renderComp({ ...mockPlaylist, isPrivate: true });
    expect(screen.getByTestId("playlist-component-private-badge")).toBeInTheDocument();
  });

  it("does not show private lock when isPrivate is false", () => {
    renderComp();
    expect(screen.queryByTestId("playlist-component-private-badge")).not.toBeInTheDocument();
  });

  // ── Like interactions ──────────────────────────────────────────────────────

  it("optimistically updates like count for playlist", async () => {
    const { likePlaylist } = await import("../../services/engagement.service");
    renderComp();

    const likeBtn = screen.getByTestId("playlist-component-btn-like");
    fireEvent.click(likeBtn);

    expect(likeBtn).toHaveTextContent("51");
    expect(likePlaylist).toHaveBeenCalledWith(mockPlaylist.id);
  });

  it("reverts like count for playlist if API fails", async () => {
    const { likePlaylist } = await import("../../services/engagement.service");
    vi.mocked(likePlaylist).mockRejectedValueOnce(new Error("API Error"));

    renderComp();
    const likeBtn = screen.getByTestId("playlist-component-btn-like");

    fireEvent.click(likeBtn);
    expect(likeBtn).toHaveTextContent("51");

    await waitFor(() => {
      expect(likeBtn).toHaveTextContent("50");
    });
  });

  it("decrements like count when unliking", async () => {
    const { likePlaylist, unlikePlaylist } = await import("../../services/engagement.service");
    renderComp();

    const likeBtn = screen.getByTestId("playlist-component-btn-like");

    // Like first
    fireEvent.click(likeBtn);
    expect(likeBtn).toHaveTextContent("51");
    expect(likePlaylist).toHaveBeenCalledWith(mockPlaylist.id);

    // Unlike
    fireEvent.click(likeBtn);
    expect(likeBtn).toHaveTextContent("50");
    expect(unlikePlaylist).toHaveBeenCalledWith(mockPlaylist.id);
  });

  it("reverts unlike if API fails", async () => {
    const { unlikePlaylist } = await import("../../services/engagement.service");

    renderComp();
    const likeBtn = screen.getByTestId("playlist-component-btn-like");

    // Like first (succeeds)
    fireEvent.click(likeBtn);
    await waitFor(() => expect(likeBtn).toHaveTextContent("51"));

    // Unlike fails
    vi.mocked(unlikePlaylist).mockRejectedValueOnce(new Error("API Error"));
    fireEvent.click(likeBtn);
    expect(likeBtn).toHaveTextContent("50");

    await waitFor(() => {
      expect(likeBtn).toHaveTextContent("51");
    });
  });

  // ── Repost interactions ────────────────────────────────────────────────────

  it("optimistically updates repost count for playlist", async () => {
    const { repostPlaylist } = await import("../../services/engagement.service");
    renderComp();

    const repostBtn = screen.getByTestId("playlist-component-btn-repost");
    fireEvent.click(repostBtn);

    expect(repostBtn).toHaveTextContent("21");
    expect(repostPlaylist).toHaveBeenCalledWith(mockPlaylist.id);
  });

  it("reverts repost count for playlist if API fails", async () => {
    const { repostPlaylist } = await import("../../services/engagement.service");
    vi.mocked(repostPlaylist).mockRejectedValueOnce(new Error("API Error"));

    renderComp();
    const repostBtn = screen.getByTestId("playlist-component-btn-repost");

    fireEvent.click(repostBtn);
    expect(repostBtn).toHaveTextContent("21");

    await waitFor(() => {
      expect(repostBtn).toHaveTextContent("20");
    });
  });

  // ── Share popup ────────────────────────────────────────────────────────────

  it("opens share popup when share button is clicked", () => {
    renderComp();
    fireEvent.click(screen.getByTestId("playlist-component-btn-share"));
    expect(screen.getByTestId("share-popup")).toBeInTheDocument();
  });

  // ── Owner actions ──────────────────────────────────────────────────────────

  it("calls onCopyLink when copy button is clicked", () => {
    const onCopyLink = vi.fn();
    renderComp(mockPlaylist, { onCopyLink });
    fireEvent.click(screen.getByTestId("playlist-component-btn-copy"));
    expect(onCopyLink).toHaveBeenCalledTimes(1);
  });

  // ── Stat updates on prop change ────────────────────────────────────────────

  it("updates like count when playlist prop changes", () => {
    const { rerender } = renderComp();
    const likeBtn = screen.getByTestId("playlist-component-btn-like");
    expect(likeBtn).toHaveTextContent("50");

    rerender(
      <MemoryRouter>
        <PlaylistComponent playlist={{ ...mockPlaylist, likeCount: 99 } as any} />
      </MemoryRouter>
    );
    expect(likeBtn).toHaveTextContent("99");
  });

  it("updates repost count when playlist prop changes", () => {
    const { rerender } = renderComp();
    const repostBtn = screen.getByTestId("playlist-component-btn-repost");
    expect(repostBtn).toHaveTextContent("20");

    rerender(
      <MemoryRouter>
        <PlaylistComponent playlist={{ ...mockPlaylist, repostCount: 99 } as any} />
      </MemoryRouter>
    );
    expect(repostBtn).toHaveTextContent("99");
  });
});