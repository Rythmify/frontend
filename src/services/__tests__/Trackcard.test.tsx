import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import TrackCard from "../../components/track/TrackCard";
import type { Track } from "../../types/track";
import { MemoryRouter } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import * as trackService from "../../services/track.service";

vi.hoisted(() => {
  if (typeof window !== "undefined") {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      fillRect: vi.fn(), clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray() })),
      putImageData: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(),
      lineTo: vi.fn(), stroke: vi.fn(), fill: vi.fn(), arc: vi.fn(),
      closePath: vi.fn(), measureText: vi.fn(() => ({ width: 0 })),
    }) as any;
    class MockResizeObserver {
      observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn();
    }
    window.ResizeObserver = MockResizeObserver as any;
    Element.prototype.scrollIntoView = vi.fn();
  }
});

vi.mock("wavesurfer.js", () => ({
  default: {
    create: vi.fn(() => ({ on: vi.fn(), destroy: vi.fn(), load: vi.fn(), setSinkId: vi.fn(), setVolume: vi.fn() })),
  },
}));

vi.mock("../api/audioService", () => ({
  audio: { pause: vi.fn(), play: vi.fn().mockResolvedValue(undefined), addEventListener: vi.fn(), removeEventListener: vi.fn(), src: "http://localhost/test.mp3" },
  seekAudio: vi.fn(), setGlobalWaveSurfer: vi.fn(), setTrackLoadedLocally: vi.fn(),
}));

vi.mock("../../services/track.service", () => ({
  getTrackComments: vi.fn().mockResolvedValue([]),
  getTrackWaveform: vi.fn().mockResolvedValue([]),
  postComment: vi.fn().mockResolvedValue({}),
  incrementPlayCount: vi.fn(),
}));

vi.mock("../../stores/player.store", () => ({
  usePlayerStore: Object.assign(
    vi.fn((selector) => {
      const state = { currentTrack: null, isPlaying: false, duration: 240, currentTime: 0, setTrack: vi.fn(), togglePlay: vi.fn(), addNextInQueue: vi.fn() };
      return typeof selector === "function" ? selector(state) : state;
    }),
    {
      subscribe: vi.fn(() => vi.fn()),
      getState: vi.fn(() => ({ setCurrentTime: vi.fn(), setDuration: vi.fn(), next: vi.fn(), playContext: vi.fn(), currentTime: 0 })),
    }
  ),
}));

vi.mock("../../components/track/EditTrackModal", () => ({ default: () => <div data-test="edit-track-modal" /> }));
vi.mock("../../components/track/ReplaceAudioModal", () => ({ default: () => <div data-test="replace-audio-modal" /> }));
vi.mock("../../components/track/DeleteTrackModal", () => ({ default: () => <div data-test="delete-track-modal" /> }));
vi.mock("../../pages/[username]/[trackSlug]/components/SharePopup", () => ({ default: () => <div data-test="share-popup" /> }));

vi.mock("../../stores/auth.store", () => ({
  useAuthStore: vi.fn(() => ({ user: { id: "user-123", username: "me", displayName: "Me" } })),
}));

// State for the store mock - MUST be prefixed with mock for hoisting
const mockStoreState = {
  likes: new Set<string>(),
  reposts: new Set<string>(),
  stats: {} as Record<string, any>,
};

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: () => ({
    isTrackLiked: (id: string) => mockStoreState.likes.has(id),
    isTrackReposted: (id: string) => mockStoreState.reposts.has(id),
    toggleTrack: async (track: Track) => {
      const id = String(track.id);
      if (mockStoreState.likes.has(id)) {
        mockStoreState.likes.delete(id);
        if (mockStoreState.stats[id]) mockStoreState.stats[id].likeCount--;
      } else {
        mockStoreState.likes.add(id);
        if (mockStoreState.stats[id]) mockStoreState.stats[id].likeCount++;
      }
    },
    toggleRepost: async (track: Track) => {
      const id = String(track.id);
      if (mockStoreState.reposts.has(id)) {
        mockStoreState.reposts.delete(id);
        if (mockStoreState.stats[id]) mockStoreState.stats[id].repostCount--;
      } else {
        mockStoreState.reposts.add(id);
        if (mockStoreState.stats[id]) mockStoreState.stats[id].repostCount++;
      }
    },
    getItemStats: (id: string) => mockStoreState.stats[String(id)] || {},
    updateItemStats: (id: string, stats: any) => { mockStoreState.stats[String(id)] = { ...mockStoreState.stats[String(id)], ...stats }; },
    incrementPlayCount: vi.fn(),
  })
}));

const mockTrack: Track = {
  id: "1", title: "Test Track", artistName: "Test Artist", artistUsername: "test-artist",
  coverUrl: "http://example.com/cover.jpg", genre: "Electronic", likeCount: 10, repostCount: 5,
  playCount: 100, commentCount: 2, duration: "3:45", postedAt: "2 hours ago",
  waveformData: [1, 2, 3], audioUrl: "http://example.com/audio.mp3", trackSlug: "test-track",
};

const renderCard = (track: Track = mockTrack, props = {}) => {
  return render(<MemoryRouter><TrackCard track={track} {...props} /></MemoryRouter>);
};

describe("TrackCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.likes = new Set();
    mockStoreState.reposts = new Set();
    mockStoreState.stats = {
      "1": { likeCount: 10, repostCount: 5, isReposted: false }
    };
    vi.mocked(useAuthStore).mockReturnValue({ user: { id: "user-123", username: "me", displayName: "Me" } });
    vi.mocked(trackService.getTrackComments).mockResolvedValue([]);
  });

  it("renders track information correctly (Visitor)", () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: null });
    renderCard();
    expect(screen.getByText("Test Track")).toBeInTheDocument();
  });

  it("renders comment count", async () => {
    vi.mocked(trackService.getTrackComments).mockResolvedValue([
      { comment_id: 1, content: "c1", author: { display_name: "A", username: "a" }, track_timestamp: 1 },
      { comment_id: 2, content: "c2", author: { display_name: "B", username: "b" }, track_timestamp: 2 },
    ] as any);
    renderCard();
    await waitFor(() => {
      expect(screen.getByTestId("track-card-comment-count")).toHaveTextContent("2");
    });
  });

  it("optimistically updates like count when clicked", async () => {
    const { rerender } = renderCard();
    const likeBtn = screen.getByTestId("track-card-btn-like");
    expect(likeBtn).toHaveTextContent("10");

    fireEvent.click(likeBtn);

    await act(async () => {
      rerender(<MemoryRouter><TrackCard track={mockTrack} /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(likeBtn).toHaveTextContent("11");
    });
  });

  it("decrements like count when unliking", async () => {
    mockStoreState.likes.add("1");
    mockStoreState.stats["1"].likeCount = 11;
    
    const { rerender } = renderCard();
    const likeBtn = screen.getByTestId("track-card-btn-like");
    expect(likeBtn).toHaveTextContent("11");

    fireEvent.click(likeBtn);

    await act(async () => {
      rerender(<MemoryRouter><TrackCard track={mockTrack} /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(likeBtn).toHaveTextContent("10");
    });
  });

  it("optimistically updates repost count when clicked", async () => {
    const { rerender } = renderCard();
    const repostBtn = screen.getByTestId("track-card-btn-repost");
    expect(repostBtn).toHaveTextContent("5");

    fireEvent.click(repostBtn);

    await act(async () => {
      rerender(<MemoryRouter><TrackCard track={mockTrack} /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(repostBtn).toHaveTextContent("6");
    });
  });

  it("opens edit modal when edit button is clicked", async () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: { id: "user-123", username: "test-artist", displayName: "Artist" } });
    await act(async () => {
      renderCard();
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("track-card-btn-edit"));
    });
    expect(screen.getByTestId("edit-track-modal")).toBeInTheDocument();
  });

  it("updates like count when track prop changes", async () => {
    const { rerender } = renderCard();
    const likeBtn = screen.getByTestId("track-card-btn-like");
    expect(likeBtn).toHaveTextContent("10");

    // Once initialized, the component trusts the store.
    // To simulate a prop update that should reflect in UI, we update the store.
    mockStoreState.stats["1"].likeCount = 99;
    
    await act(async () => {
      rerender(<MemoryRouter><TrackCard track={{ ...mockTrack, likeCount: 99 }} /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(likeBtn).toHaveTextContent("99");
    });
  });
});