import api from "@/services/api/axiosInstance"; // adjust to your axios import path
import type { Track } from "@/types/track";

export interface OfflineDownloadResult {
  track_id: string;
  download_url: string;
  source: "stream" | "audio";
  expires_in_seconds: number;
  expires_at: string;
}

/**
 * Validates premium entitlement and returns a download URL for the track.
 * Throws if the user is not premium or the track doesn't allow offline listening.
 */
export async function getOfflineDownloadUrl(
  trackId: string,
): Promise<OfflineDownloadResult> {
  const { data } = await api.get(`/tracks/${trackId}/offline-download`);
  return data.data as OfflineDownloadResult;
}
