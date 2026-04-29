import axiosInstance from '../axiosInstance';

// ─── Shared Types ─────────────────────────────────────────────────────────────

export type NotificationType = 'follow' | 'like' | 'repost' | 'comment' | 'new_post_by_followed';

export interface NotificationActor {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
}

export interface NotificationResourceDetails {
  title?: string;
  content?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  actor: NotificationActor;
  resource_type: 'track' | 'user' | 'playlist' | 'comment'|'new_post_by_followed' | null  
  resource_id: string | null;
  resource_details: NotificationResourceDetails | null;
  is_read: boolean;
  created_at: string;
}

export interface Pagination {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface NotificationListResponse {
  success: boolean;
  data: {
    items: Notification[];
    pagination: Pagination;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

export interface SuccessMessageResponse {
  data: {
    success: boolean;
  };
  message: string;
}

export interface FollowStatus {
  is_following: boolean;
  is_followed_by: boolean;
  is_blocking: boolean;
  is_blocked_by: boolean;
}

// ─── Following Types ──────────────────────────────────────────────────────────

export interface FollowingUser {
  id: string;
  username: string;
  display_name: string;
  profile_picture: string | null;
  is_verified: boolean;
}

export interface FollowingSearchResponse {
  success: boolean;
  data: {
    items: FollowingUser[];
    pagination: Pagination;
  };
}

// ─── Follow Types ─────────────────────────────────────────────────────────────

export interface FollowData {
  follower_id: string;
  followed_id: string;
  created_at: string;
}

/** 201 — followed successfully */
export interface FollowCreatedResponse {
  data: FollowData;
  message: string;
}

/** 200 — already following */
export interface FollowAlreadyExistsResponse {
  message: string;
}

// ─── Block Types ──────────────────────────────────────────────────────────────

export interface BlockData {
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

/** 201 — user was blocked successfully */
export interface BlockCreatedResponse {
  data: BlockData;
  message: string;
}

/** 200 — user was already blocked, no change */
export interface BlockAlreadyExistsResponse {
  message: string;
}

// ─── Report Types ─────────────────────────────────────────────────────────────

export type ReportResourceType = 'track' | 'user';
export type ReportReason =
  | 'copyright'
  | 'inappropriate'
  | 'spam'
  | 'impersonation';

export interface ReportRequest {
  resource_type: ReportResourceType;
  resource_id: string;
  reason: ReportReason;
  description?: string;
}

export interface Report {
  id: string;
  resource_type: ReportResourceType;
  resource_id: string;
  reason: ReportReason;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface ReportCreatedResponse {
  data: Report;
  message: string;
}

// ─── Notification API Functions ───────────────────────────────────────────────

// GET /notifications
export const fetchNotifications = async (
  page: number = 1,
  limit: number = 50,
  type?: NotificationType
): Promise<NotificationListResponse> => {
  const response = await axiosInstance.get<NotificationListResponse>(
    '/notifications',
    { params: { page, limit, ...(type ? { type } : {}) },
  headers: { 'Cache-Control': 'no-cache' },
 }
  );
  return response.data;
};

// GET /notifications/unread-count
export const fetchUnreadNotificationCount =
  async (): Promise<UnreadCountResponse> => {
    const response = await axiosInstance.get<UnreadCountResponse>(
      '/notifications/unread-count'
    );
    return response.data;
  };

// POST /notifications/read-all
export const markAllNotificationsRead =
  async (): Promise<SuccessMessageResponse> => {
    const response = await axiosInstance.post<SuccessMessageResponse>(
      '/notifications/read-all'
    );
    return response.data;
  };

// PATCH /notifications/:notificationId/read
export const markNotificationRead = async (
  notificationId: string
): Promise<SuccessMessageResponse> => {
  const response = await axiosInstance.patch<SuccessMessageResponse>(
    `/notifications/${notificationId}/read`
  );
  return response.data;
};

// DELETE /notifications/:notificationId
export const deleteNotification = async (
  notificationId: string
): Promise<SuccessMessageResponse> => {
  const response = await axiosInstance.delete<SuccessMessageResponse>(
    `/notifications/${notificationId}`
  );
  return response.data;
};

// ─── Following API Functions ──────────────────────────────────────────────────

// GET /users/me/following
export const fetchMyFollowing = async (
  q?: string,
  limit: number = 10,
  offset: number = 0
): Promise<FollowingSearchResponse> => {
  const response = await axiosInstance.get<FollowingSearchResponse>(
    '/users/me/following',
    { params: { ...(q ? { q } : {}), limit, offset } }
  );
  return response.data;
};

// POST /users/:userId/follow
export const followUser = async (
  userId: string
): Promise<FollowCreatedResponse | FollowAlreadyExistsResponse> => {
  const response = await axiosInstance.post<
    FollowCreatedResponse | FollowAlreadyExistsResponse
  >(`/users/${userId}/follow`);

  return response.data;
};

// DELETE /users/:userId/follow
export const unfollowUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}/follow`);
};

// ─── Block API Functions ──────────────────────────────────────────────────────

// POST /users/:userId/block
export const blockUser = async (
  userId: string
): Promise<BlockCreatedResponse | BlockAlreadyExistsResponse> => {
  const response = await axiosInstance.post<
    BlockCreatedResponse | BlockAlreadyExistsResponse
  >(`/users/${userId}/block`);

  return response.data;
};

// DELETE /users/:userId/block
export const unblockUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}/block`);
};

// ─── Report API Functions ─────────────────────────────────────────────────────

// POST /reports
export const submitReport = async (
  payload: ReportRequest
): Promise<ReportCreatedResponse> => {
  const response = await axiosInstance.post<ReportCreatedResponse>(
    '/reports',
    payload
  );
  return response.data;
};

export interface FollowStatusResponse {
  data: FollowStatus;
}

export const fetchFollowStatus = async (userId: string): Promise<FollowStatusResponse> => {
  const response = await axiosInstance.get<FollowStatusResponse>(
    `/users/${userId}/follow-status`
  );
  return response.data;
};