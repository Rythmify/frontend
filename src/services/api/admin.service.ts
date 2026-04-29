import axiosInstance from "./axiosInstance";

export type AnalyticsPeriod = "day" | "week" | "month";
export type ReportStatus = "pending" | "resolved" | "dismissed";
export type ReportReason = "copyright" | "inappropriate" | "spam" | "impersonation";
export type AppealStatus = "pending" | "upheld" | "overturned";
export type WarnReason = "copyright_strike" | "repeated_reports" | "content_policy_violation" | "spam";

export interface AnalyticsSummary {
  period: string;
  active_users: number;
  new_registrations: number;
  total_tracks: number;
  total_plays: number;
  play_through_rate: number;
  storage_used_gb: number;
  storage_limit_gb: number;
  pending_reports: number;
  suspended_accounts: number;
}

export interface ReportResource {
  id: string;
  title?: string | null;
  display_name?: string | null;
}

export interface ReportedBy {
  id: string;
  display_name: string;
}

export interface Report {
  id: string;
  resource_type: "track" | "user";
  resource_id: string;
  reason: ReportReason;
  status: ReportStatus;
  created_at: string;
}

export interface ReportDetailed extends Report {
  description?: string;
  resource?: ReportResource;
  reported_by?: ReportedBy;
  reported_by_name?: string;
  reported_by_email?: string;
  resolved_at?: string | null;
  admin_note?: string | null;
}

export interface ReportAppeal {
  id: string;
  report_id: string;
  user_id: string;
  appeal_reason: string;
  status: AppealStatus;
  admin_notes?: string | null;
  decision_made_by?: string | null;
  decided_at?: string | null;
  created_at: string;
  original_report?: {
    id: string;
    reason: string;
    resource_type: string;
  };
}

export interface ListMeta {
  limit: number;
  offset: number;
  total: number;
}

// Analytics
export const getAdminAnalytics = async (period: AnalyticsPeriod = "month") => {
  const res = await axiosInstance.get<{ data: AnalyticsSummary }>("/admin/analytics", {
    params: { period },
  });
  return res.data.data;
};

// Reports
export const listAdminReports = async (params?: {
  status?: ReportStatus;
  reason?: ReportReason;
  limit?: number;
  offset?: number;
}) => {
  const res = await axiosInstance.get<{ data: ReportDetailed[]; pagination: ListMeta }>(
    "/admin/reports",
    { params }
  );
  return res.data;
};

export const getAdminReport = async (id: string) => {
  const res = await axiosInstance.get<{ data: ReportDetailed }>(`/admin/reports/${id}`);
  return res.data.data;
};

export const resolveAdminReport = async (
  id: string,
  payload: { status: "resolved" | "dismissed"; admin_note?: string }
) => {
  const res = await axiosInstance.patch(`/admin/reports/${id}`, payload);
  return res.data;
};

// Tracks
export const adminDeleteTrack = async (id: string) => {
  await axiosInstance.delete(`/admin/tracks/${id}`);
};

export const adminToggleTrackVisibility = async (
  id: string,
  payload: { is_hidden: boolean; reason?: string }
) => {
  const res = await axiosInstance.patch(`/admin/tracks/${id}`, payload);
  return res.data;
};

// Users
export const adminSuspendUser = async (id: string, reason: string) => {
  const res = await axiosInstance.patch(`/admin/users/${id}/suspend`, { reason });
  return res.data;
};

export const adminReinstateUser = async (id: string) => {
  const res = await axiosInstance.patch(`/admin/users/${id}/reinstate`);
  return res.data;
};

export const adminWarnUser = async (
  id: string,
  payload: { reason: WarnReason; message?: string }
) => {
  const res = await axiosInstance.post(`/admin/users/${id}/warn`, payload);
  return res.data;
};

// Appeals
export const listReportAppeals = async (params?: {
  status?: AppealStatus;
  limit?: number;
  offset?: number;
}) => {
  const res = await axiosInstance.get<{ data: ReportAppeal[]; pagination: ListMeta }>(
    "/admin/appeals",
    { params }
  );
  return res.data;
};

export const reviewAppeal = async (
  id: string,
  payload: { decision: "upheld" | "overturned"; admin_notes?: string }
) => {
  const res = await axiosInstance.patch(`/admin/appeals/${id}`, payload);
  return res.data;
};
