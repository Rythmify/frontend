import { Outlet, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useCallback, createContext, useContext } from "react";
import SearchSidebar from "@/components/SearchComponents/Searchsidebar";
import TrackCard from "@/components/track/TrackCard";
import PlaylistComponent from "@/components/playlist/PlaylistComponent";
import UserCard from "@/components/SearchComponents/UserCard";
import { mapTrack, mapPlaylist } from "@/services/api/search/searchMappers";
import { searchEverything } from "@/services/api/search/Searchapi";
import type { Track } from "@/types/track";
import type { Playlist } from "@/types/playlist";
import type { FiltersData } from "@/components/SearchComponents/Searchfilters";
import { Menu, X } from "lucide-react";

// ─── Filters context ──────────────────────────────────────────────────────────

interface FiltersContextValue {
  setFilters: (f: FiltersData) => void;
}

export const FiltersContext = createContext<FiltersContextValue>({
  setFilters: () => {},
});

export function useSearchFilters() {
  return useContext(FiltersContext);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MappedUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  location: string | null;
  followersCount: number;
}

function mapUser(u: any): MappedUser {
  return {
    id: String(u.id ?? ""),
    username: u.username ?? String(u.id ?? ""),
    displayName: u.display_name ?? u.displayName ?? "Unknown",
    avatarUrl: u.profile_picture ?? u.avatarUrl ?? null,
    location: u.location ?? null,
    followersCount: u.follower_count ?? u.followersCount ?? 0,
  };
}


// ─── Everything results ───────────────────────────────────────────────────────
// Merges tracks, users, playlists and albums into one flat list sorted by score.

const PAGE_SIZE = 10;

// Tagged union so we know which component to render per item
type ResultItem =
  | { type: "track";    score: number; data: Track }
  | { type: "user";     score: number; data: MappedUser }
  | { type: "playlist"; score: number; data: Playlist };

function EverythingResults({ q }: { q: string }) {
  const [items, setItems]     = useState<ResultItem[]>([]);
  const [total, setTotal]     = useState(0);
  const [offset, setOffset]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const abortRef    = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasMoreRef  = useRef(false);
  const loadingRef  = useRef(false);

  const fetchPage = useCallback(
    async (pageOffset: number, replace: boolean) => {
      if (!q.trim()) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      loadingRef.current = true;
      setError(null);

      try {
        const res = await searchEverything(
          { q, limit: PAGE_SIZE, offset: pageOffset },
          controller.signal,
        );

        const data = res as any;

        // Build tagged items preserving the raw score from backend
        const trackItems: ResultItem[] = (data.tracks ?? []).map((t: any) => ({
          type:  "track" as const,
          score: t.score ?? 0,
          data:  mapTrack(t),
        }));

        const userItems: ResultItem[] = (data.users ?? []).map((u: any) => ({
          type:  "user" as const,
          score: u.score ?? 0,
          data:  mapUser(u),
        }));

        // Merge playlists and albums — both render with PlaylistComponent
        const playlistItems: ResultItem[] = [
          ...(data.playlists ?? []),
          ...(data.albums    ?? []),
        ].map((pl: any) => ({
          type:  "playlist" as const,
          score: pl.score ?? 0,
          data:  mapPlaylist(pl),
        }));

        // Merge all and sort by score descending
        const merged = [...trackItems, ...userItems, ...playlistItems]
          .sort((a, b) => b.score - a.score);

        setItems((prev) => replace ? merged : [...prev, ...merged]);
        setTotal(data.pagination?.total ?? 0);
        setOffset(pageOffset);
        hasMoreRef.current = pageOffset + PAGE_SIZE < (data.pagination?.total ?? 0);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [q],
  );

  // Reset on query change
  useEffect(() => {
    setItems([]);
    setTotal(0);
    setOffset(0);
    hasMoreRef.current = false;
    fetchPage(0, true);
    return () => abortRef.current?.abort();
  }, [q]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
          setOffset((prev) => {
            const nextOffset = prev + PAGE_SIZE;
            fetchPage(nextOffset, false);
            return nextOffset;
          });
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchPage]);

  // Keep hasMoreRef in sync
  useEffect(() => {
    hasMoreRef.current = items.length < total;
  }, [items.length, total]);

  const seeAllBase = (type: string) =>
    `/search/${type}?q=${encodeURIComponent(q)}`;

  // ── States ──────────────────────────────────────────────────────────────────

  if (!q.trim()) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted text-sm">
        Enter a search term to find music, people, and playlists.
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-text-muted text-sm">{error}</p>
        <button onClick={() => fetchPage(offset, false)} className="text-sm text-text-hover hover:underline">
          Try again
        </button>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <p className="text-text font-semibold">No results found</p>
        <p className="text-text-muted text-sm">Try a different search term.</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  // All items are pre-sorted by score descending — render each with the
  // correct component based on its type discriminant.

  const trackQueue = items
    .filter((i): i is ResultItem & { type: "track" } => i.type === "track")
    .map((i) => i.data);

  return (
    <div className="flex flex-col">

      {items.map((item, index) => {
        if (item.type === "track") {
          return (
            <TrackCard
              key={`track-${item.data.id}-${index}`}
              track={item.data}
              contextQueue={trackQueue}
            />
          );
        }

        if (item.type === "user") {
          return (
            <div key={`user-${item.data.id}-${index}`} className="border-b border-white/5">
              <UserCard
                id={item.data.id}
                username={item.data.username}
                displayName={item.data.displayName}
                avatarUrl={item.data.avatarUrl}
                location={item.data.location}
                followersCount={item.data.followersCount}
              />
            </div>
          );
        }

        if (item.type === "playlist") {
          return (
            <PlaylistComponent
              key={`playlist-${item.data.id}-${index}`}
              playlist={item.data}
            />
          );
        }

        return null;
      })}

      {/* Spinner */}
      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-text-hover animate-spin" />
        </div>
      )}

      {/* Sentinel */}
      <div ref={sentinelRef} className="h-1" />

    </div>
  );
}

// ─── SearchPage ───────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const location = useLocation();
  const [filters, setFilters] = useState<FiltersData>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isEverything = location.pathname === "/search";

  // Clear filters synchronously on pathname change — useEffect is too late
  // (it runs after render, meaning the old filters flash on the new tab for one frame)
  const prevPathnameRef = useRef(location.pathname);
  if (prevPathnameRef.current !== location.pathname) {
    prevPathnameRef.current = location.pathname;
    if (filters !== null) setFilters(null);
  }

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, q]);

  return (
    <FiltersContext.Provider value={{ setFilters }}>
      <div data-test="search-page" className="container px-4 md:px-8 lg:px-12 xl:px-20 flex flex-col lg:flex-row gap-0 lg:gap-8">
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden sticky top-0 z-40 bg-black border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text truncate">
            {q.trim() ? `Results for "${q}"` : "Search"}
          </h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "block" : "hidden"
          } lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto px-4 py-8 lg:py-8 lg:px-0 w-full lg:w-[220px] lg:shrink-0 bg-black lg:bg-transparent border-b lg:border-b-0 z-30 lg:z-auto`}
        >
          <SearchSidebar query={q} filters={isEverything ? null : filters} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 px-4 py-8 lg:px-0 lg:py-8">
          {isEverything ? <EverythingResults q={q} /> : <Outlet />}
        </div>
      </div>
    </FiltersContext.Provider>
  );
}