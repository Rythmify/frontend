import { useEffect, useState } from "react";
import {
  Users,
  Music,
  Play,
  HardDrive,
  Flag,
  UserX,
  TrendingUp,
  UserPlus,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import {
  getAdminAnalytics,
  type AnalyticsSummary,
  type AnalyticsPeriod,
} from "@/services/api/admin.service";

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
  subtext?: string;
  loading?: boolean;
}

const StatCard = ({ label, value, icon: Icon, accent, subtext, loading }: StatCardProps) => (
  <div
    className={`relative rounded-xl p-5 border overflow-hidden transition-all duration-200 hover:scale-[1.01] ${
      accent
        ? "bg-gradient-to-br from-[#ff5500]/20 to-[#ff5500]/5 border-[#ff5500]/20"
        : "bg-[#161616] border-white/5"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[#777] text-sm font-medium uppercase tracking-widest truncate">{label}</p>
        {loading ? (
          <Skeleton className="h-8 w-24 mt-2" />
        ) : (
          <p
            className={`text-3xl font-bold mt-1 tabular-nums ${
              accent ? "text-[#ff5500]" : "text-white"
            }`}
          >
            {value}
          </p>
        )}
        {subtext && !loading && (
          <p className="text-[#555] text-sm mt-1 truncate">{subtext}</p>
        )}
      </div>
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
          accent ? "bg-[#ff5500]/20" : "bg-white/5"
        }`}
      >
        <Icon size={20} className={accent ? "text-[#ff5500]" : "text-[#888]"} />
      </div>
    </div>
  </div>
);

// ─── Storage Bar ─────────────────────────────────────────────────────────────
const StorageBar = ({
  used,
  total,
  loading,
}: {
  used: number;
  total: number;
  loading: boolean;
}) => {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const color = pct > 85 ? "#ef4444" : pct > 60 ? "#f59e0b" : "#ff5500";

  return (
    <div className="rounded-xl bg-[#161616] border border-white/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive size={16} className="text-[#888]" />
          <span className="text-white text-sm font-medium">Storage Usage</span>
        </div>
        {loading ? (
          <Skeleton className="h-4 w-20" />
        ) : (
          <span className="text-[#999] text-sm">
            {used.toFixed(1)} GB / {total.toFixed(1)} GB
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-2 w-full" />
      ) : (
        <>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
          <p className="text-[#555] text-sm mt-2">{pct.toFixed(1)}% used</p>
        </>
      )}
    </div>
  );
};

// ─── Period Toggle ────────────────────────────────────────────────────────────
const periods: { label: string; value: AnalyticsPeriod }[] = [
  { label: "Today", value: "day" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (p: AnalyticsPeriod, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await getAdminAnalytics(p);
      setData(res);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string; error?: { message?: string } } }; message?: string };
      const status = e?.response?.status;
      const msg = e?.response?.data?.error?.message ?? e?.response?.data?.message ?? e?.message ?? "Unknown error";
      setError(`Analytics API error ${status ?? "(network)"}: ${msg}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const fmt = (n?: number) => (n == null ? "—" : n.toLocaleString());
  const pct = (n?: number) => (n == null ? "—" : `${n.toFixed(1)}%`);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>
          <p className="text-[#666] text-base mt-1">Monitor platform health and key metrics</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period pills */}
          <div className="flex items-center gap-1 bg-[#161616] border border-white/5 rounded-lg p-1">
            {periods.map((p) => (
              <button
                key={p.value}
                data-test={`period-btn-${p.value}`}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  period === p.value
                    ? "bg-[#ff5500] text-white"
                    : "text-[#888] hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            data-test="btn-refresh"
            onClick={() => fetchData(period, true)}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#161616] border border-white/5 text-[#888] hover:text-white hover:border-white/10 transition-all duration-150 disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Error */}
      {/* {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-red-400 text-sm">
          {error}
        </div>
      )} */}

      {/* Primary stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Users"
          value={fmt(data?.active_users)}
          icon={Users}
          accent
          subtext={`${fmt(data?.new_registrations)} new this ${period}`}
          loading={loading}
        />
        <StatCard
          label="Total Tracks"
          value={fmt(data?.total_tracks)}
          icon={Music}
          loading={loading}
        />
        <StatCard
          label="Total Plays"
          value={fmt(data?.total_plays)}
          icon={Play}
          loading={loading}
        />
        <StatCard
          label="Play-Through Rate"
          value={pct(data?.play_through_rate)}
          icon={TrendingUp}
          subtext="Plays where ≥90% was heard"
          loading={loading}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="New Registrations"
          value={fmt(data?.new_registrations)}
          icon={UserPlus}
          loading={loading}
        />
        <StatCard
          label="Pending Reports"
          value={fmt(data?.pending_reports)}
          icon={Flag}
          accent={!!data?.pending_reports && data.pending_reports > 0}
          loading={loading}
        />
        <StatCard
          label="Suspended Accounts"
          value={fmt(data?.suspended_accounts)}
          icon={UserX}
          loading={loading}
        />
        <StatCard
          label="Play-Through Rate"
          value={pct(data?.play_through_rate)}
          icon={BarChart3}
          subtext="(Total Plays / Completed Plays) × 100"
          loading={loading}
        />
      </div>

      {/* Storage + formula explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StorageBar
          used={data?.storage_used_gb ?? 0}
          total={data?.storage_limit_gb ?? 1}
          loading={loading}
        />

        {/* Play-Through formula card */}
        <div className="rounded-xl bg-[#161616] border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[#ff5500]" />
            <span className="text-white text-sm font-medium">Play-Through Rate Formula</span>
          </div>
          <div className="rounded-lg bg-white/3 border border-white/5 px-4 py-3 font-mono text-sm">
            <span className="text-[#ff5500]">PTR</span>
            <span className="text-white"> = (</span>
            <span className="text-[#a8e6cf]">Total Plays</span>
            <span className="text-white"> / </span>
            <span className="text-[#ffd3a5]">Completed Plays</span>
            <span className="text-white">) × 100</span>
          </div>
          <p className="text-[#555] text-sm mt-3 leading-relaxed">
            A <strong className="text-[#888]">Completed Play</strong> is defined as a session where{" "}
            <code className="text-[#ff5500]">duration_played ≥ 90%</code> of the track duration.
          </p>
          {!loading && data && (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#ff5500] transition-all duration-700"
                  style={{ width: `${Math.min(data.play_through_rate, 100)}%` }}
                />
              </div>
              <span className="text-[#ff5500] text-sm font-bold tabular-nums w-12 text-right">
                {data.play_through_rate.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-[#161616] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users size={16} className="text-[#888]" />
          <span className="text-white text-sm font-medium">Quick Actions</span>
        </div>
        <p className="text-[#555] text-sm mb-4">Jump to common admin tasks</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Review Pending Reports", href: "/admin/reports" },
            { label: "Manage Users", href: "/admin/users" },
            { label: "Moderate Tracks", href: "/admin/tracks" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              data-test={`quick-action-${href.split("/").pop()}`}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-base text-[#ccc] hover:text-white hover:bg-white/8 hover:border-white/10 transition-all duration-150"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
