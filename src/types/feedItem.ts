import type { Track } from "@/types/track";
import type { User } from "@/types/user";
import type { FeedPlaylist } from "@/types/feedPlaylist";

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
  playlist: FeedPlaylist;
}

export type FeedItem = TrackFeedItem | PlaylistFeedItem;
