export interface TrackComment {
  id: string | number;
  userId: string;
  username: string;
  avatarUrl: string;
  text: string;
  /** Seconds from start of track */
  timestampSec: number;
}
