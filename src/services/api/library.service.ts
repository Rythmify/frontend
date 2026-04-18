import axiosInstance from "./axiosInstance";

// ─── Types ────────────────────────────────────────────────

export interface LibraryPlaylist {
  playlist_id: string;
  owner_user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  track_count: number;
  like_count: number;
  cover_image: string | null;
}

export interface FollowingUser {
  id: string;
  display_name: string;
  username: string;
  profile_picture: string | null;
  is_verified: boolean;
  followers_count?: number;
}

// ─── Services ─────────────────────────────────────────────

export async function getMyPlaylists(): Promise<LibraryPlaylist[]> {
  const res = await axiosInstance.get<{
    data: { items: LibraryPlaylist[] };
  }>("/playlists?mine=true");
  return res.data.data.items;
}

export async function getMyFollowing(): Promise<FollowingUser[]> {
  const res = await axiosInstance.get<{
    data: { items: FollowingUser[]; total: number };
  }>("/users/me/following");
  return res.data.data.items;
}
