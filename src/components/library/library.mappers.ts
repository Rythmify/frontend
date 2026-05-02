import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import type { FollowingUser } from "@/services/api/library.service";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import type { User } from "@/types/user";

export function mapPlaylistToCard(p: Playlist, displayName: string): PlaylistCardData {
  return {
    id: p.playlist_id,
    title: p.name,
    owner: displayName,
    ownerUsername: p.owner_user_id,
    coverUrl: p.cover_image ?? null,
    isPrivate: !p.is_public,
    isLiked: p.like_count > 0,
  };
}

export function mapAlbumToCard(p: Playlist, displayName: string): PlaylistCardData {
  return {
    id: p.playlist_id,
    title: p.name,
    owner: displayName,
    ownerUsername: p.owner_user_id,
    coverUrl: p.cover_image ?? null,
    isPrivate: !p.is_public,
    isLiked: p.like_count > 0,
    isAlbumView: true,
  };
}

export function mapFollowingToUser(f: FollowingUser): User {
  return {
    id: f.id,
    username: f.username,
    displayName: f.display_name,
    avatar: f.profile_picture ?? undefined,
    followers: f.followers_count ?? 0,
    isVerified: f.is_verified,
  };
}
