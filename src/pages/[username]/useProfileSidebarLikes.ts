import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLikesStore } from "@/stores/likes.store";
import {
  getMyLikedTracks,
  getUserLikedTracks,
  resolveUsername,
  type TrackSummary,
} from "@/services/user.service";

interface UseProfileSidebarLikesResult {
  likedTracks: Array<{
    id: string;
    title: string;
    artist: string;
    coverUrl?: string;
    plays?: number;
    likes?: number;
    reposts?: number;
    comments?: number;
  }>;
  likedTracksCount: number;
}

export function useProfileSidebarLikes(
  username?: string,
  isOwner = false,
): UseProfileSidebarLikesResult {
  const params = useParams();
  const effectiveUsername = username ?? params.username;
  const likedTracksStoreCount = useLikesStore((s) => s.likedTracks.length);
  const [likedTracks, setLikedTracks] = useState<Array<{
    id: string;
    title: string;
    artist: string;
    coverUrl?: string;
    plays?: number;
    likes?: number;
    reposts?: number;
    comments?: number;
  }>>([]);
  const [likedTracksCount, setLikedTracksCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadLikedTracks = async () => {
      try {
        if (isOwner) {
          const data = await getMyLikedTracks({ limit: 3 });
          const items = Array.isArray(data?.items) ? data.items : [];
          const total =
            typeof data?.meta?.total === "number" && data.meta.total > 0
              ? data.meta.total
              : items.length;

          if (cancelled) return;
          setLikedTracks(items.map(t => ({
            id: t.id,
            title: t.title,
            artist: t.artist_name,
            coverUrl: t.cover_image ?? undefined,
            plays: t.play_count,
            likes: t.like_count,
            // reposts & comments omitted until backend adds them
          })));
          setLikedTracksCount(Math.max(total, likedTracksStoreCount));
          return;
        }

        if (!effectiveUsername) {
          setLikedTracks([]);
          setLikedTracksCount(0);
          return;
        }

        const userId = await resolveUsername(effectiveUsername);
        const data = await getUserLikedTracks(userId, { limit: 3 });
        const items = Array.isArray(data?.items) ? data.items : [];
        const total =
          typeof data?.meta?.total === "number" && data.meta.total > 0
            ? data.meta.total
            : items.length;

        if (cancelled) return;
        setLikedTracks(items.map(t => ({
          id: t.id,
          title: t.title,
          artist: t.artist_name,
          coverUrl: t.cover_image ?? undefined,
          plays: t.play_count,
          likes: t.like_count,
          // reposts & comments omitted until backend adds them
        })));
        setLikedTracksCount(total);
      } catch {
        if (!cancelled) {
          setLikedTracks([]);
          setLikedTracksCount(0);
        }
      }
    };

    loadLikedTracks();

    return () => {
      cancelled = true;
    };
  }, [effectiveUsername, isOwner, likedTracksStoreCount]);

  return {
    likedTracks,
    likedTracksCount,
  };
}
