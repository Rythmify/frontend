import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DiscoverPageAuth from "./DiscoverPageAuth";
import { getHome } from "@/services/api/discover.service";
import type { HomeData } from "@/services/api/discover.service";
import { useLikesStore } from "@/stores/likes.store";

// ─── Mock Setup ───────────────────────────────────────────

vi.mock("@/services/api/discover.service", () => ({
  getHome: vi.fn(),
}));

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(() => ({ user: { isPro: false } })),
}));

vi.mock("@/components/Premium/PremiumPromoModal", () => ({
  default: () => null,
}));

vi.mock("@/components/UI/Spinner", () => ({
  default: () => <div data-test="spinner" />,
}));

vi.mock("@/components/discover/sidebar/DiscoverSideBar", () => ({
  default: () => <div data-test="mock-sidebar" />,
}));

vi.mock("@/components/discover/MoreOfWhatYouLike", () => ({
  default: () => <div data-test="mock-more-of-what-you-like" />,
}));

vi.mock("@/components/discover/RecentlyPlayed", () => ({
  default: () => <div data-test="mock-recently-played" />,
}));

vi.mock("@/components/discover/MixedForYou", () => ({
  default: () => <div data-test="mock-mixed-for-you" />,
}));

vi.mock("@/components/discover/AlbumsForYou", () => ({
  default: () => <div data-test="mock-albums-for-you" />,
}));

vi.mock("@/components/discover/MadeForYou/MadeForYou", () => ({
  default: () => <div data-test="mock-made-for-you" />,
}));

vi.mock("@/components/discover/TrendingByGenre/TrendingByGenres", () => ({
  default: () => <div data-test="mock-trending-by-genres" />,
}));

vi.mock("@/components/discover/DiscoverWithStations", () => ({
  default: () => <div data-test="mock-discover-with-stations" />,
}));

vi.mock("@/components/discover/NewCrewForYou", () => ({
  default: () => <div data-test="mock-new-crew-for-you" />,
}));

// ─── Mock Data ────────────────────────────────────────────

const mockHomeData: HomeData = {
  curated: { mixes: [] },
  more_of_what_you_like: { tracks: [], source: "personalized" },
  mixed_for_you: [],
  made_for_you: null,
  trending_by_genre: {
    genres: [],
    initial_tab: { genre_id: "g1", genre_name: "Pop", tracks: [] },
  },
  discover_with_stations: [],
  artists_to_watch: [],
};

// ─── Test Suite ───────────────────────────────────────────

describe("DiscoverPageAuth", () => {
  let mockSeedFromHomeData: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSeedFromHomeData = vi.fn();
    vi.mocked(useLikesStore).mockImplementation(
      (selector: any) => selector({ seedFromHomeData: mockSeedFromHomeData }),
    );
    vi.mocked(getHome).mockResolvedValue(mockHomeData);
  });

  // ── Loading ───────────────────────────────────────────────

  it("shows spinner while loading", () => {
    vi.mocked(getHome).mockReturnValue(new Promise(() => {}));
    render(<DiscoverPageAuth />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("hides spinner after data loads", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });
  });

  // ── Error ─────────────────────────────────────────────────

  it("shows error message when getHome fails", async () => {
    vi.mocked(getHome).mockRejectedValue(new Error("Failed to fetch"));
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("discover-error")).toHaveTextContent("Failed to fetch");
    });
  });

  it("does not show error message on successful load", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.queryByTestId("discover-error")).not.toBeInTheDocument();
    });
  });

  // ── Layout ────────────────────────────────────────────────

  it("renders discover page container", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("discover-page")).toBeInTheDocument();
    });
  });

  it("renders main content area", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("discover-main-content")).toBeInTheDocument();
    });
  });

  it("renders sidebar container", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("discover-sidebar-container")).toBeInTheDocument();
    });
  });

  // ── Sections ──────────────────────────────────────────────

  it("renders MoreOfWhatYouLike section", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-more-of-what-you-like")).toBeInTheDocument();
    });
  });

  it("renders RecentlyPlayed section", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-recently-played")).toBeInTheDocument();
    });
  });

  it("renders MixedForYou section", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-mixed-for-you")).toBeInTheDocument();
    });
  });

  it("renders AlbumsForYou section", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-albums-for-you")).toBeInTheDocument();
    });
  });

  it("renders MadeForYou section", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-made-for-you")).toBeInTheDocument();
    });
  });

  it("renders TrendingByGenres section", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-trending-by-genres")).toBeInTheDocument();
    });
  });

  it("renders DiscoverWithStations section", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-discover-with-stations")).toBeInTheDocument();
    });
  });

  it("renders NewCrewForYou section", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-new-crew-for-you")).toBeInTheDocument();
    });
  });

  it("renders sidebar", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
    });
  });

  // ── Store ─────────────────────────────────────────────────

  it("calls seedFromHomeData with the loaded home data", async () => {
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(mockSeedFromHomeData).toHaveBeenCalledWith(mockHomeData);
    });
  });

  it("does not call seedFromHomeData when getHome fails", async () => {
    vi.mocked(getHome).mockRejectedValue(new Error("Network error"));
    render(<DiscoverPageAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("discover-error")).toBeInTheDocument();
    });
    expect(mockSeedFromHomeData).not.toHaveBeenCalled();
  });
});
