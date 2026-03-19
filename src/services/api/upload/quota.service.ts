import { getMyTracks } from "./track.service";
import { getMySubscription } from "./subscription.service";

export interface QuotaData {
  usedTracks: number;
  trackLimit: number | null; // null = unlimited
}

/** Fetches upload quota by combining GET /tracks/me + GET /subscriptions/me */
export async function getUploadQuota(): Promise<QuotaData> {
  const [tracksRes, subRes] = await Promise.all([
    getMyTracks({ limit: 1 }),
    getMySubscription(),
  ]);

  console.log("tracksRes:", tracksRes);
  console.log("subRes:", subRes);

  return {
    usedTracks: tracksRes.data.length,
    trackLimit: subRes.data.plan.track_limit,
  };
}
