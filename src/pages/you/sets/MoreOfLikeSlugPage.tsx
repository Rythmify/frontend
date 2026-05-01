import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "@/components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActions from "@/components/playlist/Made for you/PlaylistActionsForYou";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import {
  type PlaylistDetails,
  type PlaylistTrackItem,
  getRadioTracks,
} from "@/services/api/playlist/playlist.service";
import { getRelatedTracks, getTrackById } from "@/services/track.service";
import { getUserById, type PublicUser } from "@/services/user.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { Track } from "../../../types/track";
import type { MockUser } from "../../../services/mocks/users";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseDuration(duration?: string): number | null {
  if (!duration) return null;
  const parts = duration.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function trackDurationSeconds(track: Track | null) {
  return parseDuration(track?.duration) ?? 0;
}

function toPlaylistTrackItem(
  track: Track,
  position: number,
): PlaylistTrackItem {
  return {
    track_id: track.id,
    position,
    added_at: track.postedAt || new Date().toISOString(),
    title: track.title,
    duration: parseDuration(track.duration),
    cover_image: track.coverUrl || null,
    is_public: !track.isPrivate,
    deleted_at: null,
    artist_name: track.artistName || null,
    artist_username: track.artistUsername || null,
    audio_url: track.audioUrl || null,
    play_count: track.playCount ?? 0,
  };
}

function getTopArtistTrackCounts(tracks: Track[]): [string, number][] {
  const counts = new Map<string, number>();

  for (const track of tracks) {
    const artistId = track.artistId?.trim();
    if (!artistId) continue;
    counts.set(artistId, (counts.get(artistId) ?? 0) + 1);
  }

  return Array.from(counts.entries());
}

function getTopArtistTrackCountsFromRadioTracks(
  tracks: Awaited<ReturnType<typeof getRadioTracks>>["tracks"],
): [string, number][] {
  const counts = new Map<string, number>();

  for (const track of tracks) {
    const artistId = track.user_id?.trim();
    if (!artistId) continue;
    counts.set(artistId, (counts.get(artistId) ?? 0) + 1);
  }

  return Array.from(counts.entries());
}

function isArtistFollowed(
  currentUser: { following_ids: string[] } | null,
  profile: PublicUser,
): boolean {
  if (!currentUser) return false;

  const followingIds = currentUser.following_ids ?? [];
  const candidates = [profile.id, profile.username].filter(Boolean) as string[];
  return candidates.some((candidate) => followingIds.includes(candidate));
}

function toFeaturedArtist(
  user: PublicUser,
  trackCount: number,
  currentUser: { following_ids: string[] } | null,
): MockUser {
  return {
    id: user.id,
    username: user.username ?? user.display_name,
    displayName: user.display_name,
    avatarUrl:
      user.profile_picture ??
      `https://picsum.photos/seed/${encodeURIComponent(user.id)}/100/100`,
    followerCount: user.followers_count ?? 0,
    trackCount,
    isFollowing: isArtistFollowed(currentUser, user),
  };
}

function buildPlaylist(
  seedTrack: Track,
  relatedTracks: Track[],
): PlaylistDetails {
  return {
    playlist_id: seedTrack.id,
    owner_user_id:
      seedTrack.artistUsername || seedTrack.artistName || seedTrack.id,
    name: seedTrack.title
      ? `Related tracks: ${seedTrack.title}`
      : "Related tracks picked for you",
    description: "More of what you like",
    is_public: true,
    cover_image: seedTrack.coverUrl || null,
    created_at: seedTrack.postedAt || new Date().toISOString(),
    updated_at: null,
    track_count: relatedTracks.length,
    like_count: 0,
    repost_count: 0,
    tracks: relatedTracks.map((track, index) =>
      toPlaylistTrackItem(track, index + 1),
    ),
  };
}

function mapRadioTrackToPlayerTrack(track: Awaited<ReturnType<typeof getRadioTracks>>["tracks"][number]): Track {
  return {
    id: track.id,
    title: track.title,
    artistName: track.artist_name ?? "Unknown Artist",
    artistUsername: track.user_id,
    coverUrl: track.cover_image ?? "",
    genre: track.genre_name ?? "",
    likeCount: track.like_count,
    repostCount: track.repost_count,
    playCount: track.play_count,
    commentCount: 0,
    duration:
      typeof track.duration === "number"
        ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, "0")}`
        : "0:00",
    postedAt: track.created_at,
    waveformData: [],
    audioUrl: track.stream_url ?? "",
  };
}

function radioTracksToPlaylistDetails(
  payload: Awaited<ReturnType<typeof getRadioTracks>>,
): PlaylistDetails {
  return {
    playlist_id: payload.playlist_id,
    owner_user_id: payload.reference_track.user_id,
    name: payload.title,
    description: payload.description,
    is_public: true,
    cover_image: payload.cover_image,
    created_at: payload.tracks[0]?.created_at ?? new Date().toISOString(),
    updated_at: null,
    track_count: payload.tracks.length,
    like_count: 0,
    repost_count: 0,
    tracks: payload.tracks.map(
      (track, index) =>
        ({
          track_id: track.id,
          position: index + 1,
          added_at: track.created_at,
          title: track.title,
          duration: track.duration,
          cover_image: track.cover_image,
          artist_name: track.artist_name,
          artist_id: track.user_id,
          is_public: true,
          deleted_at: null,
          audio_url: track.stream_url,
          play_count: track.play_count,
        }) as PlaylistTrackItem & { audio_url?: string; play_count?: number },
    ),
  };
}

function MoreOfLikeSlugPage() {
  const { username, playlistSlug } = useParams<{
    username: string;
    playlistSlug: string;
  }>();
  const { user: currentUser } = useAuthStore();
  const isRadioPlaylistRoute =
    !!playlistSlug && !playlistSlug.includes(":") && UUID_RE.test(playlistSlug);

  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredArtists, setFeaturedArtists] = useState<MockUser[]>([]);
  const [albumOwner, setAlbumOwner] = useState<PublicUser | null>(null);
  const [seedTrack, setSeedTrack] = useState<Track | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [relatedPlaylistTracks, setRelatedPlaylistTracks] = useState<
    PlaylistTrackItem[]
  >([]);

  const {
    setTrack: setPlayerTrack,
    togglePlay,
    isPlaying,
    currentTrack,
  } = usePlayerStore();

  const tracksForDisplay = useMemo(() => {
    if (!seedTrack) return relatedPlaylistTracks;

    const seedPlaylistTrack = toPlaylistTrackItem(seedTrack, 1);
    const hasSeed = relatedPlaylistTracks.some(
      (track) => track.track_id === seedPlaylistTrack.track_id,
    );

    return hasSeed
      ? relatedPlaylistTracks
      : [seedPlaylistTrack, ...relatedPlaylistTracks];
  }, [seedTrack, relatedPlaylistTracks]);

  const tracksForAddToPlaylist = tracksForDisplay;

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!playlistSlug) {
        setError("Related tracks not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const trackId = playlistSlug.includes(":")
          ? (playlistSlug.split(":").pop() ?? playlistSlug)
          : playlistSlug;
        if (isRadioPlaylistRoute) {
          const payload = await getRadioTracks(trackId);
          if (cancelled) return;

          const playlistData = radioTracksToPlaylistDetails(payload);
          setPlaylist(playlistData);
          setSeedTrack(
            mapRadioTrackToPlayerTrack(payload.reference_track),
          );
          setRelatedTracks(payload.tracks.map(mapRadioTrackToPlayerTrack));
          setRelatedPlaylistTracks(playlistData.tracks);
          const artistIds = getTopArtistTrackCountsFromRadioTracks(payload.tracks);
          const artists = await Promise.all(
            artistIds.slice(0, 3).map(async ([artistId, trackCount]) => {
              const profile = await getUserById(artistId).catch(() => null);
              return profile
                ? toFeaturedArtist(profile, trackCount, currentUser)
                : null;
            }),
          );

          if (!cancelled) {
            setFeaturedArtists(
              artists.filter((artist): artist is MockUser => !!artist),
            );
          }
          setAlbumOwner(null);
        } else {
          const { referenceTrack, tracks } = await getRelatedTracks(trackId);
          const fullReferenceTrack = await getTrackById(trackId).catch(() => null);
          const hydratedReferenceTrack = fullReferenceTrack ?? referenceTrack;

          if (cancelled) return;

          setSeedTrack(hydratedReferenceTrack);
          setRelatedTracks(tracks);
          setRelatedPlaylistTracks(
            tracks.map((track: Track, index: number) =>
              toPlaylistTrackItem(track, index + 1),
            ),
          );
          setPlaylist(buildPlaylist(hydratedReferenceTrack, tracks));

          const artistIds = getTopArtistTrackCounts(tracks);
          const artists = await Promise.all(
            artistIds.slice(0, 3).map(async ([artistId, trackCount]) => {
              const profile = await getUserById(artistId).catch(() => null);
              return profile
                ? toFeaturedArtist(profile, trackCount, currentUser)
                : null;
            }),
          );

          if (!cancelled) {
            setFeaturedArtists(
              artists.filter((artist): artist is MockUser => !!artist),
            );
          }

          try {
            if (UUID_RE.test(hydratedReferenceTrack.artistUsername)) {
              const owner = await getUserById(hydratedReferenceTrack.artistUsername);
              if (!cancelled) setAlbumOwner(owner);
            } else {
              if (!cancelled) setAlbumOwner(null);
            }
          } catch {
            if (!cancelled) setAlbumOwner(null);
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load related tracks.");
          setFeaturedArtists([]);
          setSeedTrack(null);
          setRelatedTracks([]);
          setRelatedPlaylistTracks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [playlistSlug, isRadioPlaylistRoute, currentUser?.id, currentUser?.following_ids?.join("|") ?? ""]);

  const toPlayerTrack = (track: PlaylistTrackItem): Track => ({
    id: track.track_id,
    title: track.title ?? "Untitled track",
    artistName: track.artist_name ?? "Unknown Artist",
    artistUsername: track.artist_username ?? username ?? "",
    coverUrl: track.cover_image ?? "",
    genre: "",
    likeCount: 0,
    repostCount: 0,
    playCount: track.play_count ?? 0,
    commentCount: 0,
    duration:
      typeof track.duration === "number"
        ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, "0")}`
        : "0:00",
    postedAt: track.added_at ?? "",
    waveformData: [],
    audioUrl: track.audio_url ?? "",
    isPrivate: !track.is_public,
  });

  const handleHeroPlayPause = () => {
    if (!playlist || !tracksForDisplay.length) return;

    const playerTrack = toPlayerTrack(tracksForDisplay[0]);
    const queue = tracksForDisplay.map(toPlayerTrack);
    const isThisPlaylistPlaying =
      (currentTrack as any)?.context?.playlist_id === playlist.playlist_id;

    if (isThisPlaylistPlaying) {
      togglePlay();
    } else {
      setPlayerTrack(
          {
            ...playerTrack,
            context: {
              type: "playlist",
              playlist_id: playlist.playlist_id,
              queue: tracksForDisplay.map((t) => t.track_id),
            },
          } as any,
          queue,
      );
    }
  };

  const handleTrackPlay = (track: PlaylistTrackItem) => {
    const playerTrack = toPlayerTrack(track);
    const queue = tracksForDisplay.map(toPlayerTrack);
    const playlistContext = {
      type: "playlist",
      playlist_id: playlist?.playlist_id,
      queue: tracksForDisplay.map((t) => t.track_id),
    };

    if (currentTrack?.id === playerTrack.id) {
      togglePlay();
      return;
    }

    setPlayerTrack(
      {
        ...playerTrack,
        context: playlistContext,
      } as any,
      queue,
    );
  };

  const isAlbumActive =
    isPlaying &&
    !!playlist &&
    tracksForDisplay.some((track) => track.track_id === currentTrack?.id);

  if (loading)
    return (
      <div
        data-test="more-of-like-slug-loading"
        className="animate-pulse p-20 text-center text-white"
      >
        Loading playlist...
      </div>
    );
  if (error || !playlist)
    return (
      <div
        data-test="more-of-like-slug-error"
        className="p-20 text-center text-red-500"
      >
        {error || "Related tracks not found."}
      </div>
    );

  return (
    <div
      data-test="more-of-like-slug-page"
      className="container px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 flex-1 bg-bg min-h-screen overflow-x-hidden"
    >
      <PlaylistHero
        key={playlist.playlist_id}
        playlist={playlist}
        isPlaying={isAlbumActive}
        activeTrackId={currentTrack?.id}
        onPlayPause={handleHeroPlayPause}
        showUploadButton={false}
        ownerUsername={
          albumOwner?.username ??
          seedTrack?.artistName ??
          seedTrack?.artistUsername ??
          undefined
        }
        moreOfLike={true}
        moreOfLikeTitle={seedTrack?.title}
        extraDurationSeconds={trackDurationSeconds(seedTrack)}
      />

      <div className="container mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 py-6 w-full">
          <div data-test="more-of-like-slug-main" className="flex-1 min-w-0 w-full">
            <PlaylistActions
              playlist={playlist}
              initialTracks={tracksForAddToPlaylist}
              isGeneratedPlaylist
              engagementKind={"radioTracks" }
              radioSeedTrack={seedTrack ?? undefined}
              onPlaylistUpdated={(updated: Partial<PlaylistDetails>) =>
                setPlaylist((prev) => (prev ? { ...prev, ...updated } : prev))
              }
            />

            <div
              data-test="more-of-like-slug-tracklist"
              className="flex flex-col gap-6 mt-6 lg:mt-8"
            >
              <TrackList
                tracks={tracksForDisplay}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onTrackPlay={handleTrackPlay}
                moreOfLikeSeedTrack={seedTrack}
              />
            </div>
          </div>

          <div
            data-test="more-of-like-slug-sidebar"
            className="w-full lg:w-[280px] shrink-0"
          >
            <PlaylistSidebar
              featuredArtists={featuredArtists}
              playlist={playlist}
              showSocialProof={false}
              showLikes={false}
              showReposts={false}
            />
            <GuestPageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoreOfLikeSlugPage;
