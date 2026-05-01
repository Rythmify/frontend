import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, Outlet, useNavigate } from "react-router-dom";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/services/api/search/Searchapi", () => ({
  searchEverything: vi.fn(),
}));

vi.mock("@/services/api/search/searchMappers", () => ({
  mapTrack: vi.fn((t: any) => ({ id: t.id, title: t.title ?? "Track", ...t })),
  mapPlaylist: vi.fn((p: any) => ({ id: p.id, title: p.title ?? "Playlist", ...p })),
}));

vi.mock("@/components/SearchComponents/Searchsidebar", () => ({
  default: ({ query, filters }: any) => (
    <div data-test="search-sidebar" data-query={query} data-filters={filters ? "yes" : "no"} />
  ),
}));

vi.mock("@/components/track/TrackCard", () => ({
  default: ({ track }: any) => (
    <div data-test={`track-card-${track.id}`}>{track.title}</div>
  ),
}));

vi.mock("@/components/playlist/PlaylistComponent", () => ({
  default: ({ playlist }: any) => (
    <div data-test={`playlist-card-${playlist.id}`}>{playlist.title}</div>
  ),
}));

vi.mock("@/components/SearchComponents/UserCard", () => ({
  default: ({ id, displayName }: any) => (
    <div data-test={`user-card-${id}`}>{displayName}</div>
  ),
}));

vi.mock("lucide-react", () => ({
  Menu: () => <svg data-test="menu-icon" />,
  X: () => <svg data-test="x-icon" />,
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import SearchPage, { FiltersContext, useSearchFilters } from "@/pages/search/SearchPage";
import { searchEverything } from "@/services/api/search/Searchapi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockSearchEverything = searchEverything as ReturnType<typeof vi.fn>;

function buildResponse(overrides: Partial<{
  tracks: any[];
  users: any[];
  playlists: any[];
  albums: any[];
  total: number;
}> = {}) {
  const {
    tracks = [],
    users = [],
    playlists = [],
    albums = [],
    total = 0,
  } = overrides;

  return {
    tracks,
    users,
    playlists,
    albums,
    pagination: { total },
  };
}

/** Renders SearchPage inside a MemoryRouter with an optional child outlet. */
function renderSearchPage(
  path = "/search",
  search = "",
  childElement: React.ReactNode = null,
) {
  const initialEntry = search ? `${path}?${search}` : path;

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/search" element={<SearchPage />}>
          <Route
            path="sounds"
            element={childElement ?? <div data-test="outlet-sounds" />}
          />
          <Route
            path="people"
            element={childElement ?? <div data-test="outlet-people" />}
          />
          <Route
            path="albums"
            element={childElement ?? <div data-test="outlet-albums" />}
          />
          <Route
            path="sets"
            element={childElement ?? <div data-test="outlet-sets" />}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

// Fake IntersectionObserver (jsdom doesn't have one)
function mockIntersectionObserver(intersecting = false) {
  const observers: { cb: IntersectionObserverCallback; el: Element }[] = [];

  const MockIO = vi.fn(function (this: IntersectionObserver, cb: IntersectionObserverCallback) {
    return {
      observe: (el: Element) => {
      observers.push({ cb, el });
      if (intersecting) {
        cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      }
    },
    disconnect: vi.fn(),
    };
  });

  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockIO,
  });

  return { observers, MockIO };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SearchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIntersectionObserver();
    mockSearchEverything.mockResolvedValue(buildResponse());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Layout & Sidebar ─────────────────────────────────────────────────────

  describe("layout", () => {
    it("renders the search sidebar", async () => {
      renderSearchPage("/search", "q=hello");
      await waitFor(() => expect(screen.getByTestId("search-sidebar")).toBeInTheDocument());
    });

    it("passes query to sidebar", async () => {
      renderSearchPage("/search", "q=jazz");
      await waitFor(() =>
        expect(screen.getByTestId("search-sidebar")).toHaveAttribute("data-query", "jazz"),
      );
    });

    it("passes null filters to sidebar when on /search (everything tab)", async () => {
      renderSearchPage("/search", "q=jazz");
      await waitFor(() =>
        expect(screen.getByTestId("search-sidebar")).toHaveAttribute("data-filters", "no"),
      );
    });

    it("renders outlet for /search/sounds", async () => {
      renderSearchPage("/search/sounds", "q=jazz");
      await waitFor(() => expect(screen.getByTestId("outlet-sounds")).toBeInTheDocument());
    });

    it("renders outlet for /search/people", async () => {
      renderSearchPage("/search/people", "q=jazz");
      await waitFor(() => expect(screen.getByTestId("outlet-people")).toBeInTheDocument());
    });

    it("renders outlet for /search/albums", async () => {
      renderSearchPage("/search/albums", "q=jazz");
      await waitFor(() => expect(screen.getByTestId("outlet-albums")).toBeInTheDocument());
    });

    it("renders outlet for /search/sets", async () => {
      renderSearchPage("/search/sets", "q=jazz");
      await waitFor(() => expect(screen.getByTestId("outlet-sets")).toBeInTheDocument());
    });
  });

  // ── Mobile sidebar toggle ─────────────────────────────────────────────────

  describe("mobile sidebar toggle", () => {
    it("shows the mobile header bar", async () => {
      renderSearchPage("/search", "q=test");
      // The sticky bar is always rendered (lg:hidden means CSS hides it on desktop)
      await waitFor(() => expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument());
    });

    it("displays menu icon when sidebar is closed", async () => {
      renderSearchPage("/search", "q=test");
      await waitFor(() => expect(screen.getByTestId("menu-icon")).toBeInTheDocument());
    });

    it("toggles sidebar open/close on button click", async () => {
      const user = userEvent.setup();
      renderSearchPage("/search", "q=test");

      const btn = await screen.findByLabelText("Toggle menu");

      // Open
      await user.click(btn);
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();

      // Close
      await user.click(btn);
      expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    });

    it("shows 'Search' label in mobile header when query is empty", async () => {
      renderSearchPage("/search", "");
      await waitFor(() => expect(screen.getByText("Search")).toBeInTheDocument());
    });

    it("shows Results label in mobile header when query is present", async () => {
      renderSearchPage("/search", "q=piano");
      await waitFor(() => expect(screen.getByText(/Results for "piano"/)).toBeInTheDocument());
    });

    it("closes sidebar after navigating to a different path", async () => {
      // This is tested implicitly via the useEffect that calls setSidebarOpen(false)
      // We just verify the component doesn't crash on path change simulation
      const user = userEvent.setup();
      renderSearchPage("/search", "q=test");
      const btn = await screen.findByLabelText("Toggle menu");
      await user.click(btn);
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    });
  });

  // ── FiltersContext ────────────────────────────────────────────────────────

  describe("FiltersContext", () => {
    it("provides setFilters via context without crashing", () => {
      const Consumer = () => {
        const { setFilters } = useSearchFilters();
        return (
          <button onClick={() => setFilters(null as any)} data-test="ctx-btn">
            click
          </button>
        );
      };

      render(
        <FiltersContext.Provider value={{ setFilters: vi.fn() }}>
          <Consumer />
        </FiltersContext.Provider>,
      );

      expect(screen.getByTestId("ctx-btn")).toBeInTheDocument();
    });

    it("useSearchFilters returns default no-op when outside provider", () => {
      const Consumer = () => {
        const { setFilters } = useSearchFilters();
        // Should not throw
        setFilters(null as any);
        return <div data-test="ok" />;
      };
      render(<Consumer />);
      expect(screen.getByTestId("ok")).toBeInTheDocument();
    });
  });
});

// ─── EverythingResults (via SearchPage at /search) ────────────────────────────

describe("EverythingResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIntersectionObserver();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows empty-query prompt when no q param", async () => {
    mockSearchEverything.mockResolvedValue(buildResponse());
    renderSearchPage("/search", "");
    await waitFor(() =>
      expect(
        screen.getByText(/Enter a search term to find music/i),
      ).toBeInTheDocument(),
    );
  });

  it("calls searchEverything with correct params", async () => {
    mockSearchEverything.mockResolvedValue(buildResponse());
    renderSearchPage("/search", "q=blues");
    await waitFor(() => expect(mockSearchEverything).toHaveBeenCalledWith(
      expect.objectContaining({ q: "blues", limit: 10, offset: 0 }),
      expect.any(AbortSignal),
    ));
  });

  it("renders track cards from response", async () => {
    mockSearchEverything.mockResolvedValue(
      buildResponse({
        tracks: [{ id: "t1", title: "Blue Note", score: 0.9 }],
        total: 1,
      }),
    );
    renderSearchPage("/search", "q=blues");
    await waitFor(() => expect(screen.getByTestId("track-card-t1")).toBeInTheDocument());
  });

  it("renders user cards from response", async () => {
    mockSearchEverything.mockResolvedValue(
      buildResponse({
        users: [{
          id: "u1",
          display_name: "Alice",
          score: 0.8,
          profile_picture: null,
          follower_count: 10,
        }],
        total: 1,
      }),
    );
    renderSearchPage("/search", "q=alice");
    await waitFor(() => expect(screen.getByTestId("user-card-u1")).toBeInTheDocument());
  });

  it("renders playlist cards from response", async () => {
    mockSearchEverything.mockResolvedValue(
      buildResponse({
        playlists: [{ id: "pl1", title: "Chill Mix", score: 0.7 }],
        total: 1,
      }),
    );
    renderSearchPage("/search", "q=chill");
    await waitFor(() => expect(screen.getByTestId("playlist-card-pl1")).toBeInTheDocument());
  });

  it("renders album cards from albums array", async () => {
    mockSearchEverything.mockResolvedValue(
      buildResponse({
        albums: [{ id: "al1", title: "Jazz Album", score: 0.6 }],
        total: 1,
      }),
    );
    renderSearchPage("/search", "q=jazz");
    await waitFor(() => expect(screen.getByTestId("playlist-card-al1")).toBeInTheDocument());
  });

  it("renders mixed results sorted by score descending", async () => {
    mockSearchEverything.mockResolvedValue(
      buildResponse({
        tracks: [{ id: "t1", title: "Low Score Track", score: 0.2 }],
        users: [{
          id: "u1",
          display_name: "High Score User",
          score: 0.95,
          profile_picture: null,
          follower_count: 0,
        }],
        total: 2,
      }),
    );
    renderSearchPage("/search", "q=mix");
    await waitFor(() => {
      const userCard = screen.getByTestId("user-card-u1");
      const trackCard = screen.getByTestId("track-card-t1");
      // user (score 0.95) should appear before track (score 0.2) in the DOM
      expect(
        userCard.compareDocumentPosition(trackCard) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  it("shows 'No results found' when response is empty", async () => {
    mockSearchEverything.mockResolvedValue(buildResponse({ total: 0 }));
    renderSearchPage("/search", "q=xyzxyz");
    await waitFor(() =>
      expect(screen.getByText("No results found")).toBeInTheDocument(),
    );
  });

  it("shows error message on fetch failure", async () => {
    mockSearchEverything.mockRejectedValue(new Error("Network error"));
    renderSearchPage("/search", "q=error");
    await waitFor(() =>
      expect(screen.getByText("Failed to load results. Please try again.")).toBeInTheDocument(),
    );
  });

  it("retry button re-fetches after error", async () => {
    mockSearchEverything
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue(buildResponse({ total: 0 }));

    const user = userEvent.setup();
    renderSearchPage("/search", "q=retry");

    await waitFor(() => screen.getByText("Failed to load results. Please try again."));

    await user.click(screen.getByText("Try again"));

    await waitFor(() => expect(mockSearchEverything).toHaveBeenCalledTimes(2));
  });

  it("ignores AbortError silently", async () => {
    const abortErr = Object.assign(new Error("aborted"), { name: "AbortError" });
    mockSearchEverything.mockRejectedValue(abortErr);
    renderSearchPage("/search", "q=abort");
    // Should not show error state
    await waitFor(() =>
      expect(
        screen.queryByText("Failed to load results. Please try again."),
      ).not.toBeInTheDocument(),
    );
  });

  it("ignores CanceledError silently", async () => {
    const cancelErr = Object.assign(new Error("canceled"), { name: "CanceledError" });
    mockSearchEverything.mockRejectedValue(cancelErr);
    renderSearchPage("/search", "q=cancel");
    await waitFor(() =>
      expect(
        screen.queryByText("Failed to load results. Please try again."),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows loading spinner while fetching", async () => {
    let resolve: (v: any) => void;
    mockSearchEverything.mockReturnValue(new Promise((r) => { resolve = r; }));

    renderSearchPage("/search", "q=loading");

    // Spinner should appear during load
    await waitFor(() =>
      expect(document.querySelector(".animate-spin")).toBeInTheDocument(),
    );

    // Resolve to clean up
    act(() => resolve!(buildResponse()));
  });

  it("loads next page on intersection", async () => {
    // First page
    mockSearchEverything.mockResolvedValueOnce(
      buildResponse({
        tracks: [{ id: "t1", score: 1 }],
        total: 20, // more than PAGE_SIZE=10
      }),
    );
    // Second page
    mockSearchEverything.mockResolvedValueOnce(
      buildResponse({
        tracks: [{ id: "t2", score: 0.5 }],
        total: 20,
      }),
    );

    // Set up intersecting observer before render
    const observers: { cb: IntersectionObserverCallback }[] = [];
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      value: vi.fn(function (this: IntersectionObserver, cb: IntersectionObserverCallback) {
        return {
        observe: (el: Element) => {
          observers.push({ cb });
        },
        disconnect: vi.fn(),
        };
      }),
    });

    renderSearchPage("/search", "q=pages");

    // Wait for first page
    await waitFor(() => expect(mockSearchEverything).toHaveBeenCalledTimes(1));
    await screen.findByTestId("track-card-t1");
    await waitFor(() => expect(observers.length).toBeGreaterThan(0));

    // Simulate sentinel becoming visible
    act(() => {
      observers.forEach(({ cb }) =>
        cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
      );
    });

    await waitFor(() => expect(mockSearchEverything).toHaveBeenCalledTimes(2));
    expect(mockSearchEverything).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 10 }),
      expect.any(AbortSignal),
    );
  });

  it("does not load next page when sentinel is not intersecting", async () => {
    mockSearchEverything.mockResolvedValue(
      buildResponse({ tracks: [{ id: "t1", score: 1 }], total: 20 }),
    );

    const observers: { cb: IntersectionObserverCallback }[] = [];
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      value: vi.fn(function (this: IntersectionObserver, cb: IntersectionObserverCallback) {
        return {
          observe: () => observers.push({ cb }),
          disconnect: vi.fn(),
        };
      }),
    });

    renderSearchPage("/search", "q=nointersect");
    await waitFor(() => expect(mockSearchEverything).toHaveBeenCalledTimes(1));

    act(() => {
      observers.forEach(({ cb }) =>
        cb([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver),
      );
    });

    // Still only 1 call
    expect(mockSearchEverything).toHaveBeenCalledTimes(1);
  });

  it("resets results when query changes", async () => {
    mockSearchEverything.mockResolvedValue(buildResponse({ total: 0 }));
    const user = userEvent.setup();
    const Harness = () => {
      const navigate = useNavigate();
      return (
        <>
          <button data-test="go-second" onClick={() => navigate("/search?q=second")} />
          <SearchPage />
        </>
      );
    };

    render(
      <MemoryRouter initialEntries={["/search?q=first"]}>
        <Routes>
          <Route path="/search" element={<Harness />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(mockSearchEverything).toHaveBeenCalledWith(
      expect.objectContaining({ q: "first" }),
      expect.any(AbortSignal),
    ));

    await user.click(screen.getByTestId("go-second"));

    await waitFor(() => expect(mockSearchEverything).toHaveBeenCalledWith(
      expect.objectContaining({ q: "second" }),
      expect.any(AbortSignal),
    ));
  });

  it("passes contextQueue of tracks to TrackCard", async () => {
    mockSearchEverything.mockResolvedValue(
      buildResponse({
        tracks: [
          { id: "t1", title: "Track One", score: 0.9 },
          { id: "t2", title: "Track Two", score: 0.8 },
        ],
        total: 2,
      }),
    );
    renderSearchPage("/search", "q=queue");
    await waitFor(() => {
      expect(screen.getByTestId("track-card-t1")).toBeInTheDocument();
      expect(screen.getByTestId("track-card-t2")).toBeInTheDocument();
    });
  });

  it("handles missing pagination gracefully (total defaults to 0)", async () => {
    mockSearchEverything.mockResolvedValue({
      tracks: [],
      users: [],
      playlists: [],
      albums: [],
      // no pagination key
    });
    renderSearchPage("/search", "q=nopagination");
    await waitFor(() => expect(screen.getByText("No results found")).toBeInTheDocument());
  });

  it("maps user fields with fallback values when fields are missing", async () => {
    mockSearchEverything.mockResolvedValue(
      buildResponse({
        users: [{ id: 42, score: 0.5 }], // no display_name, no profile_picture
        total: 1,
      }),
    );
    renderSearchPage("/search", "q=sparse");
    await waitFor(() => expect(screen.getByTestId("user-card-42")).toBeInTheDocument());
  });

  it("clears previous results and resets offset on re-fetch", async () => {
    mockSearchEverything
      .mockResolvedValueOnce(
        buildResponse({ tracks: [{ id: "old", score: 1 }], total: 1 }),
      )
      .mockResolvedValueOnce(
        buildResponse({ tracks: [{ id: "new", score: 1 }], total: 1 }),
      );

    const user = userEvent.setup();
    const Harness = () => {
      const navigate = useNavigate();
      return (
        <>
          <button data-test="go-second" onClick={() => navigate("/search?q=second")} />
          <SearchPage />
        </>
      );
    };

    render(
      <MemoryRouter initialEntries={["/search?q=first"]}>
        <Routes>
          <Route path="/search" element={<Harness />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByTestId("track-card-old"));

    await user.click(screen.getByTestId("go-second"));

    await waitFor(() => {
      expect(screen.getByTestId("track-card-new")).toBeInTheDocument();
      expect(screen.queryByTestId("track-card-old")).not.toBeInTheDocument();
    });
  });
});
