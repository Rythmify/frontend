import axios from "axios";
import type { MockUser } from "../mocks/users";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
});

/** GET /api/users */
export async function getUsers(): Promise<MockUser[]> {
  const { data } = await api.get<MockUser[]>("/users");
  return Array.isArray(data) ? data : [];
}

/** GET /api/users/:username */
export async function getUserByUsername(username: string): Promise<MockUser> {
  const { data } = await api.get<MockUser>(`/users/${username}`);
  return data;
}

/** POST /api/users/:username/follow */
export async function followUser(
  username: string
): Promise<{ following: boolean; followerCount: number }> {
  const { data } = await api.post(`/users/${username}/follow`);
  return data;
}

/** DELETE /api/users/:username/follow */
export async function unfollowUser(
  username: string
): Promise<{ following: boolean; followerCount: number }> {
  const { data } = await api.delete(`/users/${username}/follow`);
  return data;
}