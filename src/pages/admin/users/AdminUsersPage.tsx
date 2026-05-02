import { useEffect, useState, useCallback, useRef } from "react";
import {
  Users,
  Search,
  UserX,
  UserCheck,
  AlertTriangle,
  MoreVertical,
  RefreshCw,
  Shield,
  X,
} from "lucide-react";
import {
  adminSuspendUser,
  adminReinstateUser,
  adminWarnUser,
  type WarnReason,
} from "@/services/api/admin.service";
import axiosInstance from "@/services/api/axiosInstance";

// ─── Types ───────────────────────────────────────────────────────────────────
interface AdminUser {
  id: string;
  display_name: string;
  username?: string | null;
  email: string;
  role: "listener" | "artist" | "admin";
  is_verified: boolean;
  status?: "active" | "suspended";
  followers_count?: number;
  profile_picture?: string | null;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-white/5 ${className}`} />
);

const RoleBadge = ({ role }: { role: string }) => {
  const map: Record<string, string> = {
    admin: "bg-[#ff5500]/10 text-[#ff5500] border-[#ff5500]/20",
    artist: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    listener: "bg-white/5 text-[#888] border-white/5",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[role] ?? "bg-white/5 text-[#999] border-white/5"}`}>
      {role}
    </span>
  );
};

const StatusBadge = ({ status }: { status?: string }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
      status === "suspended"
        ? "bg-red-500/10 text-red-400 border-red-500/20"
        : "bg-green-500/10 text-green-400 border-green-500/20"
    }`}
  >
    {status === "suspended" ? "Suspended" : "Active"}
  </span>
);

// ─── Action Dropdown ──────────────────────────────────────────────────────────
interface DropdownProps {
  user: AdminUser;
  onSuspend: (u: AdminUser) => void;
  onReinstate: (u: AdminUser) => void;
  onWarn: (u: AdminUser) => void;
}
const ActionDropdown = ({ user, onSuspend, onReinstate, onWarn }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (user.role === "admin") return <span className="text-[#444] text-xs">—</span>;

  return (
    <div ref={ref} className="relative">
      <button
        data-test={`btn-user-actions-${user.id}`}
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-[#888] hover:text-white hover:bg-white/8 transition-all"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-30 w-44 bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <button
            data-test="btn-send-warning"
            onClick={() => { setOpen(false); onWarn(user); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#ccc] hover:text-yellow-400 hover:bg-yellow-500/5 transition-colors"
          >
            <AlertTriangle size={14} className="text-yellow-500" />
            Send Warning
          </button>
          {user.status === "suspended" ? (
            <button
              data-test="btn-reinstate-account"
              onClick={() => { setOpen(false); onReinstate(user); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#ccc] hover:text-green-400 hover:bg-green-500/5 transition-colors"
            >
              <UserCheck size={14} className="text-green-500" />
              Reinstate Account
            </button>
          ) : (
            <button
              data-test="btn-suspend-account"
              onClick={() => { setOpen(false); onSuspend(user); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#ccc] hover:text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <UserX size={14} className="text-red-500" />
              Suspend Account
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Suspend Modal ────────────────────────────────────────────────────────────
const SuspendModal = ({
  user,
  onClose,
  onConfirm,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setReason(""); }, [user]);
  if (!user) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <button data-test="btn-suspend-modal-close" onClick={onClose} className="absolute top-4 right-4 text-[#555] hover:text-white">
          <X size={18} />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
            <UserX size={17} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Suspend Account</h2>
            <p className="text-[#666] text-xs">{user.display_name} (@{user.username})</p>
          </div>
        </div>
        <p className="text-[#999] text-xs uppercase tracking-widest mb-2">Reason *</p>
        <textarea
          data-test="textarea-suspend-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Repeated copyright violations"
          className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-red-500/40 resize-none transition-colors mb-4"
        />
        <p className="text-[#555] text-xs mb-4">
          This will block the user from logging in and all platform activity.
        </p>
        <div className="flex gap-2">
          <button data-test="btn-suspend-cancel" onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/5 text-[#999] hover:text-white text-sm font-medium transition-colors">Cancel</button>
          <button
            data-test="btn-suspend-confirm"
            onClick={handleConfirm}
            disabled={loading || !reason.trim()}
            className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Suspending…" : "Suspend"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Warn Modal ───────────────────────────────────────────────────────────────
const WarnModal = ({
  user,
  onClose,
  onConfirm,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (reason: WarnReason, message: string) => Promise<void>;
}) => {
  const [reason, setReason] = useState<WarnReason>("content_policy_violation");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setReason("content_policy_violation"); setMessage(""); }, [user]);
  if (!user) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(reason, message);
    setLoading(false);
  };

  const warnReasons: { value: WarnReason; label: string }[] = [
    { value: "copyright_strike", label: "Copyright Strike" },
    { value: "repeated_reports", label: "Repeated Reports" },
    { value: "content_policy_violation", label: "Content Policy Violation" },
    { value: "spam", label: "Spam" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <button data-test="btn-warn-modal-close" onClick={onClose} className="absolute top-4 right-4 text-[#555] hover:text-white">
          <X size={18} />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <AlertTriangle size={17} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Send Warning</h2>
            <p className="text-[#666] text-xs">{user.display_name}</p>
          </div>
        </div>

        <p className="text-[#999] text-xs uppercase tracking-widest mb-2">Warning Category</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {warnReasons.map(({ value, label }) => (
            <button
              key={value}
              data-test={`btn-warn-reason-${value}`}
              onClick={() => setReason(value)}
              className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all ${
                reason === value
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  : "bg-white/3 border-white/5 text-[#666] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-[#999] text-xs uppercase tracking-widest mb-2">Message (optional)</p>
        <textarea
          data-test="textarea-warn-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Custom message to the user…"
          className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-yellow-500/40 resize-none transition-colors mb-4"
        />

        <div className="flex gap-2">
          <button data-test="btn-warn-cancel" onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/5 text-[#999] hover:text-white text-sm font-medium transition-colors">Cancel</button>
          <button
            data-test="btn-warn-confirm"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send Warning"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [warnTarget, setWarnTarget] = useState<AdminUser | null>(null);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    if (!debouncedSearch.trim()) {
      setUsers([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get("/search", {
        params: {
          q: debouncedSearch,
          type: "users",
          limit,
          offset,
        },
      });
      const items = (res.data?.data?.users ?? []).map((u: Record<string, unknown>) => ({
        id: u.id,
        display_name: u.display_name ?? "Unknown",
        username: u.username ?? null,
        email: "",
        role: (u.role as string) ?? "listener",
        is_verified: u.is_verified ?? false,
        status: "active" as const,
        followers_count: u.follower_count ?? 0,
        profile_picture: (u.profile_picture as string) ?? null,
        created_at: "",
      }));
      setUsers(items);
      setTotal(res.data?.pagination?.total ?? items.length);
    } catch {
      // Fallback: empty state
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, offset]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSuspend = async (reason: string) => {
    if (!suspendTarget) return;
    try {
      setUsers((prev) => prev.map((u) => u.id === suspendTarget.id ? { ...u, status: "suspended" as const } : u));
      await adminSuspendUser(suspendTarget.id, reason);
      showToast(`${suspendTarget.display_name} suspended`);
    } catch {
      fetchUsers();
      showToast("Failed to suspend user", false);
    } finally {
      setSuspendTarget(null);
    }
  };

  const handleReinstate = async (user: AdminUser) => {
    try {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: "active" as const } : u));
      await adminReinstateUser(user.id);
      showToast(`${user.display_name} reinstated`);
    } catch {
      fetchUsers();
      showToast("Failed to reinstate user", false);
    }
  };

  const handleWarn = async (reason: WarnReason, message: string) => {
    if (!warnTarget) return;
    try {
      await adminWarnUser(warnTarget.id, { reason, message });
      showToast(`Warning sent to ${warnTarget.display_name}`);
    } catch {
      showToast("Failed to send warning", false);
    } finally {
      setWarnTarget(null);
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
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-[#666] text-base mt-1">Suspend, reinstate, and warn platform users</p>
        </div>
        <button data-test="btn-refresh" onClick={fetchUsers} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#161616] border border-white/5 text-[#888] hover:text-white transition-all">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-60 bg-[#161616] border border-white/8 rounded-lg px-3 py-2 focus-within:border-[#ff5500]/50 transition-colors">
          <Search size={15} className="text-[#555] flex-shrink-0" />
          <input
            data-test="input-user-search"
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            placeholder="Search users…"
            className="flex-1 bg-transparent text-base text-white placeholder:text-[#555] focus:outline-none"
          />
          {search && (
            <button data-test="btn-clear-search" onClick={() => setSearch("")} className="text-[#555] hover:text-white">
              <X size={13} />
            </button>
          )}
        </div>
        <select
          data-test="select-role-filter"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setOffset(0); }}
          className="bg-[#161616] border border-white/8 text-base text-[#ccc] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff5500]/50"
        >
          <option value="">All Roles</option>
          <option value="artist">Artist</option>
          <option value="listener">Listener</option>
        </select>
      </div>

      {/* Total */}
      {!loading && debouncedSearch && (
        <p className="text-[#555] text-sm">
          {total.toLocaleString()} user{total !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Table */}
      <div className="rounded-xl bg-[#161616] border border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_120px_130px_80px] gap-4 px-6 py-4 border-b border-white/5">
          {["User", "Role", "Status", "Followers", "Actions"].map((h) => (
            <span key={h} className="text-[#555] text-sm uppercase tracking-widest font-medium">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="divide-y divide-white/3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_140px_120px_130px_80px] gap-4 px-6 py-5 items-center">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#555]">
            <Users size={36} className="mb-3 opacity-30" />
            <p className="text-base">{debouncedSearch ? "No users found" : "Type a name to search users"}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/3">
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-[1fr_140px_120px_130px_80px] gap-4 px-6 py-5 items-center hover:bg-white/2 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.display_name}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#ff5500]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#ff5500] text-sm font-bold">
                        {(user.display_name || "?")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-base font-medium truncate">{user.display_name}</p>
                      {user.is_verified && <Shield size={13} className="text-[#ff5500] flex-shrink-0" />}
                    </div>
                    {user.username && (
                      <p className="text-[#555] text-sm truncate">@{user.username}</p>
                    )}
                  </div>
                </div>
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
                <span className="text-[#888] text-base">
                  {user.followers_count?.toLocaleString() ?? "—"}
                </span>
                <ActionDropdown
                  user={user}
                  onSuspend={setSuspendTarget}
                  onReinstate={handleReinstate}
                  onWarn={setWarnTarget}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[#555] text-sm">
              {offset + 1}–{Math.min(offset + limit, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                data-test="btn-prev-page"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-4 py-2 rounded-lg bg-white/5 text-[#888] text-sm hover:text-white disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <button
                data-test="btn-next-page"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="px-4 py-2 rounded-lg bg-white/5 text-[#888] text-sm hover:text-white disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SuspendModal user={suspendTarget} onClose={() => setSuspendTarget(null)} onConfirm={handleSuspend} />
      <WarnModal user={warnTarget} onClose={() => setWarnTarget(null)} onConfirm={handleWarn} />
    </div>
  );
};

export default AdminUsersPage;
