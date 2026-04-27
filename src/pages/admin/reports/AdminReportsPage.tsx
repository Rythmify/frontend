import { useEffect, useState, useCallback } from "react";
import {
  Flag,
  ChevronDown,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Gavel,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  GitMerge,
} from "lucide-react";
import {
  listAdminReports,
  resolveAdminReport,
  listReportAppeals,
  reviewAppeal,
  type ReportDetailed,
  type ReportAppeal,
  type ReportStatus,
  type ReportReason,
  type AppealStatus,
} from "@/services/api/admin.service";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-white/5 ${className}`} />
);

const StatusBadge = ({ status }: { status: ReportStatus | AppealStatus | string }) => {
  const map: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    resolved: "bg-green-500/10 text-green-400 border-green-500/20",
    dismissed: "bg-[#333] text-[#888] border-white/5",
    upheld: "bg-red-500/10 text-red-400 border-red-500/20",
    overturned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        map[status] ?? "bg-white/5 text-[#999] border-white/5"
      }`}
    >
      {status}
    </span>
  );
};

const ReasonBadge = ({ reason }: { reason: string }) => {
  const map: Record<string, string> = {
    copyright: "bg-purple-500/10 text-purple-400",
    inappropriate: "bg-red-500/10 text-red-400",
    spam: "bg-yellow-500/10 text-yellow-400",
    impersonation: "bg-blue-500/10 text-blue-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        map[reason] ?? "bg-white/5 text-[#999]"
      }`}
    >
      {reason}
    </span>
  );
};

// ─── Resolve Modal ────────────────────────────────────────────────────────────
interface ResolveModalProps {
  report: ReportDetailed | null;
  onClose: () => void;
  onConfirm: (status: "resolved" | "dismissed", note: string) => Promise<void>;
}
const ResolveModal = ({ report, onClose, onConfirm }: ResolveModalProps) => {
  const [status, setStatus] = useState<"resolved" | "dismissed">("resolved");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus("resolved");
    setNote("");
  }, [report]);

  if (!report) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(status, note);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-[#ff5500]/10 flex items-center justify-center">
            <Gavel size={17} className="text-[#ff5500]" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Resolve Report</h2>
            <p className="text-[#666] text-xs">Report ID: {report.id.slice(0, 8)}…</p>
          </div>
        </div>

        {/* Report summary */}
        <div className="rounded-lg bg-white/3 border border-white/5 p-3 mb-5 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-[#666]">Type</span>
            <span className="text-white capitalize">{report.resource_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666]">Reason</span>
            <ReasonBadge reason={report.reason} />
          </div>
          <div className="flex justify-between">
            <span className="text-[#666]">Reported by</span>
            <span className="text-white">{report.reported_by_name ?? report.reported_by?.display_name ?? "Unknown"}</span>
          </div>
        </div>

        {/* Decision */}
        <p className="text-[#999] text-xs uppercase tracking-widest mb-2">Decision</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(["resolved", "dismissed"] as const).map((s) => (
            <button
              key={s}
              data-test={`btn-decision-${s}`}
              onClick={() => setStatus(s)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 ${
                status === s
                  ? s === "resolved"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-[#333] border-white/10 text-[#ccc]"
                  : "bg-white/3 border-white/5 text-[#666] hover:text-white"
              }`}
            >
              {s === "resolved" ? <CheckCircle size={15} /> : <XCircle size={15} />}
              <span className="capitalize">{s}</span>
            </button>
          ))}
        </div>

        {/* Note */}
        <p className="text-[#999] text-xs uppercase tracking-widest mb-2">Admin Note (optional)</p>
        <textarea
          data-test="textarea-admin-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add context for this decision…"
          className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff5500]/50 resize-none transition-colors"
        />

        <div className="flex gap-2 mt-4">
          <button
            data-test="btn-resolve-cancel"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-white/5 text-[#999] hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            data-test="btn-resolve-confirm"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#ff5500] hover:bg-[#e64a00] text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Appeal Modal ─────────────────────────────────────────────────────────────
interface AppealModalProps {
  appeal: ReportAppeal | null;
  onClose: () => void;
  onConfirm: (id: string, decision: "upheld" | "overturned", notes: string) => Promise<void>;
}
const AppealModal = ({ appeal, onClose, onConfirm }: AppealModalProps) => {
  const [decision, setDecision] = useState<"upheld" | "overturned">("upheld");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDecision("upheld");
    setNotes("");
  }, [appeal]);

  if (!appeal) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(appeal.id, decision, notes);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <GitMerge size={17} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Review Appeal</h2>
            <p className="text-[#666] text-xs">Appeal ID: {appeal.id.slice(0, 8)}…</p>
          </div>
        </div>

        <div className="rounded-lg bg-white/3 border border-white/5 p-3 mb-4">
          <p className="text-[#666] text-xs mb-1">Appeal Reason</p>
          <p className="text-white text-sm leading-relaxed">{appeal.appeal_reason}</p>
        </div>

        <p className="text-[#999] text-xs uppercase tracking-widest mb-2">Decision</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(["upheld", "overturned"] as const).map((d) => (
            <button
              key={d}
              data-test={`btn-decision-${d}`}
              onClick={() => setDecision(d)}
              className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 ${
                decision === d
                  ? d === "upheld"
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-white/3 border-white/5 text-[#666] hover:text-white"
              }`}
            >
              <span className="capitalize">{d}</span>
            </button>
          ))}
        </div>

        <textarea
          data-test="textarea-appeal-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Admin notes (optional)…"
          className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff5500]/50 resize-none transition-colors mb-4"
        />

        <div className="flex gap-2">
          <button
            data-test="btn-appeal-cancel"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-white/5 text-[#999] hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            data-test="btn-appeal-confirm"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#ff5500] hover:bg-[#e64a00] text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : "Submit Decision"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = "reports" | "appeals";

const AdminReportsPage = () => {
  const [tab, setTab] = useState<Tab>("reports");

  // Reports state
  const [reports, setReports] = useState<ReportDetailed[]>([]);
  const [reportsMeta, setReportsMeta] = useState({ limit: 20, offset: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [reasonFilter, setReasonFilter] = useState<ReportReason | "">("");
  const [reportsLoading, setReportsLoading] = useState(true);

  // Appeals state
  const [appeals, setAppeals] = useState<ReportAppeal[]>([]);
  const [appealsMeta, setAppealsMeta] = useState({ limit: 20, offset: 0, total: 0 });
  const [appealStatus, setAppealStatus] = useState<AppealStatus | "">("");
  const [appealsLoading, setAppealsLoading] = useState(true);

  // Modals
  const [resolveTarget, setResolveTarget] = useState<ReportDetailed | null>(null);
  const [appealTarget, setAppealTarget] = useState<ReportAppeal | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await listAdminReports({
        status: statusFilter || undefined,
        reason: reasonFilter || undefined,
        limit: reportsMeta.limit,
        offset: reportsMeta.offset,
      });
      setReports(res.data);
      setReportsMeta(res.pagination);
    } catch {
      showToast("Failed to load reports", false);
    } finally {
      setReportsLoading(false);
    }
  }, [statusFilter, reasonFilter, reportsMeta.limit, reportsMeta.offset]);

  // Fetch appeals
  const fetchAppeals = useCallback(async () => {
    setAppealsLoading(true);
    try {
      const res = await listReportAppeals({
        status: appealStatus || undefined,
        limit: appealsMeta.limit,
        offset: appealsMeta.offset,
      });
      setAppeals(res.data);
      setAppealsMeta(res.pagination);
    } catch {
      showToast("Failed to load appeals", false);
    } finally {
      setAppealsLoading(false);
    }
  }, [appealStatus, appealsMeta.limit, appealsMeta.offset]);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  useEffect(() => { if (tab === "appeals") fetchAppeals(); }, [tab, fetchAppeals]);

  // Handlers
  const handleResolve = async (status: "resolved" | "dismissed", note: string) => {
    if (!resolveTarget) return;
    try {
      setReports((prev) => prev.map((r) => r.id === resolveTarget.id ? { ...r, status } : r));
      await resolveAdminReport(resolveTarget.id, { status, admin_note: note });
      showToast(`Report ${status} successfully`);
    } catch {
      fetchReports();
      showToast("Failed to resolve report", false);
    } finally {
      setResolveTarget(null);
    }
  };

  const handleAppealDecision = async (id: string, decision: "upheld" | "overturned", notes: string) => {
    try {
      setAppeals((prev) => prev.map((a) => a.id === id ? { ...a, status: decision } : a));
      await reviewAppeal(id, { decision, admin_notes: notes });
      showToast(`Appeal ${decision}`);
    } catch {
      fetchAppeals();
      showToast("Failed to record decision", false);
    } finally {
      setAppealTarget(null);
    }
  };

  const loading = tab === "reports" ? reportsLoading : appealsLoading;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border transition-all duration-300 ${
            toast.ok
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Appeals</h1>
          <p className="text-[#666] text-base mt-1">Review flagged content and user appeals</p>
        </div>
        <button
          data-test="btn-refresh"
          onClick={() => tab === "reports" ? fetchReports() : fetchAppeals()}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#161616] border border-white/5 text-[#888] hover:text-white transition-all"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#161616] border border-white/5 rounded-xl p-1 w-fit">
        {(["reports", "appeals"] as Tab[]).map((t) => (
          <button
            key={t}
            data-test={`tab-${t}`}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium transition-all duration-150 ${
              tab === t ? "bg-[#ff5500] text-white" : "text-[#888] hover:text-white"
            }`}
          >
            {t === "reports" ? <Flag size={14} /> : <GitMerge size={14} />}
            <span className="capitalize">{t}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {tab === "reports" ? (
          <>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#555]" />
              <span className="text-[#555] text-sm">Filter:</span>
            </div>
            <select
              data-test="select-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "")}
              className="bg-[#161616] border border-white/8 text-base text-[#ccc] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#ff5500]/50"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <select
              data-test="select-reason-filter"
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value as ReportReason | "")}
              className="bg-[#161616] border border-white/8 text-base text-[#ccc] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#ff5500]/50"
            >
              <option value="">All Reasons</option>
              <option value="copyright">Copyright</option>
              <option value="inappropriate">Inappropriate</option>
              <option value="spam">Spam</option>
              <option value="impersonation">Impersonation</option>
            </select>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#555]" />
              <span className="text-[#555] text-sm">Filter:</span>
            </div>
            <select
              data-test="select-appeal-status-filter"
              value={appealStatus}
              onChange={(e) => setAppealStatus(e.target.value as AppealStatus | "")}
              className="bg-[#161616] border border-white/8 text-base text-[#ccc] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#ff5500]/50"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="upheld">Upheld</option>
              <option value="overturned">Overturned</option>
            </select>
          </>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#161616] border border-white/5 overflow-hidden">
        {/* Table Header */}
        {tab === "reports" ? (
          <>
            <div className="grid grid-cols-[1fr_180px_120px_120px_180px] gap-4 px-6 py-4 border-b border-white/5">
              {["Report", "Reporter", "Reason", "Status", "Actions"].map((h) => (
                <span key={h} className="text-[#555] text-sm uppercase tracking-widest font-medium">
                  {h}
                </span>
              ))}
            </div>

            {reportsLoading ? (
              <div className="divide-y divide-white/3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[1fr_180px_120px_120px_180px] gap-4 px-6 py-5 items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3.5 w-64" />
                    </div>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-9 w-36" />
                  </div>
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#555]">
                <Search size={36} className="mb-3 opacity-30" />
                <p className="text-base">No reports found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="grid grid-cols-[1fr_180px_120px_120px_180px] gap-4 px-6 py-5 items-start hover:bg-white/2 transition-colors"
                  >
                    {/* Report subject + description */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          report.resource_type === "user"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-purple-500/10 text-purple-400"
                        }`}>
                          {report.resource_type}
                        </span>
                        <p className="text-white text-sm font-medium font-mono break-all">
                          {report.resource?.title ?? report.resource?.display_name ?? report.resource_id}
                        </p>
                      </div>
                      {report.description && (
                        <p className="text-[#666] text-sm leading-relaxed line-clamp-2 mt-1">
                          "{report.description}"
                        </p>
                      )}
                      <p className="text-[#555] text-xs mt-1.5 font-mono">
                        {new Date(report.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    {/* Reporter */}
                    <div className="min-w-0">
                      <p className="text-[#ccc] text-sm font-medium truncate">
                        {report.reported_by_name ?? report.reported_by?.display_name ?? "Unknown"}
                      </p>
                      {report.reported_by_email && (
                        <p className="text-[#555] text-xs truncate mt-0.5">{report.reported_by_email}</p>
                      )}
                    </div>

                    <ReasonBadge reason={report.reason} />
                    <StatusBadge status={report.status} />

                    <div className="flex items-center gap-2">
                      {report.status === "pending" && (
                        <button
                          data-test={`btn-resolve-${report.id}`}
                          onClick={() => setResolveTarget(report)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff5500]/10 border border-[#ff5500]/20 text-[#ff5500] text-xs font-medium hover:bg-[#ff5500]/20 transition-all"
                        >
                          <Gavel size={12} />
                          Resolve
                        </button>
                      )}
                      <button
                        data-test={`btn-view-${report.id}`}
                        onClick={() => setResolveTarget(report)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-[#888] hover:text-white hover:bg-white/8 transition-all"
                        title="View details"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_160px_130px_180px] gap-4 px-6 py-4 border-b border-white/5">
              {["Appeal Reason", "Original Report", "Status", "Actions"].map((h) => (
                <span key={h} className="text-[#555] text-sm uppercase tracking-widest font-medium">
                  {h}
                </span>
              ))}
            </div>

            {appealsLoading ? (
              <div className="divide-y divide-white/3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[1fr_160px_130px_180px] gap-4 px-6 py-5">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-9 w-36" />
                  </div>
                ))}
              </div>
            ) : appeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#555]">
                <AlertCircle size={36} className="mb-3 opacity-30" />
                <p className="text-base">No appeals found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/3">
                {appeals.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="grid grid-cols-[1fr_160px_130px_180px] gap-4 px-6 py-5 items-center hover:bg-white/2 transition-colors"
                  >
                    <p className="text-[#ccc] text-base truncate">{appeal.appeal_reason}</p>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-[#555]" />
                      <span className="text-[#888] text-sm capitalize">
                        {appeal.original_report?.resource_type ?? "report"}
                      </span>
                    </div>
                    <StatusBadge status={appeal.status} />
                    <div>
                      {appeal.status === "pending" && (
                        <button
                          data-test={`btn-review-${appeal.id}`}
                          onClick={() => setAppealTarget(appeal)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-all"
                        >
                          <Gavel size={12} />
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {(tab === "reports" ? reportsMeta.total : appealsMeta.total) > 20 && (
          <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[#555] text-xs">
              Showing {tab === "reports" ? reports.length : appeals.length} of{" "}
              {tab === "reports" ? reportsMeta.total : appealsMeta.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                data-test="btn-prev-page"
                className="px-3 py-1.5 rounded-lg bg-white/5 text-[#888] text-xs hover:text-white disabled:opacity-30"
                disabled
              >
                Previous
              </button>
              <button
                data-test="btn-next-page"
                className="px-3 py-1.5 rounded-lg bg-white/5 text-[#888] text-xs hover:text-white disabled:opacity-30"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ResolveModal
        report={resolveTarget}
        onClose={() => setResolveTarget(null)}
        onConfirm={handleResolve}
      />
      <AppealModal
        appeal={appealTarget}
        onClose={() => setAppealTarget(null)}
        onConfirm={handleAppealDecision}
      />
    </div>
  );
};

export default AdminReportsPage;
