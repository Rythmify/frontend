import type { Track } from "../../types/track";

export interface TrackComment {
  id: string | number;
  userId: string;
  username: string;
  avatarUrl: string;
  text: string;
  /** Seconds from start of track */
  timestampSec: number;
}

export interface TrackCardProps {
  track: Track;
  contextQueue?: Track[];
  repostedBy?: string;
  disableComments?: boolean;
  onCopyLink?: () => void | Promise<void>;
  onAddToPlaylist?: () => void | Promise<void>;
  onEdit?: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onReplaceFile?: () => void | Promise<void>;
  onDistribute?: () => void | Promise<void>;
}
