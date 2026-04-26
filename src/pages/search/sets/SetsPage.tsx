import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { searchPlaylists } from "@/services/api/search/Searchapi";
import PlaylistComponent from "@/components/playlist/PlaylistComponent";
import { mapPlaylist } from "@/services/api/search/searchMappers";
import type { Playlist } from "@/types/playlist";

const PAGE_SIZE = 10;

export default function SetsPage() {
  const [searchParams] = useSearchParams();
  const q   = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? undefined;

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
        const res = await searchPlaylists(
          { q, tag, limit: PAGE_SIZE, offset: pageOffset },
          controller.signal,
        );

        const mapped = (res.playlists as any[]).map(mapPlaylist);

        setPlaylists((prev) => (replace ? mapped : [...prev, ...mapped]));
        setTotal(res.pagination.total);
        setOffset(pageOffset);
        hasMoreRef.current = pageOffset + PAGE_SIZE < res.pagination.total;
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError("Failed to load playlists. Please try again.");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [q, tag],
  );

  // Reset on query / tag change
  useEffect(() => {
    setPlaylists([]);
    setTotal(0);
    setOffset(0);
    hasMoreRef.current = false;
    fetchPage(0, true);
    return () => abortRef.current?.abort();
  }, [q, tag]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
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
    hasMoreRef.current = playlists.length < total;
  }, [playlists.length, total]);

  if (!q.trim()) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted text-sm">
        Enter a search term to find playlists.
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-text-muted text-sm">{error}</p>
        <button
          onClick={() => fetchPage(offset, false)}
          className="text-sm text-text-hover hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">

      {/* Result count */}
      {!loading && total > 0 && (
        <p className="text-sm text-text-muted mb-4">
          Found {total >= 500 ? "500+" : total} playlists
        </p>
      )}

      {/* Playlist list */}
      <div className="flex flex-col divide-y divide-white/5">
        {playlists.map((playlist) => (
          <PlaylistComponent key={playlist.id} playlist={playlist} />
        ))}
      </div>

      {/* Empty state */}
      {!loading && playlists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-text font-semibold">No playlists found</p>
          <p className="text-text-muted text-sm">
            Try a different search term{tag ? " or remove the tag filter" : ""}.
          </p>
        </div>
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