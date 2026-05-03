import axiosInstance from "./axiosInstance";
import type { Track } from "@/types/track";

export interface PlayerStateResponse {
  track_id: string | null;
  position_seconds: number;
  volume: number;
  queue: any[];
  // Metadata fields returned by enrich
  stream_url?: string;
  track_title?: string;
  artist_name?: string;
  duration?: number;
}

export const getPlayerState = async (): Promise<PlayerStateResponse | null> => {
  try {
    const res = await axiosInstance.get("/me/player/state");
    return res.data.data;
  } catch (err) {
    console.error("Failed to fetch player state:", err);
    return null;
  }
};

export const savePlayerState = async (state: {
  trackId?: string | null;
  positionSeconds?: number;
  volume?: number;
  queue?: string[]; // Backend accepts array of track IDs
}) => {
  try {
    const res = await axiosInstance.post("/me/player/state", {
      track_id: state.trackId,
      position_seconds: state.positionSeconds,
      volume: state.volume,
      queue: state.queue,
    });
    return res.data.data;
  } catch (err) {
    console.error("Failed to save player state:", err);
    return null;
  }
};

export interface QueueContextParams {
  interaction_type: "play" | "next_up";
  source_type: string;
  source_id: string | null;
  target_user_id: string | null;
}

export const postQueueContext = async (params: QueueContextParams): Promise<PlayerStateResponse | null> => {
  try {
    const res = await axiosInstance.post("/me/player/queue/context", params);
    return res.data?.data || res.data;
  } catch (err) {
    console.error("Failed to post queue context:", err);
    throw err;
  }
};
