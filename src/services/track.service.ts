import axiosInstance from "./api/axiosInstance";
import type { Track } from "../../src/types/track";

/** GET /tracks */
export async function getTracks(): Promise<Track[]> {
  const { data } = await axiosInstance.get<{ data: Track[] }>("/tracks");
  return data.data;
}

/** GET /tracks/:id */
export async function getTrackById(id: string): Promise<Track> {
  const { data } = await axiosInstance.get<{ data: Track }>(`/tracks/${id}`);
  return data.data;
}

/** GET /:username/:slug — resolves via /resolve then fetches track */
export async function getTrackBySlug(
  username: string,
  slug: string
): Promise<Track> {
  const appUrl = import.meta.env.VITE_APP_URL ?? "https://rythmify.com";
  const permalink = `${appUrl}/${username}/${slug}`;

  const resolveRes = await axiosInstance.get<{ data: { type: string; id: string } }>(
    `/resolve?url=${encodeURIComponent(permalink)}`
  );

  const trackId = resolveRes.data.data.id;
  const { data } = await axiosInstance.get<{ data: Track }>(`/tracks/${trackId}`);
  return data.data;
}

/** No related tracks endpoint in API — returns empty array */
export async function getRelatedTracks(_trackId: string): Promise<Track[]> {
  return [];
}

/** GET /tracks/:id/comments */
export async function getTrackComments(trackId: string) {
  const { data } = await axiosInstance.get(`/tracks/${trackId}/comments`);
  return data?.data?.items ?? [];
}

/** POST /tracks/:id/comments */
export async function postComment(
  trackId: string,
  text: string,
  timestamp: number
) {
  const { data } = await axiosInstance.post(`/tracks/${trackId}/comments`, {
    content: text,
    track_timestamp: Math.floor(timestamp),
  });
  return data;
}