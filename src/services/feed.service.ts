import axiosInstance from "./api/axiosInstance";
import type { FeedItem } from "../types/feedItem";

export async function getHome() {
  const { data } = await axiosInstance.get("/home");
  return data.data;
}

export async function getActivityFeed(
  limit: number = 20,
  cursor: string | null = null
): Promise<{ items: FeedItem[]; hasMore: boolean }> {
  const params: any = { limit };
  if (cursor) params.cursor = cursor;

  const { data } = await axiosInstance.get<{ data: any; hasMore: boolean }>(
    "/feed",
    { params }
  );

  // Map backend rows to FeedItem
  const items: FeedItem[] = (data.data || []).map((row: any) => {
    const contentType = row.content_type || (row.playlist_id ? "playlist" : "track");
    const itemType = row.type || row.reason_type || "post";
    
    // Mapping for Track
    if (contentType === "track") {
      return {
        id: row.id || row.track_id || Math.random().toString(),
        type: itemType.includes("repost") ? "repost" : "post",
        content_type: "track",
        created_at: row.created_at || new Date().toISOString(),
        user: {
          id: row.user_id || row.artist_id || "unknown",
          username: row.username || row.artist_username || "Unknown",
          displayName: row.display_name || row.artist_name || "Unknown User",
          avatar: row.profile_picture || row.avatar || "https://picsum.photos/seed/user/100/100",
          followers: row.followers_count || 0,
        },
        track: {
          id: row.track_id || row.id,
          title: row.title || row.track_title || "Untitled Track",
          artistName: row.artist_name || row.display_name || "Unknown",
          artistUsername: row.artist_username || row.username || "Unknown",
          coverUrl: row.cover_image || row.coverUrl || "",
          audioUrl: row.stream_url || row.audio_url || row.audioUrl || "",
          duration: (() => {
            const d = row.duration;
            if (typeof d === "number") {
              const m = Math.floor(d / 60);
              const s = Math.round(d % 60);
              return `${m}:${s.toString().padStart(2, "0")}`;
            }
            return typeof d === "string" && d ? d : "0:00";
          })(),
          genre: row.genre_name || "",
          likeCount: row.like_count || 0,
          repostCount: row.repost_count || 0,
          playCount: row.play_count || 0,
          commentCount: row.comment_count || 0,
          postedAt: row.created_at || "",
          trackSlug: row.track_slug || row.title?.toLowerCase().replace(/\s+/g, '-'),
          isPrivate: row.is_private || false,
        },
      } as FeedItem;
    }

    // Mapping for Playlist
    return {
      id: row.id || row.playlist_id || Math.random().toString(),
      type: itemType.includes("repost") ? "repost" : "post",
      content_type: "playlist",
      created_at: row.created_at || new Date().toISOString(),
      user: {
        id: row.user_id || row.creator_id || "unknown",
        username: row.username || row.creator_username || "Unknown",
        displayName: row.display_name || row.creator_name || "Unknown User",
        avatar: row.profile_picture || row.avatar || "https://picsum.photos/seed/user/100/100",
        followers: row.followers_count || 0,
      },
      playlist: {
        id: row.playlist_id || row.id,
        title: row.name || row.title || "Untitled Playlist",
        creatorName: row.creator_name || row.display_name || "Unknown",
        creatorUsername: row.creator_username || row.username || "Unknown",
        coverUrl: row.cover_image || row.coverUrl || "",
        postedAt: row.created_at || "",
        trackCount: row.track_count || 0,
        likeCount: row.like_count || 0,
        repostCount: row.repost_count || 0,
        playlistSlug: row.playlist_slug || row.slug || row.name?.toLowerCase().replace(/\s+/g, '-'),
        isPrivate: row.is_private || false,
        tracks: row.tracks || [],
      },
    } as FeedItem;
  });

  return {
    items,
    hasMore: data.hasMore || false,
  };
}

export async function getDiscoveryFeed(
  limit: number = 20,
  cursor: string | null = null
) {
  const params: any = { limit };
  if (cursor) params.cursor = cursor;

  const { data } = await axiosInstance.get("/feed/discovery", { params });
  return data;
}
