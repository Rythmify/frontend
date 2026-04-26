import { getMySubscription } from "./subscription.service";

export interface QuotaData {
  usedTracks: number;
  trackLimit: number | null; // null = unlimited
  canUpload: boolean;
  usedPlaylists: number;
  playlistLimit: number | null; // null = unlimited
  canCreatePlaylist: boolean;
}

/** GET /subscriptions/me — single call returns both plan limits and current usage */
export async function getUploadQuota(): Promise<QuotaData> {
  const { data } = await getMySubscription();
  const { usage } = data;
  return {
    usedTracks: usage.tracks_uploaded,
    trackLimit: usage.track_limit,
    canUpload: usage.can_upload_track,
    usedPlaylists: usage.playlists_created,
    playlistLimit: usage.playlist_limit,
    canCreatePlaylist: usage.can_create_playlist,
  };
}
