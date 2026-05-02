import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import React from "react";

const mockSetFilters = vi.hoisted(() => vi.fn());

vi.mock("@/pages/search/SearchPage", () => ({
  useSearchFilters: () => ({ setFilters: mockSetFilters }),
}));

vi.mock("@/services/api/search/Searchapi", () => ({
  searchAlbums: vi.fn(),
  searchPlaylists: vi.fn(),
  searchTracks: vi.fn(),
  searchUsers: vi.fn(),
}));

vi.mock("@/services/api/search/searchMappers", () => ({
  mapPlaylist: vi.fn((p: any) => ({ id: p.id, title: p.title ?? p.name ?? "Playlist" })),
  mapTrack: vi.fn((t: any) => ({ id: t.id, title: t.title ?? "Track" })),
}));

vi.mock("@/components/playlist/PlaylistComponent", () => ({
  default: ({ playlist, urlSegment }: any) => (
    <div data-test={`playlist-card-${playlist.id}`} data-url-segment={urlSegment ?? ""}>
      {playlist.title}
    </div>
  ),
}));

vi.mock("@/components/track/TrackCard", () => ({
  default: ({ track, contextQueue }: any) => (
    <div data-test={`track-card-${track.id}`} data-queue-size={contextQueue.length}>
      {track.title}
    </div>
  ),
}));

vi.mock("@/components/SearchComponents/UserCard", () => ({
  default: ({ id, username, displayName, avatarUrl, location, followersCount }: any) => (
    <div
      data-test={`user-card-${id}`}
      data-username={username}
      data-avatar={avatarUrl ?? ""}
      data-location={location ?? ""}
      data-followers={followersCount}
    >
      {displayName}
    </div>
  ),
}));

import AlbumsPage from "@/pages/search/albums/AlbumsPage";
import PeoplePage from "@/pages/search/people/PeoplePage";
import SetsPage from "@/pages/search/sets/SetsPage";
import SoundsPage from "@/pages/search/sounds/SoundsPage";
import {
  searchAlbums,
  searchPlaylists,
  searchTracks,
  searchUsers,
} from "@/services/api/search/Searchapi";

const api = {
  albums: searchAlbums as ReturnType<typeof vi.fn>,
  people: searchUsers as ReturnType<typeof vi.fn>,
  sets: searchPlaylists as ReturnType<typeof vi.fn>,
  sounds: searchTracks as ReturnType<typeof vi.fn>,
};

const configs = {
  albums: {
    Component: AlbumsPage,
    route: "/search/albums",
    api: api.albums,
    resultKey: "albums",
    itemId: "album-1",
    cardTestId: "playlist-card-album-1",
    countText: "Found 1 albums",
    cappedCountText: "Found 500+ albums",
    emptyPrompt: "Enter a search term to find albums.",
    emptyTitle: "No albums found",
    errorText: "Failed to load albums. Please try again.",
    params: { q: "jazz", tag: "blue", limit: 10, offset: 0 },
  },
  people: {
    Component: PeoplePage,
    route: "/search/people",
    api: api.people,
    resultKey: "users",
    itemId: "user-1",
    cardTestId: "user-card-user-1",
    countText: "Found 1 people",
    cappedCountText: "Found 500+ people",
    emptyPrompt: "Enter a search term to find people.",
    emptyTitle: "No people found",
    errorText: "Failed to load people. Please try again.",
    params: { q: "jazz", location: "Cairo", limit: 10, offset: 0 },
  },
  sets: {
    Component: SetsPage,
    route: "/search/sets",
    api: api.sets,
    resultKey: "playlists",
    itemId: "set-1",
    cardTestId: "playlist-card-set-1",
    countText: "Found 1 playlists",
    cappedCountText: "Found 500+ playlists",
    emptyPrompt: "Enter a search term to find playlists.",
    emptyTitle: "No playlists found",
    errorText: "Failed to load playlists. Please try again.",
    params: { q: "jazz", tag: "blue", limit: 10, offset: 0 },
  },
  sounds: {
    Component: SoundsPage,
    route: "/search/sounds",
    api: api.sounds,
    resultKey: "tracks",
    itemId: "track-1",
    cardTestId: "track-card-track-1",
    countText: "Found 1 tracks",
    cappedCountText: "Found 500+ tracks",
    emptyPrompt: "Enter a search term to find tracks.",
    emptyTitle: "No tracks found",
    errorText: "Failed to load tracks. Please try again.",
    params: {
      q: "jazz",
      tag: "blue",
      time_range: "past_week",
      duration: "short",
      limit: 10,
      offset: 0,
    },
  },
} as const;

function response(resultKey: string, rows: any[], total = rows.length) {
  return {
    [resultKey]: rows,
    pagination: { total },
    filters: { available: { tags: ["blue"], locations: ["Cairo"] }, active: {} },
  };
}

function item(id: string) {
  return {
    id,
    title: `Title ${id}`,
    display_name: `Display ${id}`,
    profile_picture: "avatar.png",
    follower_count: 42,
    location: "Cairo",
  };
}

function queryFor(name: keyof typeof configs, q = "jazz") {
  if (name === "people") return `q=${q}&location=Cairo`;
  if (name === "sounds") return `q=${q}&tag=blue&time_range=past_week&duration=short`;
  return `q=${q}&tag=blue`;
}

function renderPage(name: keyof typeof configs, query = queryFor(name)) {
  const { Component, route } = configs[name];
  return render(
    <MemoryRouter initialEntries={[`${route}${query ? `?${query}` : ""}`]}>
      <Routes>
        <Route path={route} element={<Component />} />
      </Routes>
    </MemoryRouter>,
  );
}

function installIntersectionObserver() {
  const observers: IntersectionObserverCallback[] = [];
  const disconnect = vi.fn();
  const MockIntersectionObserver = vi.fn(function (this: IntersectionObserver, cb: IntersectionObserverCallback) {
    return {
      observe: vi.fn(() => observers.push(cb)),
      disconnect,
    };
  });
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockIntersectionObserver,
  });
  return { observers, disconnect };
}

describe("search result pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installIntersectionObserver();
    Object.values(api).forEach((fn) => fn.mockResolvedValue(response("tracks", [], 0)));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  (Object.keys(configs) as Array<keyof typeof configs>).forEach((name) => {
    const cfg = configs[name];

    describe(name, () => {
      beforeEach(() => {
        cfg.api.mockResolvedValue(response(cfg.resultKey, [], 0));
      });

      it("shows the empty query prompt and skips the API", () => {
        renderPage(name, "");
        expect(screen.getByText(cfg.emptyPrompt)).toBeInTheDocument();
        expect(cfg.api).not.toHaveBeenCalled();
      });

      it("calls the matching search API with query filters", async () => {
        renderPage(name);
        await waitFor(() =>
          expect(cfg.api).toHaveBeenCalledWith(expect.objectContaining(cfg.params), expect.any(AbortSignal)),
        );
      });

      it("renders results, count, filters, and the loading state", async () => {
        let resolve!: (value: any) => void;
        cfg.api.mockReturnValueOnce(new Promise((res) => { resolve = res; }));

        renderPage(name);
        await waitFor(() => expect(document.querySelector(".animate-spin")).toBeInTheDocument());

        await act(async () => {
          resolve(response(cfg.resultKey, [item(cfg.itemId)], 1));
        });

        expect(await screen.findByTestId(cfg.cardTestId)).toBeInTheDocument();
        expect(screen.getByText(cfg.countText)).toBeInTheDocument();
        expect(mockSetFilters).toHaveBeenCalledWith(expect.any(Object));
      });

      it("caps large result counts at 500+", async () => {
        cfg.api.mockResolvedValueOnce(response(cfg.resultKey, [item(cfg.itemId)], 501));
        renderPage(name);
        expect(await screen.findByText(cfg.cappedCountText)).toBeInTheDocument();
      });

      it("shows the filtered empty state copy", async () => {
        cfg.api.mockResolvedValueOnce(response(cfg.resultKey, [], 0));
        renderPage(name);
        expect(await screen.findByText(cfg.emptyTitle)).toBeInTheDocument();
        if (name === "people") expect(screen.getByText(/remove the location filter/i)).toBeInTheDocument();
        if (name === "albums" || name === "sets") expect(screen.getByText(/remove the tag filter/i)).toBeInTheDocument();
        if (name === "sounds") {
          expect(screen.getByText(/remove the tag filter/i)).toBeInTheDocument();
          expect(screen.getByText(/remove the time range filter/i)).toBeInTheDocument();
          expect(screen.getByText(/remove the duration filter/i)).toBeInTheDocument();
        }
      });

      it("shows errors and retries from the current offset", async () => {
        const user = userEvent.setup();
        cfg.api
          .mockRejectedValueOnce(new Error("boom"))
          .mockResolvedValueOnce(response(cfg.resultKey, [item(cfg.itemId)], 1));

        renderPage(name);
        expect(await screen.findByText(cfg.errorText)).toBeInTheDocument();
        await user.click(screen.getByText("Try again"));

        expect(await screen.findByTestId(cfg.cardTestId)).toBeInTheDocument();
        expect(cfg.api).toHaveBeenCalledTimes(2);
      });

      it("ignores cancellation errors", async () => {
        cfg.api.mockRejectedValueOnce(Object.assign(new Error("cancelled"), { name: "CanceledError" }));
        renderPage(name);
        await waitFor(() => expect(screen.queryByText(cfg.errorText)).not.toBeInTheDocument());
      });

      it("loads the next page when the sentinel intersects", async () => {
        const io = installIntersectionObserver();
        cfg.api
          .mockResolvedValueOnce(response(cfg.resultKey, [item(cfg.itemId)], 20))
          .mockResolvedValueOnce(response(cfg.resultKey, [item(`${cfg.itemId}-next`)], 20));

        renderPage(name);
        await waitFor(() => expect(cfg.api).toHaveBeenCalledTimes(1));

        act(() => {
          io.observers.forEach((cb) =>
            cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
          );
        });

        await waitFor(() => expect(cfg.api).toHaveBeenCalledTimes(2));
        expect(cfg.api).toHaveBeenLastCalledWith(
          expect.objectContaining({ offset: 10 }),
          expect.any(AbortSignal),
        );
      });

      it("disconnects observers and clears filters on unmount", async () => {
        const io = installIntersectionObserver();
        cfg.api.mockResolvedValueOnce(response(cfg.resultKey, [item(cfg.itemId)], 1));
        const view = renderPage(name);
        await screen.findByTestId(cfg.cardTestId);

        view.unmount();

        expect(io.disconnect).toHaveBeenCalled();
        expect(mockSetFilters).toHaveBeenCalledWith(null);
      });
    });
  });

  it("maps people fallback fields", async () => {
    api.people.mockResolvedValueOnce(response("users", [{ id: 7 }], 1));
    renderPage("people", "q=sparse");

    const card = await screen.findByTestId("user-card-7");
    expect(card).toHaveTextContent("Unknown");
    expect(card).toHaveAttribute("data-username", "7");
    expect(card).toHaveAttribute("data-followers", "0");
  });

  it("passes album URL segment to playlist cards", async () => {
    api.albums.mockResolvedValueOnce(response("albums", [item("album-1")], 1));
    renderPage("albums");
    expect(await screen.findByTestId("playlist-card-album-1")).toHaveAttribute("data-url-segment", "album");
  });

  it("passes the full track queue to track cards", async () => {
    api.sounds.mockResolvedValueOnce(response("tracks", [item("track-1"), item("track-2")], 2));
    renderPage("sounds");
    expect(await screen.findByTestId("track-card-track-1")).toHaveAttribute("data-queue-size", "2");
  });
});
