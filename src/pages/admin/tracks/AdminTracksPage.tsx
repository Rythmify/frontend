import { useEffect, useState, useCallback, useRef } from "react";
import {
  Music,
  Search,
  Eye,
  EyeOff,
  Trash2,
  MoreVertical,
  RefreshCw,
  X,
  Play,
  AlertTriangle,
} from "lucide-react";
import {
  adminDeleteTrack,
  adminToggleTrackVisibility,
} from "@/services/api/admin.service";
import axiosInstance from "@/services/api/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminTrack {
  id: string;
  title: string;
  artist_name: string;
  user_id: string;
  genre?: string | null;
  play_count: number;
  like_count: number;
  duration?: number | null;
  is_public: boolean;
  is_hidden: boolean;
  status: "ready" | "processing" | "failed";
  created_at: string;
  cover_image?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-white/5 ${className}`} />
);

const fmtDuration = (s?: number | null) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const StatusDot = ({ track }: { track: AdminTrack }) => {
  if (track.is_hidden) return <span className="inline-block w-2 h-2 rounded-full bg-red-500" title="Hidden" />;
  if (!track.is_public) return <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" title="Private" />;
  return <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Public" />;
};

// ─── Action Dropdown ──────────────────────────────────────────────────────────
interface DropdownProps {
  track: AdminTrack;
  onToggleHide: (t: AdminTrack) => void;
  onDelete: (t: AdminTrack) => void;
}
const ActionDropdown = ({ track, onToggleHide, onDelete }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        data-test={`btn-track-actions-${track.id}`}
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-[#888] hover:text-white hover:bg-white/8 transition-all"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-30 w-44 bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <button
            data-test={track.is_hidden ? "btn-toggle-unhide" : "btn-toggle-hide"}
            onClick={() => { setOpen(false); onToggleHide(track); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#ccc] hover:text-white hover:bg-white/5 transition-colors"
          >
            {track.is_hidden ? (
              <><Eye size={14} className="text-green-400" />Unhide Track</>
            ) : (
              <><EyeOff size={14} className="text-yellow-400" />Hide Track</>
            )}
          </button>
          <button
            data-test="btn-delete-track"
            onClick={() => { setOpen(false); onDelete(track); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#ccc] hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <Trash2 size={14} className="text-red-500" />
            Delete Track
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteModal = ({
  track,
  onClose,
  onConfirm,
}: {
  track: AdminTrack | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) => {
  const [loading, setLoading] = useState(false);
  if (!track) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Trash2 size={17} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Delete Track</h2>
            <p className="text-[#666] text-xs">This action is permanent</p>
          </div>
        </div>

        <div className="rounded-lg bg-white/3 border border-white/5 p-3 mb-5">
          <p className="text-white text-sm font-medium truncate">{track.title}</p>
          <p className="text-[#666] text-xs mt-0.5">{track.artist_name}</p>
        </div>

        <div className="flex items-start gap-2.5 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2.5 mb-5">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-xs leading-relaxed">
            This will permanently delete the track, all its comments, plays, and associated data. This cannot be undone.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            data-test="btn-delete-cancel"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-white/5 text-[#999] hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            data-test="btn-delete-confirm"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete Track"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Hide Reason Modal ────────────────────────────────────────────────────────
const HideModal = ({
  track,
  onClose,
  onConfirm,
}: {
  track: AdminTrack | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setReason(""); }, [track]);
  if (!track) return null;

  const isHiding = !track.is_hidden;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isHiding ? "bg-yellow-500/10" : "bg-green-500/10"}`}>
            {isHiding ? <EyeOff size={17} className="text-yellow-400" /> : <Eye size={17} className="text-green-400" />}
          </div>
          <div>
            <h2 className="text-white font-semibold">{isHiding ? "Hide Track" : "Unhide Track"}</h2>
            <p className="text-[#666] text-xs truncate max-w-xs">{track.title}</p>
          </div>
        </div>

        {isHiding && (
          <>
            <p className="text-[#999] text-xs uppercase tracking-widest mb-2">Reason (optional)</p>
            <textarea
              data-test="textarea-hide-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Why is this track being hidden?"
              className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-yellow-500/40 resize-none transition-colors mb-4"
            />
          </>
        )}

        {!isHiding && (
          <p className="text-[#666] text-sm mb-5 leading-relaxed">
            This will make the track visible again on the platform.
          </p>
        )}

        <div className="flex gap-2">
          <button
            data-test="btn-hide-cancel"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-white/5 text-[#999] hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            data-test="btn-hide-confirm"
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 ${
              isHiding ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Saving…" : isHiding ? "Hide Track" : "Unhide Track"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminTracksPage = () => {
  const [tracks, setTracks] = useState<AdminTrack[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const [deleteTarget, setDeleteTarget] = useState<AdminTrack | null>(null);
  const [hideTarget, setHideTarget] = useState<AdminTrack | null>(null);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setOffset(0); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/search", {
        params: { q: debouncedSearch || "a", type: "tracks", limit, offset },
      });
      const items = (res.data?.data?.tracks ?? []).map((t: Record<string, unknown>) => ({
        id: t.id,
        title: t.title ?? "Untitled",
        artist_name: (t.artist_name as string) ?? "Unknown",
        user_id: t.user_id ?? "",
        genre: t.genre_name ?? null,
        play_count: (t.play_count as number) ?? 0,
        like_count: (t.like_count as number) ?? 0,
        duration: t.duration ?? null,
        is_public: true,
        is_hidden: false,
        status: "ready" as const,
        created_at: (t.created_at as string) ?? "",
        cover_image: t.cover_image ?? null,
      }));
      setTracks(items);
      setTotal(res.data?.pagination?.total ?? items.length);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, offset]);

  useEffect(() => { fetchTracks(); }, [fetchTracks]);

  const handleToggleHide = async (reason: string) => {
    if (!hideTarget) return;
    const nowHiding = !hideTarget.is_hidden;
    try {
      setTracks((prev) => prev.map((t) => t.id === hideTarget.id ? { ...t, is_hidden: nowHiding } : t));
      await adminToggleTrackVisibility(hideTarget.id, { is_hidden: nowHiding, reason });
      showToast(`Track ${nowHiding ? "hidden" : "unhidden"} successfully`);
    } catch {
      fetchTracks();
      showToast("Failed to update track visibility", false);
    } finally {
      setHideTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setTracks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setTotal((n) => n - 1);
      await adminDeleteTrack(deleteTarget.id);
      showToast("Track deleted successfully");
    } catch {
      fetchTracks();
      showToast("Failed to delete track", false);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border ${toast.ok ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Track Moderation</h1>
          <p className="text-[#666] text-base mt-1">Hide or permanently remove platform tracks</p>
        </div>
        <button
          data-test="btn-refresh"
          onClick={fetchTracks}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#161616] border border-white/5 text-[#888] hover:text-white transition-all"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-[#666]">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />Public</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" />Private</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Hidden by Admin</div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#161616] border border-white/8 rounded-lg px-3 py-2 max-w-md focus-within:border-[#ff5500]/50 transition-colors">
        <Search size={15} className="text-[#555]" />
        <input
          data-test="input-track-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tracks…"
          className="flex-1 bg-transparent text-base text-white placeholder:text-[#555] focus:outline-none"
        />
        {search && (
          <button
            data-test="btn-clear-search"
            onClick={() => setSearch("")}
            className="text-[#555] hover:text-white"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {!loading && (
        <p className="text-[#555] text-sm">{total.toLocaleString()} track{total !== 1 ? "s" : ""}</p>
      )}

      {/* Table */}
      <div className="rounded-xl bg-[#161616] border border-white/5">
        <div className="grid grid-cols-[auto_1fr_150px_90px_90px_100px_80px] gap-4 px-6 py-4 border-b border-white/5">
          {["", "Track", "Artist", "Plays", "Likes", "Duration", "Actions"].map((h, i) => (
            <span key={i} className="text-[#555] text-sm uppercase tracking-widest font-medium">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="divide-y divide-white/3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_150px_90px_90px_100px_80px] gap-4 px-6 py-5 items-center">
                <Skeleton className="w-13 h-13 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#555]">
            <Music size={36} className="mb-3 opacity-30" />
            <p className="text-base">No tracks found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/3">
            {tracks.map((track) => (
              <div key={track.id} className="grid grid-cols-[auto_1fr_150px_90px_90px_100px_80px] gap-4 px-6 py-5 items-center hover:bg-white/2 transition-colors">
                {/* Cover */}
                <div className="relative w-13 h-13 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  {track.cover_image ? (
                    <img src={track.cover_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music size={16} className="text-[#555]" />
                    </div>
                  )}
                  <div className="absolute top-0.5 left-0.5">
                    <StatusDot track={track} />
                  </div>
                </div>

                {/* Title */}
                <div className="min-w-0">
                  <p className={`text-base font-medium truncate ${track.is_hidden ? "text-[#666] line-through" : "text-white"}`}>
                    {track.title}
                  </p>
                  {track.genre && <p className="text-[#555] text-sm mt-0.5">{track.genre}</p>}
                </div>

                <p className="text-[#888] text-base truncate">{track.artist_name}</p>

                <div className="flex items-center gap-1 text-[#888] text-base">
                  <Play size={13} className="text-[#555]" />
                  {track.play_count.toLocaleString()}
                </div>

                <span className="text-[#888] text-base">{track.like_count.toLocaleString()}</span>
                <span className="text-[#888] text-base">{fmtDuration(track.duration)}</span>

                <ActionDropdown
                  track={track}
                  onToggleHide={setHideTarget}
                  onDelete={setDeleteTarget}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[#555] text-xs">
              {offset + 1}–{Math.min(offset + limit, total)} of {total.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <button
                data-test="btn-prev-page"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-[#888] text-xs hover:text-white disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <button
                data-test="btn-next-page"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-[#888] text-xs hover:text-white disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <HideModal track={hideTarget} onClose={() => setHideTarget(null)} onConfirm={handleToggleHide} />
      <DeleteModal track={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default AdminTracksPage;
