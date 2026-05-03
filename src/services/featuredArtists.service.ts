import type { MockUser } from "@/services/mocks/users";
import { getUserById, type PublicUser } from "@/services/user.service";

export type FeaturedArtistSource = {
  id?: string | null;
  artistId?: string | null;
  artist_id?: string | null;
  user_id?: string | null;
  artist_username?: string | null;
  artistUsername?: string | null;
};

function isArtistFollowed(
  currentUser: { following_ids?: string[] } | null | undefined,
  profile: PublicUser,
): boolean {
  if (!currentUser) return false;

  const followingIds = currentUser.following_ids ?? [];
  const candidates = [profile.id, profile.username].filter(Boolean) as string[];
  return candidates.some((candidate) => followingIds.includes(candidate));
}

function toFeaturedArtist(
  profile: PublicUser,
  trackCount: number,
  currentUser: { following_ids?: string[] } | null | undefined,
): MockUser {
  return {
    id: profile.id,
    username: profile.username ?? profile.display_name,
    displayName: profile.display_name,
    avatarUrl:
      profile.profile_picture ??
      `https://picsum.photos/seed/${encodeURIComponent(profile.id)}/100/100`,
    followerCount: profile.followers_count ?? 0,
    trackCount,
    isFollowing: isArtistFollowed(currentUser, profile),
  };
}

export async function getFeaturedArtists(
  sources: FeaturedArtistSource[],
  currentUser: { following_ids?: string[] } | null | undefined,
  limit = 3,
): Promise<MockUser[]> {
  const counts = new Map<string, number>();

  for (const source of sources) {
    const artistId =
      source.artistId?.trim() ??
      source.artist_id?.trim() ??
      source.user_id?.trim() ??
      source.artist_username?.trim() ??
      source.artistUsername?.trim() ??
      source.id?.trim() ??
      "";

    if (!artistId) continue;
    counts.set(artistId, (counts.get(artistId) ?? 0) + 1);
  }

  const artistEntries = Array.from(counts.entries()).slice(0, limit);
  const profiles = await Promise.all(
    artistEntries.map(([artistId]) => getUserById(artistId).catch(() => null)),
  );

  return profiles
    .map((profile, index) =>
      profile ? toFeaturedArtist(profile, artistEntries[index][1], currentUser) : null,
    )
    .filter((artist): artist is MockUser => Boolean(artist));
}
