import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import PlaylistComponent from "../../components/playlist/PlaylistComponent";
import { MemoryRouter } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

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
    create: vi.fn(() => ({ on: vi.fn(), destroy: vi.fn(), load: vi.fn() })),
  },
}));

vi.mock("../api/audioService", () => ({
  audio: { pause: vi.fn(), play: vi.fn().mockResolvedValue(undefined), addEventListener: vi.fn(), removeEventListener: vi.fn(), src: "http://localhost/test.mp3" },
  seekAudio: vi.fn(), setGlobalWaveSurfer: vi.fn(), setTrackLoadedLocally: vi.fn(),
}));

vi.mock("../../services/engagement.service", () => ({
  likePlaylist: vi.fn().mockResolvedValue(undefined),
  unlikePlaylist: vi.fn().mockResolvedValue(undefined),
  repostPlaylist: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../stores/player.store", () => ({
  usePlayerStore: Object.assign(
    vi.fn(() => ({ currentTrack: null, isPlaying: false, setTrack: vi.fn(), togglePlay: vi.fn() })),
    {
      subscribe: vi.fn(() => vi.fn()),
      getState: vi.fn(() => ({ setCurrentTime: vi.fn(), setDuration: vi.fn(), next: vi.fn() })),
    }
  ),
}));

vi.mock("../../stores/auth.store", () => ({
  useAuthStore: vi.fn(() => ({ user: { id: "user-123", username: "me" } })),
}));

// State for the store mock
const mockStoreState = {
  likes: new Set<number>(),
  reposts: new Set<number>(),
  stats: {} as Record<number, any>,
};

vi.mock("../../stores/likes.store", () => ({
  useLikesStore: () => ({
    isPlaylistLiked: (id: number) => mockStoreState.likes.has(id),
    isPlaylistReposted: (id: number) => mockStoreState.reposts.has(id),
    togglePlaylist: async (playlist: any) => {
      const id = playlist.id;
      if (mockStoreState.likes.has(id)) {
        mockStoreState.likes.delete(id);
        if (mockStoreState.stats[id]) mockStoreState.stats[id].likeCount--;
      } else {
        mockStoreState.likes.add(id);
        if (mockStoreState.stats[id]) mockStoreState.stats[id].likeCount++;
      }
    },
    togglePlaylistRepost: async (id: number) => {
      if (mockStoreState.reposts.has(id)) {
        mockStoreState.reposts.delete(id);
        if (mockStoreState.stats[id]) mockStoreState.stats[id].repostCount--;
      } else {
        mockStoreState.reposts.add(id);
        if (mockStoreState.stats[id]) mockStoreState.stats[id].repostCount++;
      }
    },
    getItemStats: (id: number) => mockStoreState.stats[id] || {},
    updateItemStats: (id: number, stats: any) => { mockStoreState.stats[id] = { ...mockStoreState.stats[id], ...stats }; },
  }),
}));

const mockPlaylist = {
  id: 1, title: "Test Playlist", playlistSlug: "test-playlist", creatorName: "Test Creator", creatorUsername: "test-creator",
  coverUrl: "http://example.com/cover.jpg", trackCount: 2, isPrivate: false, likeCount: 50, repostCount: 20, postedAt: "3 days ago",
  tracks: [
    { id: 101, title: "Track 1", artistName: "A1", duration: "3:00", playCount: 500, coverUrl: "", audioUrl: "", waveformData: [] },
    { id: 102, title: "Track 2", artistName: "A2", duration: "4:00", playCount: 300, coverUrl: "", audioUrl: "", waveformData: [] },
  ],
};

const renderComp = (playlist = mockPlaylist, props = {}) => {
  return render(<MemoryRouter><PlaylistComponent playlist={playlist as any} {...props} /></MemoryRouter>);
};

describe("PlaylistComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.likes = new Set();
    mockStoreState.reposts = new Set();
    mockStoreState.stats = {
      1: { likeCount: 50, repostCount: 20, isReposted: false }
    };
  });

  it("renders playlist title and creator", () => {
    renderComp();
    expect(screen.getByText("Test Playlist")).toBeInTheDocument();
    expect(screen.getByText("Test Creator")).toBeInTheDocument();
  });

  it("renders total plays stat", () => {
    renderComp();
    expect(screen.getByTestId("playlist-component-total-plays")).toHaveTextContent("800");
  });

  it("optimistically updates like count for playlist", async () => {
    const { rerender } = renderComp();
    const likeBtn = screen.getByTestId("playlist-component-btn-like");
    expect(likeBtn).toHaveTextContent("50");

    fireEvent.click(likeBtn);

    await act(async () => {
      rerender(<MemoryRouter><PlaylistComponent playlist={mockPlaylist as any} /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(likeBtn).toHaveTextContent("51");
    });
  });

  it("decrements like count when unliking", async () => {
    mockStoreState.likes.add(1);
    mockStoreState.stats[1].likeCount = 51;
    
    const { rerender } = renderComp();
    const likeBtn = screen.getByTestId("playlist-component-btn-like");
    expect(likeBtn).toHaveTextContent("51");

    fireEvent.click(likeBtn);

    await act(async () => {
      rerender(<MemoryRouter><PlaylistComponent playlist={mockPlaylist as any} /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(likeBtn).toHaveTextContent("50");
    });
  });

  it("optimistically updates repost count for playlist", async () => {
    const { rerender } = renderComp();
    const repostBtn = screen.getByTestId("playlist-component-btn-repost");
    expect(repostBtn).toHaveTextContent("20");

    fireEvent.click(repostBtn);

    await act(async () => {
      rerender(<MemoryRouter><PlaylistComponent playlist={mockPlaylist as any} /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(repostBtn).toHaveTextContent("21");
    });
  });

  it("updates like count when playlist prop changes", async () => {
    const { rerender } = renderComp();
    const likeBtn = screen.getByTestId("playlist-component-btn-like");
    expect(likeBtn).toHaveTextContent("50");

    mockStoreState.stats[1].likeCount = 99;

    await act(async () => {
      rerender(<MemoryRouter><PlaylistComponent playlist={{ ...mockPlaylist, likeCount: 99 } as any} /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(likeBtn).toHaveTextContent("99");
    });
  });
});