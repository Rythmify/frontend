import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { searchTracks } from "@/services/api/search/Searchapi";
import TrackCard from "@/components/track/TrackCard";
import { mapTrack } from "@/services/api/search/searchMappers";
import type { Track } from "@/types/track";

const PAGE_SIZE = 10;

export default function SoundsPage() {
  const [searchParams] = useSearchParams();
  const q          = searchParams.get("q") ?? "";
  const tag        = searchParams.get("tag") ?? undefined;
  const time_range = (searchParams.get("time_range") ?? undefined) as any;
  const duration   = (searchParams.get("duration") ?? undefined) as any;

  const [tracks, setTracks]   = useState<Track[]>([]);
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
        const res = await searchTracks(
          { q, tag, time_range, duration, limit: PAGE_SIZE, offset: pageOffset },
          controller.signal,
        );

        const mapped = (res.tracks as any[]).map(mapTrack);

        setTracks((prev) => (replace ? mapped : [...prev, ...mapped]));
        setTotal(res.pagination.total);
        setOffset(pageOffset);
        hasMoreRef.current = pageOffset + PAGE_SIZE < res.pagination.total;
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError("Failed to load tracks. Please try again.");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [q, tag, time_range, duration],
  );

  // Reset on query / filter change
  useEffect(() => {
    setTracks([]);
    setTotal(0);
    setOffset(0);
    hasMoreRef.current = false;
    fetchPage(0, true);
    return () => abortRef.current?.abort();
  }, [q, tag, time_range, duration]);

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
    hasMoreRef.current = tracks.length < total;
  }, [tracks.length, total]);

  // ── Empty query ───────────────────────────────────────────────────────────
  if (!q.trim()) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted text-sm">
        Enter a search term to find tracks.
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full">

      {/* Result count */}
      {!loading && total > 0 && (
        <p className="text-sm text-text-muted mb-4">
          Found {total >= 500 ? "500+" : total} tracks
        </p>
      )}

      {/* Track list */}
      <div className="flex flex-col">
        {tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            contextQueue={tracks}
          />
        ))}
      </div>

      {/* Empty state */}
      {!loading && tracks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-text font-semibold">No tracks found</p>
          <p className="text-text-muted text-sm">
            Try a different search term
            {tag ? ", remove the tag filter" : ""}
            {time_range ? ", remove the time range filter" : ""}
            {duration ? ", remove the duration filter" : ""}
            .
          </p>
        </div>
      )}

      {/* Spinner */}
      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-text-hover animate-spin" />
        </div>
      )}

      {/* Sentinel — IntersectionObserver watches this to trigger next page */}
      <div ref={sentinelRef} className="h-1" />

    </div>
  );
}