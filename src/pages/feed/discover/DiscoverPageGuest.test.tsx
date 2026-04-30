import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DiscoverPageGuest from "./DiscoverPageGuest";
import { getHome } from "@/services/api/discover.service";
import type { HomeData } from "@/services/api/discover.service";

// ─── Mock Setup ───────────────────────────────────────────

vi.mock("@/services/api/discover.service", () => ({
  getHome: vi.fn(),
}));

vi.mock("@/components/UI/Spinner", () => ({
  default: () => <div data-test="spinner" />,
}));

vi.mock("@/components/discover/CuratedByRythmify/CuratedByRythmify", () => ({
  default: () => <div data-test="mock-curated-by-rythmify" />,
}));

vi.mock("@/components/discover/TrendingByGenre/TrendingByGenres", () => ({
  default: () => <div data-test="mock-trending-by-genres" />,
}));

vi.mock("@/components/UI/GoMobile", () => ({
  default: () => <div data-test="mock-go-mobile" />,
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

describe("DiscoverPageGuest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getHome).mockResolvedValue(mockHomeData);
  });

  // ── Loading ───────────────────────────────────────────────

  it("shows spinner while loading", () => {
    vi.mocked(getHome).mockReturnValue(new Promise(() => {}));
    render(<DiscoverPageGuest />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("hides spinner after data loads", async () => {
    render(<DiscoverPageGuest />);
    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });
  });

  // ── Error ─────────────────────────────────────────────────

  it("shows error message when getHome fails", async () => {
    vi.mocked(getHome).mockRejectedValue(new Error("Server error"));
    render(<DiscoverPageGuest />);
    await waitFor(() => {
      expect(screen.getByTestId("discover-guest-error")).toHaveTextContent("Server error");
    });
  });

  it("does not show error message on successful load", async () => {
    render(<DiscoverPageGuest />);
    await waitFor(() => {
      expect(screen.queryByTestId("discover-guest-error")).not.toBeInTheDocument();
    });
  });

  // ── Layout ────────────────────────────────────────────────

  it("renders guest page container", async () => {
    render(<DiscoverPageGuest />);
    await waitFor(() => {
      expect(screen.getByTestId("discover-page-guest")).toBeInTheDocument();
    });
  });

  it("renders guest main content area", async () => {
    render(<DiscoverPageGuest />);
    await waitFor(() => {
      expect(screen.getByTestId("discover-guest-main-content")).toBeInTheDocument();
    });
  });

  it("renders guest sidebar container", async () => {
    render(<DiscoverPageGuest />);
    await waitFor(() => {
      expect(screen.getByTestId("discover-guest-sidebar-container")).toBeInTheDocument();
    });
  });

  // ── Sections ──────────────────────────────────────────────

  it("renders CuratedByRythmify section", async () => {
    render(<DiscoverPageGuest />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-curated-by-rythmify")).toBeInTheDocument();
    });
  });

  it("renders TrendingByGenres section", async () => {
    render(<DiscoverPageGuest />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-trending-by-genres")).toBeInTheDocument();
    });
  });

  it("renders GoMobile in sidebar", async () => {
    render(<DiscoverPageGuest />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-go-mobile")).toBeInTheDocument();
    });
  });
});
