import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchMyTracks,
  fetchMyRepostedTracks,
  fetchMyRepostedPlaylists,
  type MyTrack,
  type RepostedTrack,
  type RepostedPlaylist,
} from "../../services/api/messaging/conversationApi";
import { fetchUserPlaylists, type UserPlaylist } from "../../services/api/messaging/conversationApi";
import { useAuthStore } from "@/stores/auth.store";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "my-tracks" | "reposted-tracks" | "playlists" | "reposted-playlists";

export type PickedItem =
  | { type: "track";    id: string; title: string; artistName: string; coverImage: string | null }
  | { type: "playlist"; id: string; title: string; trackCount: number;  coverImage: string | null };

interface TrackPlaylistPickerProps {
  onPick: (item: PickedItem) => void;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function CoverImage({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="w-10 h-10 shrink-0 rounded overflow-hidden bg-[#333] flex items-center justify-center">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <svg className="w-5 h-5 text-[#666]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
      )}
    </div>
  );
}

function PlaylistIcon() {
  return (
    <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}

function WaveformIcon() {
  return (
    <svg className="w-4 h-4 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
      <rect x="2"  y="10" width="2" height="4" rx="1" />
      <rect x="6"  y="7"  width="2" height="10" rx="1" />
      <rect x="10" y="4"  width="2" height="16" rx="1" />
      <rect x="14" y="7"  width="2" height="10" rx="1" />
      <rect x="18" y="10" width="2" height="4"  rx="1" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 1a5 5 0 0 0-5 5v3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2V6a5 5 0 0 0-5-5zm0 2a3 3 0 0 1 3 3v3H9V6a3 3 0 0 1 3-3z" />
    </svg>
  );
}

// ─── Row components ───────────────────────────────────────────────────────────

function TrackRow({ track, onPick }: { track: MyTrack | RepostedTrack; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
    >
      <CoverImage src={track.cover_image} alt={track.title} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{track.title}</p>
        <p className="text-xs text-[#888] truncate">{track.artist_name}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {formatDuration((track as MyTrack).duration) && (
          <span className="text-xs text-[#666]">{formatDuration((track as MyTrack).duration)}</span>
        )}
        <WaveformIcon />
      </div>
    </button>
  );
}

function PlaylistRow({
  playlist,
  onPick,
}: {
  playlist: RepostedPlaylist | UserPlaylist;
  onPick: () => void;
}) {
  const name       = (playlist as UserPlaylist).name       ?? (playlist as RepostedPlaylist).title ?? "Playlist";
  const coverImage = (playlist as any).cover_image ?? null;
  const trackCount = (playlist as any).track_count ?? 0;

  return (
    <button
      onClick={onPick}
      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
    >
      <CoverImage src={coverImage} alt={name} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{name}</p>
        <p className="text-xs text-[#888]">{trackCount} track{trackCount !== 1 ? "s" : ""}</p>
      </div>
      <PlaylistIcon />
    </button>
  );
}

// ─── Empty / Loading states ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-8 text-center text-sm text-[#666]">No {label} found.</div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TrackPlaylistPicker({ onPick, onClose }: TrackPlaylistPickerProps) {
  const user = useAuthStore((s) => s.user);

  const [activeTab,         setActiveTab]         = useState<TabKey>("my-tracks");
  const [query,             setQuery]             = useState("");
  const [loading,           setLoading]           = useState(false);

  const [myTracks,          setMyTracks]          = useState<MyTrack[]>([]);
  const [repostedTracks,    setRepostedTracks]    = useState<RepostedTrack[]>([]);
  const [userPlaylists,     setUserPlaylists]     = useState<UserPlaylist[]>([]);
  const [repostedPlaylists, setRepostedPlaylists] = useState<RepostedPlaylist[]>([]);

  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Fetch on tab change
  useEffect(() => {
    setLoading(true);

    const fetchers: Record<TabKey, () => Promise<void>> = {
      "my-tracks": async () => {
        const res = await fetchMyTracks(50, 0);
        setMyTracks(res.data);
      },
      "reposted-tracks": async () => {
        const res = await fetchMyRepostedTracks(50, 0);
        setRepostedTracks(res.data);
      },
      "playlists": async () => {
        if (!user?.id) return;
        const res = await fetchUserPlaylists(user.id, 50, 0);
        setUserPlaylists(res.data);
      },
      "reposted-playlists": async () => {
        const res = await fetchMyRepostedPlaylists(50, 0);
        setRepostedPlaylists(res.data);
      },
    };

    fetchers[activeTab]()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab, user?.id]);

  // ─── Filter by search query ───────────────────────────────────────────────
  const q = query.toLowerCase();

  const filteredMyTracks = myTracks.filter(
    (t) => t.title.toLowerCase().includes(q) || t.artist_name?.toLowerCase().includes(q),
  );
  const filteredRepostedTracks = repostedTracks.filter(
    (t) => t.title.toLowerCase().includes(q) || t.artist_name?.toLowerCase().includes(q),
  );
  const filteredUserPlaylists = userPlaylists.filter((p) =>
    p.name.toLowerCase().includes(q),
  );
  const filteredRepostedPlaylists = repostedPlaylists.filter((p) =>
    ((p as any).title ?? "").toLowerCase().includes(q),
  );

  // ─── Pick helpers ─────────────────────────────────────────────────────────
  const pickTrack = (t: MyTrack | RepostedTrack) => {
    onPick({ type: "track", id: t.id, title: t.title, artistName: t.artist_name ?? "", coverImage: t.cover_image });
    onClose();
  };

  const pickPlaylist = (p: RepostedPlaylist | UserPlaylist) => {
    const id         = (p as UserPlaylist).playlist_id ?? (p as any).id;
    const title      = (p as UserPlaylist).name        ?? (p as any).title ?? "Playlist";
    const trackCount = (p as any).track_count ?? 0;
    const coverImage = (p as any).cover_image ?? null;
    onPick({ type: "playlist", id, title, trackCount, coverImage });
    onClose();
  };

  // ─── Tab config ───────────────────────────────────────────────────────────
  const tabs: { key: TabKey; label: string }[] = [
    { key: "my-tracks",          label: "My Tracks"         },
    { key: "reposted-tracks",    label: "Reposted Tracks"   },
    { key: "playlists",          label: "My Playlists"      },
    { key: "reposted-playlists", label: "Reposted Playlists"},
  ];

  return (
    <div
      ref={ref}
      data-test="track-playlist-picker"
      className="absolute bottom-full left-0 mb-2 w-full max-w-md z-50 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      style={{ maxHeight: "400px" }}
    >
      {/* Search */}
      <div className="px-3 pt-3 pb-2 border-b border-white/10 shrink-0">
        <input
          autoFocus
          type="text"
          placeholder="Select a track or playlist from your profile"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-white placeholder-[#666] outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-white/10 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setQuery(""); }}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
              activeTab === tab.key
                ? "text-white border-b-2 border-[#f50]"
                : "text-[#666] hover:text-[#aaa]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingState />
        ) : activeTab === "my-tracks" ? (
          filteredMyTracks.length === 0 ? (
            <EmptyState label="tracks" />
          ) : (
            filteredMyTracks.map((t) => (
              <TrackRow key={t.id} track={t} onPick={() => pickTrack(t)} />
            ))
          )
        ) : activeTab === "reposted-tracks" ? (
          filteredRepostedTracks.length === 0 ? (
            <EmptyState label="reposted tracks" />
          ) : (
            filteredRepostedTracks.map((t) => (
              <TrackRow key={t.id} track={t} onPick={() => pickTrack(t)} />
            ))
          )
        ) : activeTab === "playlists" ? (
          filteredUserPlaylists.length === 0 ? (
            <EmptyState label="playlists" />
          ) : (
            filteredUserPlaylists.map((p) => (
              <PlaylistRow key={p.playlist_id} playlist={p} onPick={() => pickPlaylist(p)} />
            ))
          )
        ) : (
          filteredRepostedPlaylists.length === 0 ? (
            <EmptyState label="reposted playlists" />
          ) : (
            filteredRepostedPlaylists.map((p, i) => (
              <PlaylistRow key={(p as any).id ?? i} playlist={p} onPick={() => pickPlaylist(p)} />
            ))
          )
        )}
      </div>
    </div>
  );
}