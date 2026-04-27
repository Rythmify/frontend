import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { searchUsers } from "@/services/api/search/Searchapi";
import UserCard from "@/components/SearchComponents/UserCard";

// ─── Mapped shape ─────────────────────────────────────────────────────────────
// Backend formatUserResult returns:
// { id, display_name, profile_picture, follower_count, is_following, score }
// Note: username is NOT returned by the search backend — we fall back to id.

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
    // Backend does not return username in search results — fall back to id
    username: u.username ?? String(u.id ?? ""),
    displayName: u.display_name ?? u.displayName ?? "Unknown",
    avatarUrl: u.profile_picture ?? u.avatarUrl ?? null,
    location: u.location ?? null,
    followersCount: u.follower_count ?? u.followersCount ?? 0,
  };
}

const PAGE_SIZE = 10;

export default function PeoplePage() {
  const [searchParams] = useSearchParams();
  const q        = searchParams.get("q") ?? "";
  const location = searchParams.get("location") ?? undefined;

  const [users, setUsers]     = useState<MappedUser[]>([]);
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
        const res = await searchUsers(
          { q, location, limit: PAGE_SIZE, offset: pageOffset },
          controller.signal,
        );

        const mapped = (res.users as any[]).map(mapUser);

        setUsers((prev) => (replace ? mapped : [...prev, ...mapped]));
        setTotal(res.pagination.total);
        setOffset(pageOffset);
        hasMoreRef.current = pageOffset + PAGE_SIZE < res.pagination.total;
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError("Failed to load people. Please try again.");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [q, location],
  );

  // Reset on query / location change
  useEffect(() => {
    setUsers([]);
    setTotal(0);
    setOffset(0);
    hasMoreRef.current = false;
    fetchPage(0, true);
    return () => abortRef.current?.abort();
  }, [q, location]);

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
    hasMoreRef.current = users.length < total;
  }, [users.length, total]);

  // ── Empty query ───────────────────────────────────────────────────────────
  if (!q.trim()) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted text-sm">
        Enter a search term to find people.
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
          Found {total >= 500 ? "500+" : total} people
        </p>
      )}

      {/* User list */}
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

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-text font-semibold">No people found</p>
          <p className="text-text-muted text-sm">
            Try a different search term
            {location ? " or remove the location filter" : ""}.
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