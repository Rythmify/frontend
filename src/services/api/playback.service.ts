import axiosInstance from "./axiosInstance";
import type { Track } from "../../../types/track";

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
