import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "@/components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActions from "@/components/playlist/Album/PlaylistActionsAlbum";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import {
  type PlaylistDetails,
  type PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";
import { getRelatedTracks } from "@/services/mocks/Track.service";
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
    name: "More of what you like",
    description: seedTrack.title
      ? `Related tracks inspired by ${seedTrack.title}`
      : "Related tracks picked for you",
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
  const [relatedTracks, setRelatedTracks] = useState<PlaylistTrackItem[]>([]);

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
        const trackId = playlist?.tracks[0]?.track_id ??
        playlistSlug.includes(":")
          ? (playlistSlug.split(":").pop() ?? playlistSlug)
          : playlistSlug;

        const { referenceTrack, tracks } = await getRelatedTracks(trackId);

        if (cancelled) return;

        setSeedTrack(referenceTrack);
        setRelatedTracks(tracks.map((track, index) => toPlaylistTrackItem(track, index + 1)));
        setPlaylist(buildPlaylist(referenceTrack, tracks));
        setFeaturedArtists([]);

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

    const firstTrack = relatedTracks[0];
    const playerTrack = toPlayerTrack(firstTrack);
    const queue = relatedTracks.map(toPlayerTrack);
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
            queue: relatedTracks.map((t) => t.track_id),
          },
        } as any,
        queue,
      );
    }
  };

  const handleTrackPlay = (track: PlaylistTrackItem) => {
    const playerTrack = toPlayerTrack(track);
    const queue = relatedTracks.map(toPlayerTrack);
    const playlistContext = {
      type: "playlist",
      playlist_id: playlist?.playlist_id,
      queue: relatedTracks.map((t) => t.track_id),
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
    relatedTracks.some((track) => track.track_id === currentTrack?.id);

  if (loading)
    return (
      <div className="animate-pulse p-20 text-center text-white">
        Loading playlist...
      </div>
    );
  if (error || !playlist)
    return (
      <div className="p-20 text-center text-red-500">
        {error || "Related tracks not found."}
      </div>
    );

  return (
    <div
      data-test="more-of-like-slug-page"
      className="flex-1 w-full bg-bg min-h-screen"
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
      />

      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          <div className="flex-1 min-w-0">
            <PlaylistActions
              playlist={playlist}
              onPlaylistUpdated={(updated: Partial<PlaylistDetails>) =>
                setPlaylist((prev) => (prev ? { ...prev, ...updated } : prev))
              }
            />

            <div className="flex flex-col lg:flex-row gap-6 mt-8">
              
              <TrackList
                tracks={relatedTracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onTrackPlay={handleTrackPlay}
              />
            </div>
          </div>

          <div className="w-full lg:w-[280px] shrink-0">
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
