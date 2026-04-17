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
}

export interface UserSummary {
  user_id: string;
  email: string;
  display_name: string;
  gender: "male" | "female" | null;
  role: "artist" | "listener" | "admin";
  is_verified: boolean;
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

export async function getMyProfile(): Promise<OwnUser> {
  const res = await axiosInstance.get<{ data: OwnUser }>("/users/me");
  return res.data.data;
}

export async function getUserById(userId: string): Promise<PublicUser> {
  const res = await axiosInstance.get<{ data: PublicUser }>(`/users/${userId}`);
  return res.data.data;
}

export async function resolveUsername(username: string): Promise<string> {
  const url = `${import.meta.env.VITE_APP_URL}/${username}`;
  const res = await axiosInstance.get<{
    data: { type: string; id: string; permalink: string };
  }>("/resolve", { params: { url } });
  return res.data.data.id;
}

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

export async function getFollowStatus(
  userId: string,
): Promise<{
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
  }>(
    `/users/${userId}/follow-status`,
  );
  return res.data.data;
}

export async function followUser(userId: string): Promise<void> {
  await axiosInstance.post(`/users/${userId}/follow`);
}

export async function unfollowUser(userId: string): Promise<void> {
  await axiosInstance.delete(`/users/${userId}/follow`);
}

export async function blockUser(userId: string): Promise<void> {
  await axiosInstance.post(`/users/${userId}/block`);
}

export async function unblockUser(userId: string): Promise<void> {
  await axiosInstance.delete(`/users/${userId}/block`);
}
