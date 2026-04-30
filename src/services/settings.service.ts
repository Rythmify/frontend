import axiosInstance from "./api/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrivacySettings {
  is_private: boolean;
  receive_messages_from_anyone: boolean;
  show_activities_in_discovery: boolean;
  show_as_top_fan: boolean;
  show_top_fans_on_tracks: boolean;
}

export interface ContentSettings {
  rss_title?: string | null;
  rss_language?: string | null;
  rss_category?: string | null;
  rss_explicit?: boolean;
  rss_show_email?: boolean;
  default_include_in_rss?: boolean;
  default_license_type?: "all_rights_reserved" | "creative_commons" | null;
}

export interface NotificationPreferences {
  new_follower_in_app: boolean;
  new_follower_push: boolean;
  new_follower_email: boolean;
  repost_of_your_post_in_app: boolean;
  repost_of_your_post_push: boolean;
  repost_of_your_post_email: boolean;
  new_post_by_followed_in_app: boolean;
  new_post_by_followed_push: boolean;
  new_post_by_followed_email: boolean;
  likes_and_plays_in_app: boolean;
  likes_and_plays_push: boolean;
  likes_and_plays_email: boolean;
  comment_on_post_in_app: boolean;
  comment_on_post_push: boolean;
  comment_on_post_email: boolean;
  recommended_content_in_app: boolean;
  recommended_content_push: boolean;
  recommended_content_email: boolean;
  new_message_email: boolean;
  new_message_push: boolean;
  messages_from: "everyone" | "followers_only" | "nobody";
  feature_updates_push: boolean;
  feature_updates_email: boolean;
  surveys_and_feedback_push: boolean;
  surveys_and_feedback_email: boolean;
  promotional_content_push: boolean;
  promotional_content_email: boolean;
  newsletter_email: boolean;
}

// ─── Privacy Settings ─────────────────────────────────────────────────────────

/** GET /users/me/privacy-settings */
export async function getPrivacySettings(): Promise<PrivacySettings> {
  const res = await axiosInstance.get<{ data: PrivacySettings }>(
    "/users/me/privacy-settings",
  );
  return res.data.data;
}

/** PATCH /users/me/privacy-settings */
export async function updatePrivacySettings(
  payload: Partial<PrivacySettings>,
): Promise<PrivacySettings> {
  const res = await axiosInstance.patch<{ data: PrivacySettings }>(
    "/users/me/privacy-settings",
    payload,
  );
  return res.data.data;
}

// ─── Content Settings ─────────────────────────────────────────────────────────

/** GET /users/me/content-settings */
export async function getContentSettings(): Promise<ContentSettings> {
  const res = await axiosInstance.get<{ data: ContentSettings }>(
    "/users/me/content-settings",
  );
  return res.data.data;
}

/** PATCH /users/me/content-settings */
export async function updateContentSettings(
  payload: Partial<ContentSettings>,
): Promise<ContentSettings> {
  const res = await axiosInstance.patch<{ data: ContentSettings }>(
    "/users/me/content-settings",
    payload,
  );
  return res.data.data;
}

// ─── Notification Preferences ─────────────────────────────────────────────────

/** GET /notifications/preferences */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const res = await axiosInstance.get<{ data: NotificationPreferences }>(
    "/notifications/preferences",
  );
  return res.data.data;
}

/** PATCH /notifications/preferences */
export async function updateNotificationPreferences(
  payload: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const res = await axiosInstance.patch<{ data: NotificationPreferences }>(
    "/notifications/preferences",
    payload,
  );
  return res.data.data;
}
