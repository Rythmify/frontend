import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "../../../components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActionsAlbum from "../../../components/playlist/Album/PlaylistActionsAlbum";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import type {
  PlaylistDetails,
  PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";
import {
  getAlbumsForYou,
  type DiscoveryAlbum,
} from "@/services/api/discover.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { MockUser } from "../../../services/mocks/users";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import { getUserById, type PublicUser } from "@/services/user.service";
import { getPlaylist } from "@/services/api/playlist/playlist.service";
import type { Track } from "@/types/track";
import OwnerInfo from "@/components/playlist/OwnerInfo";
import { playlistExists } from "@/services/api/playlist/playlist.service";

function albumToPlaylistDetails(
  album: DiscoveryAlbum,
  firstTrack: PlaylistTrackItem,
  albumTracks: PlaylistTrackItem[],
): PlaylistDetails {
  return {
    playlist_id: album.id,
    owner_user_id: album.owner_id,
    name: album.name ?? firstTrack.title ?? "Album",
    description: firstTrack.title
      ? `${album.name ?? "Album"} tracks`
      : "Album tracks picked for you",
    is_public: true,
    cover_image: album.cover_image ?? firstTrack.cover_image ?? null,
    subtype: "album",
    created_at: album.created_at,
    updated_at: null,
    track_count: albumTracks.length,
    like_count: album.like_count,
    repost_count: 0,
    is_album_view: true,
    tracks: albumTracks.map(
      (track, index) =>
        ({
          track_id: track.track_id,
          position: index + 1,
          added_at: track.added_at,
          title: track.title,
          duration: null,
          cover_image: track.cover_image || null,
          artist_name: track.artist_name,
          artist_id: track.artist_id,
          artist_username: track.artist_username,
          is_public: track.is_public,
          deleted_at: null,
          audio_url: track.audio_url,
          play_count: track.play_count,
        }) as PlaylistTrackItem & { audio_url?: string; play_count?: number },
    ),
  };
}

function getTopArtistTrackCounts(
  tracks: PlaylistTrackItem[],
): [string, number][] {
  const counts = new Map<string, number>();

  for (const track of tracks) {
    const artistId = track.artist_id?.trim();
    if (!artistId) continue;
    counts.set(artistId, (counts.get(artistId) ?? 0) + 1);
  }

  return Array.from(counts.entries());
}

function AlbumsForYouSlugPage() {
  const { username, albumSlug } = useParams<{
    username: string;
    albumSlug: string;
  }>();

  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [featuredArtists, setFeaturedArtists] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [albumOwner, setAlbumOwner] = useState<PublicUser | null>(null);
  const [backendPlaylistExists, setBackendPlaylistExists] = useState(false);

  const {
    setTrack: setPlayerTrack,
    togglePlay,
    isPlaying,
    currentTrack,
  } = usePlayerStore();

  const toFeaturedArtist = (
    user: PublicUser,
    trackCount: number,
  ): MockUser => ({
    id: user.id as unknown as number,
    username: user.username ?? user.display_name,
    displayName: user.display_name,
    avatarUrl:
      user.profile_picture ?? "https://picsum.photos/seed/default/100/100",
    followerCount: user.followers_count ?? 0,
    trackCount,
    isFollowing: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!albumSlug) return;

      setLoading(true);
      setError(null);

      try {
        const resolvedAlbumId = albumSlug.includes(":")
          ? (albumSlug.split(":").pop() ?? albumSlug)
          : albumSlug;

        const albumsRes = await getAlbumsForYou({ limit: 100, offset: 0 });
        const album =
          albumsRes.data.find((item) => item.id === resolvedAlbumId) ??
          albumsRes.data.find((item) => item.name === resolvedAlbumId);

        if (!album) {
          throw new Error("Album not found.");
        }

        const playlistRes = await getPlaylist(album.id, { include_tracks: true });
        const tracks = playlistRes.data.tracks;

        if (!tracks.length) {
          throw new Error("Album not found.");
        }

        if (cancelled) return;

        const firstTrack = tracks[0];
        setPlaylist(albumToPlaylistDetails(album, firstTrack, tracks));
        const existing = await playlistExists(album.id);
        if (!cancelled) {
          setBackendPlaylistExists(existing);
        }

        const artistIds = getTopArtistTrackCounts(tracks);
        const artists = await Promise.all(
          artistIds.slice(0, 3).map(async ([artistId, trackCount]) => {
            const user = await getUserById(artistId).catch(() => null);
            return user ? toFeaturedArtist(user, trackCount) : null;
          }),
        );

        if (cancelled) return;

        setFeaturedArtists(
          artists.filter((artist): artist is MockUser => !!artist),
        );

        const owner = await getUserById(album.owner_id).catch(() => null);
        if (cancelled) return;
        setAlbumOwner(owner);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Album not found.");
          setFeaturedArtists([]);
          setAlbumOwner(null);
          setBackendPlaylistExists(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [albumSlug]);

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
    if (!playlist || !playlist.tracks.length) return;

    const albumTracks = playlist.tracks as Array<
      PlaylistTrackItem & { audio_url?: string; play_count?: number }
    >;
    const firstTrack = albumTracks[0];
    const playerTrack = toPlayerTrack(firstTrack);
    const queue = albumTracks.map(toPlayerTrack);
    const isThisAlbumPlaying =
      (currentTrack as any)?.context?.playlist_id === playlist.playlist_id;

    if (isThisAlbumPlaying) {
      togglePlay();
    } else {
      setPlayerTrack(
        {
          ...playerTrack,
          context: {
            type: "playlist",
            playlist_id: playlist.playlist_id,
            queue: albumTracks.map((t) => t.track_id),
          },
        } as any,
        queue,
      );
    }
  };

  const handleTrackPlay = (track: PlaylistTrackItem) => {
    if (!playlist) return;

    const albumTracks = playlist.tracks;
    const playerTrack = toPlayerTrack(track);

    if (currentTrack?.id === playerTrack.id) {
      togglePlay();
      return;
    }

    setPlayerTrack(
      {
        ...playerTrack,
        context: {
          type: "playlist",
          playlist_id: playlist.playlist_id,
          queue: albumTracks.map((t) => t.track_id),
        },
      } as any,
      albumTracks.map(toPlayerTrack),
    );
  };

  const isAlbumActive =
    isPlaying &&
    !!playlist &&
    playlist.tracks.some((track) => track.track_id === currentTrack?.id);

  if (loading)
    return (
      <div data-test="albums-for-you-slug-loading" className="animate-pulse p-20 text-center text-white">
        Loading album...
      </div>
    );

  if (error || !playlist)
    return (
      <div data-test="albums-for-you-slug-error" className="p-20 text-center text-red-500">
        {error || "Album not found."}
      </div>
    );

  return (
    <div
      data-test="album-slug-page"
      className="flex-1 w-full bg-bg min-h-screen px-4 md:px-8 lg:px-12 xl:px-20 mx-auto"
    >
      <PlaylistHero
        key={playlist.playlist_id}
        playlist={playlist}
        isPlaying={isAlbumActive}
        activeTrackId={currentTrack?.id}
        onPlayPause={handleHeroPlayPause}
        showUploadButton={false}
        ownerUsername={albumOwner?.username}
      />

      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          <div data-test="albums-for-you-slug-main" className="flex-1 min-w-0">
            <PlaylistActionsAlbum
              playlist={playlist}
              engagementKind="album"
              backendPlaylistExists={backendPlaylistExists}
              onPlaylistUpdated={(updated: Partial<PlaylistDetails>) =>
                setPlaylist((prev) => (prev ? { ...prev, ...updated } : prev))
              }
            />

            <div data-test="albums-for-you-slug-content" className="flex flex-1 gap-6 mt-8">
              <OwnerInfo
                ownerUserId={playlist.owner_user_id}
                trackNum={playlist.tracks.length}
                followers={albumOwner?.followers_count ?? 0}
                username={
                  albumOwner?.username ?? username ?? playlist.owner_user_id
                }
                displayName={albumOwner?.display_name ?? undefined}
                avatarUrl={albumOwner?.profile_picture}
              />
              <TrackList
                tracks={playlist.tracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onTrackPlay={handleTrackPlay}
              />
            </div>
          </div>

          <div data-test="albums-for-you-slug-sidebar" className="w-full lg:w-[280px] shrink-0">
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

export default AlbumsForYouSlugPage;
