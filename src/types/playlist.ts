import type { Track } from "./track";

export interface Playlist {
  id: number;
  title: string;
  /** Username (slug) of the playlist creator */
  creatorUsername: string;
  /** Display name of the playlist creator */
  creatorName: string;
  /** URL of the playlist cover art */
  coverUrl?: string;
  /** ISO-8601 or human-friendly string, e.g. "2 months ago" */
  postedAt: string;
  /** Total number of tracks in the playlist */
  trackCount: number;
  likeCount?: number;
  repostCount?: number;
  /** URL-friendly slug for the playlist detail page */
  playlistSlug?: string;
  /** Whether the playlist is private */
  isPrivate?: boolean;
  /** Preview tracks rendered inside the card (first N items) */
  tracks: Track[];
}
