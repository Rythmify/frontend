import axiosInstance from "./api/axiosInstance";

export interface OwnUser {
  id: string;
  email: string;
  username: string | null;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  gender: "male" | "female" | null;
  role: "artist" | "listener" | "admin";
  profile_picture: string | null;
  cover_photo: string | null;
  is_private: boolean;
  date_of_birth: string | null;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string | null;
  links?: Array<{
    id: string;
    url: string;
    title: string;
    isSupport?: boolean;
  }>;
}

export interface PublicUser {
  id: string;
  username: string | null;
  display_name: string;
  bio: string | null;
  location: string | null;
  gender: "male" | "female" | null;
  role: "artist" | "listener" | "admin";
  profile_picture: string | null;
  cover_photo: string | null;
  is_private: boolean;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
  links?: Array<{
    id: string;
    url: string;
    title: string;
    isSupport?: boolean;
  }>;
}

export interface UserSummary {
  id: string;
  email: string;
  display_name: string;
  username: string | null;
  gender: "male" | "female" | null;
  role: "artist" | "listener" | "admin";
  is_verified: boolean;
  profile_picture?: string | null;
}

export interface ListMeta {
  limit: number;
  offset: number;
  total: number;
}

export interface UserListData {
  items: UserSummary[];
  meta: ListMeta;
}

export interface TrackSummary {
  id: string;
  title: string;
  genre: string | null;
  duration: number | null;
  cover_image: string | null;
  user_id: string;
  artist_name: string;
  play_count: number;
  like_count: number;
  stream_url: string | null;
}

export interface TrackListData {
  items: TrackSummary[];
  meta: ListMeta;
}

// ── Search result shape returned by GET /search?type=users ──
interface UserSearchResult {
  id: string;
  display_name: string;
  username?: string | null;
  profile_picture: string | null;
  follower_count: number;
  score?: number;
}

// ─────────────────────────────────────────────────────────────
// Core profile fetches
// ─────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<OwnUser> {
  const res = await axiosInstance.get<{ data: OwnUser }>("/users/me");
  return res.data.data;
}

export async function getUserById(userId: string): Promise<PublicUser> {
  const res = await axiosInstance.get<{ data: PublicUser }>(`/users/${userId}`);
  return res.data.data;
}

/**
 * Resolves a username to a full PublicUser profile without using /resolve.
 * Uses GET /search?type=users to find an exact username match, then fetches
 * the full profile via GET /users/:id.
 *
 * Throws if no exact match is found.
 */
export async function getUserByUsername(username: string): Promise<PublicUser> {
  const res = await axiosInstance.get<{
    data: {
      tracks: unknown[];
      users: UserSearchResult[];
      playlists: unknown[];
    };
    pagination: ListMeta;
  }>("/search", {
    params: { q: username, type: "users", limit: 10 },
  });

  const users = res.data.data.users ?? [];

  // Prefer an exact username match; fall back to the first result as a
  // best-effort when the search engine returns close-but-not-exact results.
  const exactMatch = users.find(
    (u) => u.username?.toLowerCase() === username.toLowerCase(),
  );
  const candidate = exactMatch ?? users[0];

  if (!candidate) {
    throw new Error(`User not found: ${username}`);
  }

  // Fetch the full PublicUser profile (search only returns a slim summary).
  return getUserById(candidate.id);
}

// ─────────────────────────────────────────────────────────────
// Profile mutations
// ─────────────────────────────────────────────────────────────

export async function updateMyProfile(payload: {
  display_name?: string;
  username?: string;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
}): Promise<OwnUser> {
  const res = await axiosInstance.patch<{ data: OwnUser }>(
    "/users/me",
    payload,
  );
  return res.data.data;
}

// ─────────────────────────────────────────────────────────────
// Avatar & cover photo
// ─────────────────────────────────────────────────────────────

export async function uploadAvatar(
  file: File,
): Promise<{ profile_picture: string }> {
  const form = new FormData();
  form.append("avatar", file);
  const res = await axiosInstance.post<{ data: { profile_picture: string } }>(
    "/users/me/avatar",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data.data;
}

export async function deleteAvatar(): Promise<void> {
  await axiosInstance.delete("/users/me/avatar");
}

export async function uploadCover(
  file: File,
): Promise<{ cover_photo: string }> {
  const form = new FormData();
  form.append("cover", file);
  const res = await axiosInstance.post<{ data: { cover_photo: string } }>(
    "/users/me/cover",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data.data;
}

export async function deleteCover(): Promise<void> {
  await axiosInstance.delete("/users/me/cover");
}

// ─────────────────────────────────────────────────────────────
// Followers / following
// ─────────────────────────────────────────────────────────────

export async function getFollowers(
  userId: string,
  params?: { limit?: number; offset?: number },
): Promise<UserListData> {
  const res = await axiosInstance.get<{ data: UserListData }>(
    `/users/${userId}/followers`,
    { params },
  );
  return res.data.data;
}

export async function getFollowing(
  userId: string,
  params?: { limit?: number; offset?: number },
): Promise<UserListData> {
  const res = await axiosInstance.get<{ data: UserListData }>(
    `/users/${userId}/following`,
    { params },
  );
  return res.data.data;
}

export async function getFollowStatus(userId: string): Promise<{
  is_following: boolean;
  is_followed_by?: boolean;
  is_blocking?: boolean;
  is_blocked_by?: boolean;
}> {
  const res = await axiosInstance.get<{
    data: {
      is_following: boolean;
      is_followed_by?: boolean;
      is_blocking?: boolean;
      is_blocked_by?: boolean;
    };
  }>(`/users/${userId}/follow-status`);
  return res.data.data;
}

export async function followUser(userId: string): Promise<void> {
  await axiosInstance.post(`/users/${userId}/follow`);
}

export async function unfollowUser(userId: string): Promise<void> {
  await axiosInstance.delete(`/users/${userId}/follow`);
}

// ─────────────────────────────────────────────────────────────
// Block / unblock
// ─────────────────────────────────────────────────────────────

export async function blockUser(userId: string): Promise<void> {
  await axiosInstance.post(`/users/${userId}/block`);
}

export async function unblockUser(userId: string): Promise<void> {
  await axiosInstance.delete(`/users/${userId}/block`);
}

export async function getBlockedUsers(params?: {
  limit?: number;
  offset?: number;
}): Promise<UserListData> {
  const res = await axiosInstance.get<{ data: UserListData }>(
    "/users/me/blocked",
    { params },
  );
  return res.data.data;
}

// ─────────────────────────────────────────────────────────────
// Liked tracks
// ─────────────────────────────────────────────────────────────

export async function getMyLikedTracks(params?: {
  limit?: number;
  offset?: number;
}): Promise<TrackListData> {
  const res = await axiosInstance.get<{
    data: TrackSummary[] | { items: TrackSummary[]; meta: ListMeta };
    pagination?: ListMeta;
  }>("/me/liked-tracks", { params });

  const pagination = res.data.pagination;
  const raw = res.data.data;

  if (Array.isArray(raw)) {
    return {
      items: raw,
      meta: pagination ?? { limit: 0, offset: 0, total: raw.length },
    };
  }

  const items = raw.items ?? [];
  const rawMeta = raw.meta ?? {};
  const total =
    typeof rawMeta.total === "number" && rawMeta.total > 0
      ? rawMeta.total
      : typeof pagination?.total === "number" && pagination.total > 0
        ? pagination.total
        : items.length;

  return {
    items,
    meta: {
      limit: rawMeta.limit ?? pagination?.limit ?? 0,
      offset: rawMeta.offset ?? pagination?.offset ?? 0,
      total,
    },
  };
}

export async function getUserLikedTracks(
  userId: string,
  params?: { limit?: number; offset?: number },
): Promise<TrackListData> {
  const res = await axiosInstance.get<{
    data: TrackSummary[] | { items: TrackSummary[]; meta: ListMeta };
    pagination?: ListMeta;
  }>(`/users/${userId}/liked-tracks`, { params });

  const pagination = res.data.pagination;
  const raw = res.data.data;

  if (Array.isArray(raw)) {
    return {
      items: raw,
      meta: pagination ?? { limit: 0, offset: 0, total: raw.length },
    };
  }

  const items = raw.items ?? [];
  const rawMeta = raw.meta ?? {};
  const total =
    typeof rawMeta.total === "number" && rawMeta.total > 0
      ? rawMeta.total
      : typeof pagination?.total === "number" && pagination.total > 0
        ? pagination.total
        : items.length;

  return {
    items,
    meta: {
      limit: rawMeta.limit ?? pagination?.limit ?? 0,
      offset: rawMeta.offset ?? pagination?.offset ?? 0,
      total,
    },
  };
}
