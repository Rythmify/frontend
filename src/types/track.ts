export interface Track {
  id: string;
  title: string;
  artistName: string;
  artistUsername: string; // for profile link
  coverUrl: string;
  genre: string;
  likeCount: number;
  repostCount: number;
  playCount: number;
  commentCount: number;
  duration: string;
  postedAt: string;
  waveformData: number[];
  trackSlug?: string;
  audioUrl: string;
  /** Full-quality stream URL when the API exposes it (may be omitted for preview-only or geo-masked tracks). */
  streamUrl?: string;
  /** Short preview clip when full stream is not available for this listener. */
  previewUrl?: string;
  /** True when the backend stripped playback URLs for the current region. */
  isGeoBlocked?: boolean;
  /** Backend reason when playback is limited (e.g. region_restricted). */
  playbackRestrictionReason?: string | null;
  /** When false, the artist disabled in-app playback for this track. */
  enableAppPlayback?: boolean;
  isPrivate?: boolean; // private tracks
  madeFor?: string; // made for [username]
  isLiked?: boolean;
  isReposted?: boolean;
  artistId?: string;
  isRepostedByMe?: boolean;
}
