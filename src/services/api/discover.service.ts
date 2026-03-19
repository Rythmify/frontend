import axiosInstance from "./axiosInstance";
import type { Track } from "@/types/track";
import type { Mix } from "@/types/mix";

// ─── Discover API functions ───────────────────────────────────────────────────

/** GET /discover/recommended */
export const getRecommendedTracks = async (): Promise<Track[]> => {
  const res = await axiosInstance.get<{ data: Track[] }>(
    "/discover/recommended",
  );
  return res.data.data;
};

/** GET /discover/mixes */
export const getMixes = async (): Promise<Mix[]> => {
  const res = await axiosInstance.get<{ data: Mix[] }>("/discover/mixes");
  return res.data.data;
};

/** GET /user/history */
export const getListeningHistory = async (): Promise<Track[]> => {
  const res = await axiosInstance.get<{ data: Track[] }>("/user/history");
  return res.data.data;
};
