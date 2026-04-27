import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "@/components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActions from "@/components/playlist/Made for you/PlaylistActionsForYou";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import {
  type PlaylistDetails,
  type PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";
import { getRelatedTracks } from "@/services/track.service";
import { getUserById, type PublicUser } from "@/services/user.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { Track } from "../../../types/track";
import type { MockUser } from "../../../services/mocks/users";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";

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

function MoreOfLikeSlugPage() {
  const { username, playlistSlug } = useParams<{
    username: string;
    playlistSlug: string;
  }>();

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

        const { referenceTrack, tracks } = await getRelatedTracks(trackId);

        if (cancelled) return;

        setSeedTrack(referenceTrack);
        setRelatedTracks(tracks);
        setRelatedPlaylistTracks(
          tracks.map((track: Track, index: number) =>
            toPlaylistTrackItem(track, index + 1),
          ),
        );
        setPlaylist(buildPlaylist(referenceTrack, tracks));

        const artistIds = getTopArtistTrackCounts(tracks);
        const artists = await Promise.all(
          artistIds.slice(0, 3).map(async ([artistId, trackCount]) => {
            const user = await getUserById(artistId).catch(() => null);
            return user
              ? {
                  id: user.id as unknown as number,
                  username: user.username ?? user.display_name,
                  displayName: user.display_name,
                  avatarUrl:
                    user.profile_picture ??
                    "https://picsum.photos/seed/default/100/100",
                  followerCount: user.followers_count ?? 0,
                  trackCount,
                  isFollowing: false,
                }
              : null;
          }),
        );

        if (!cancelled) {
          setFeaturedArtists(
            artists.filter((artist): artist is MockUser => !!artist),
          );
        }

        try {
          if (UUID_RE.test(referenceTrack.artistUsername)) {
            const owner = await getUserById(referenceTrack.artistUsername);
            if (!cancelled) setAlbumOwner(owner);
          } else {
            if (!cancelled) setAlbumOwner(null);
          }
        } catch {
          if (!cancelled) setAlbumOwner(null);
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
  }, [playlistSlug]);

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
    if (!playlist || !relatedTracks.length) return;

    const playerTrack = toPlayerTrack(relatedPlaylistTracks[0]);
    const queue = relatedPlaylistTracks.map(toPlayerTrack);
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
            queue: relatedPlaylistTracks.map((t) => t.track_id),
          },
        } as any,
        queue,
      );
    }
  };

  const handleTrackPlay = (track: PlaylistTrackItem) => {
    const playerTrack = toPlayerTrack(track);
    const queue = relatedPlaylistTracks.map(toPlayerTrack);
    const playlistContext = {
      type: "playlist",
      playlist_id: playlist?.playlist_id,
      queue: relatedPlaylistTracks.map((t) => t.track_id),
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
    relatedPlaylistTracks.some((track) => track.track_id === currentTrack?.id);

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
      className="container px-4 md:px-8 lg:px-12 xl:px-20 flex-1  bg-bg min-h-screen"
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
      />

      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          <div data-test="more-of-like-slug-main" className="flex-1 min-w-0">
            <PlaylistActions
              playlist={playlist}
              initialTracks={relatedPlaylistTracks}
              isGeneratedPlaylist
              engagementKind="none"
              onPlaylistUpdated={(updated: Partial<PlaylistDetails>) =>
                setPlaylist((prev) => (prev ? { ...prev, ...updated } : prev))
              }
            />

            <div
              data-test="more-of-like-slug-tracklist"
              className="flex flex-col lg:flex-row gap-6 mt-8"
            >
              <TrackList
                tracks={relatedPlaylistTracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onTrackPlay={handleTrackPlay}
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
              showLikes={true}
              showReposts={true}
            />
            <GuestPageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoreOfLikeSlugPage;
