import axios from "axios";
import type { Track } from "../../../src/types/track";

// All requests go through axios — MSW intercepts them in dev,
// real backend handles them later
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
});

// Track endpoints 

/** GET /api/tracks */
export async function getTracks(): Promise<Track[]> {
  const { data } = await api.get<Track[]>("/tracks");
  return data;
}

/** GET /api/tracks/:id */
export async function getTrackById(id: number): Promise<Track> {
  const { data } = await api.get<Track>(`/tracks/${id}`);
  return data;
}

/** GET /api/:username/:slug */
export async function getTrackBySlug(
  username: string,
  slug: string
): Promise<Track> {
  const { data } = await api.get<Track>(`/${username}/${slug}`);
  return data;
}

/** GET /api/tracks/:id/related */
export async function getRelatedTracks(trackId: number): Promise<Track[]> {
  const { data } = await api.get<Track[]>(`/tracks/${trackId}/related`);
  return Array.isArray(data) ? data : [];
}

/** POST /api/tracks/:id/like */
export async function likeTrack(
  id: number
): Promise<{ liked: boolean; likeCount: number }> {
  const { data } = await api.post(`/tracks/${id}/like`);
  return data;
}

/** DELETE /api/tracks/:id/like */
export async function unlikeTrack(
  id: number
): Promise<{ liked: boolean; likeCount: number }> {
  const { data } = await api.delete(`/tracks/${id}/like`);
  return data;
}

/** POST /api/tracks/:id/repost */
export async function repostTrack(
  id: number
): Promise<{ reposted: boolean; repostCount: number }> {
  const { data } = await api.post(`/tracks/${id}/repost`);
  return data;
}

/** GET /api/tracks/:id/comments */
export async function getTrackComments(trackId: number) {
  const { data } = await api.get(`/tracks/${trackId}/comments`);
  return data;
}

/** POST /api/tracks/:id/comments */
export async function postComment(
  trackId: number,
  text: string,
  timestamp: number
) {
  const { data } = await api.post(`/tracks/${trackId}/comments`, {
    text,
    timestamp,
  });
  return data;
}