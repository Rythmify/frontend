import type { Track } from "@/types/track";

export interface FeedPlaylist {
  id: string;
  title: string;
  artistName: string;
  artistUsername: string;
  coverUrl: string;
  duration: string;
  likeCount: number;
  repostCount: number;
  playCount: number;
  commentCount: number;
  waveformData: number[]; // first track's waveform
  audioUrl: string; // first track's audio
  trackCount: number;
  tracks: Track[]; // first ~5 shown as mini rows
  createdAt: string;
}
