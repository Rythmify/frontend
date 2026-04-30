import { Outlet, useSearchParams, useLocation, Link } from "react-router-dom";
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

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, seeAllPath }: { title: string; seeAllPath: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-text">{title}</h2>
      <Link
        to={seeAllPath}
        className="text-xs text-text-secondary hover:text-text-hover transition-colors"
      >
        See all
      </Link>
    </div>
  );
}

// ─── Everything results ───────────────────────────────────────────────────────
// Calls /search with no type — returns all resource types with pagination.
// We load one page at a time and append via infinite scroll.

const PAGE_SIZE = 10;

function EverythingResults({ q }: { q: string }) {
  const [tracks, setTracks]       = useState<Track[]>([]);
  const [users, setUsers]         = useState<MappedUser[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [total, setTotal]         = useState(0);
  const [offset, setOffset]       = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

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

        // res shape: { tracks, users, playlists, albums, pagination, filters: null }
        const data = res as any;

        const mappedTracks    = (data.tracks    ?? []).map(mapTrack);
        const mappedUsers     = (data.users     ?? []).map(mapUser);
        const mappedPlaylists = (data.playlists ?? []).map(mapPlaylist);

        setTracks((prev)    => replace ? mappedTracks    : [...prev, ...mappedTracks]);
        setUsers((prev)     => replace ? mappedUsers     : [...prev, ...mappedUsers]);
        setPlaylists((prev) => replace ? mappedPlaylists : [...prev, ...mappedPlaylists]);

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
    setTracks([]);
    setUsers([]);
    setPlaylists([]);
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
  const totalLoaded = tracks.length + users.length + playlists.length;
  useEffect(() => {
    hasMoreRef.current = totalLoaded < total;
  }, [totalLoaded, total]);

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

  const hasResults = tracks.length > 0 || users.length > 0 || playlists.length > 0;

  if (!loading && !hasResults) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <p className="text-text font-semibold">No results found</p>
        <p className="text-text-muted text-sm">Try a different search term.</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-10">

      {/* Tracks */}
      {tracks.length > 0 && (
        <section>
          <SectionHeader title="Tracks" seeAllPath={seeAllBase("sounds")} />
          <div className="flex flex-col">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} contextQueue={tracks} />
            ))}
          </div>
        </section>
      )}

      {/* People */}
      {users.length > 0 && (
        <section>
          <SectionHeader title="People" seeAllPath={seeAllBase("people")} />
          <div className="flex flex-col divide-y divide-white/5">
            {users.map((user) => (
              <UserCard
                key={user.id}
                id={user.id}
                username={user.username}
                displayName={user.displayName}
                avatarUrl={user.avatarUrl}
                location={user.location}
                followersCount={user.followersCount}
              />
            ))}
          </div>
        </section>
      )}

      {/* Playlists */}
      {playlists.length > 0 && (
        <section>
          <SectionHeader title="Playlists" seeAllPath={seeAllBase("sets")} />
          <div className="flex flex-col divide-y divide-white/5">
            {playlists.map((playlist) => (
              <PlaylistComponent key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}

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

  const isEverything = location.pathname === "/search";

  // Clear filters synchronously on pathname change — useEffect is too late
  // (it runs after render, meaning the old filters flash on the new tab for one frame)
  const prevPathnameRef = useRef(location.pathname);
  if (prevPathnameRef.current !== location.pathname) {
    prevPathnameRef.current = location.pathname;
    if (filters !== null) setFilters(null);
  }

  return (
    <FiltersContext.Provider value={{ setFilters }}>
      <div
        data-test="search-page"
        className="flex container px-4 md:px-8 lg:px-12 xl:px-20 flex-row gap-8 py-8"
      >
        <SearchSidebar query={q} filters={isEverything ? null : filters} />
        <div className="flex-1 min-w-0">
          {isEverything ? <EverythingResults q={q} /> : <Outlet />}
        </div>
      </div>
    </FiltersContext.Provider>
  );
}