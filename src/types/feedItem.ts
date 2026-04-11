import type { Track } from "@/types/track";
import type { User } from "@/types/user";
import type { Playlist } from "@/types/playlist";

interface FeedItemBase {
  id: string;
  type: "post" | "repost";
  created_at: string;
  user: User;
}

export interface TrackFeedItem extends FeedItemBase {
  content_type: "track";
  track: Track;
}

export interface PlaylistFeedItem extends FeedItemBase {
  content_type: "playlist";
  playlist: Playlist;
}

export type FeedItem = TrackFeedItem | PlaylistFeedItem;
