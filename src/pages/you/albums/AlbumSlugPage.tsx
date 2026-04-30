import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "@/components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActionsAlbum from "@/components/playlist/Album/PlaylistActionsAlbum";
import PlaylistActions from "@/components/playlist/PlaylistActions";
import OwnerInfo from "@/components/playlist/OwnerInfo";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import {
  getPlaylist,
  type PlaylistDetails,
  type PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";
import { getUserById, type PublicUser } from "@/services/user.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { Track } from "../../../types/track";
import type { MockUser } from "../../../services/mocks/users";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import { useAuthStore } from "@/stores/auth.store";
import { playlistExists } from "@/services/api/playlist/playlist.service";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function AlbumSlugPage() {
  const { username, albumSlug } = useParams<{
    username: string;
    albumSlug: string;
  }>();

  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredArtists, setFeaturedArtists] = useState<MockUser[]>([]);
  const [albumOwner, setAlbumOwner] = useState<PublicUser | null>(null);
  const [backendPlaylistExists, setBackendPlaylistExists] = useState(false);

  const {
    setTrack: setPlayerTrack,
    togglePlay,
    isPlaying,
    currentTrack,
  } = usePlayerStore();
  const { user } = useAuthStore();
  const totalTrackViews =
    playlist?.tracks.reduce((sum, track) => sum + (track.play_count ?? 0), 0) ??
    0;

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      if (!albumSlug) return;

      setLoading(true);
      setError(null);

      try {
        const playlistId = albumSlug.includes(":")
          ? (albumSlug.split(":").pop() ?? albumSlug)
          : albumSlug;

        const resolvedPlaylistId = UUID_RE.test(playlistId)
          ? playlistId
          : playlistId;

        const playlistRes = await getPlaylist(resolvedPlaylistId, {
          include_tracks: true,
        });

        if (cancelled) return;

        setPlaylist(playlistRes.data);
        const existing = await playlistExists(playlistRes.data.playlist_id);
        if (!cancelled) {
          setBackendPlaylistExists(existing);
        }

        try {
          const owner = await getUserById(playlistRes.data.owner_user_id);
          if (!cancelled) setAlbumOwner(owner);
        } catch {
          if (!cancelled) setAlbumOwner(null);
        }

        const artistIds = getTopArtistTrackCounts(playlistRes.data.tracks);
        const artists = await Promise.all(
          artistIds.slice(0, 3).map(async ([artistId, trackCount]) => {
            const user = await getUserById(artistId).catch(() => null);
            return user
              ? ({
                  id: user.id as unknown as number,
                  username: user.username ?? user.display_name,
                  displayName: user.display_name,
                  avatarUrl:
                    user.profile_picture ??
                    "https://picsum.photos/seed/default/100/100",
                  followerCount: user.followers_count ?? 0,
                  trackCount,
                  isFollowing: false,
                } as MockUser)
              : null;
          }),
        );

        if (!cancelled) {
          setFeaturedArtists(
            artists.filter((artist): artist is MockUser => !!artist),
          );
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Failed to load playlist.");
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
  const handleHeroPlayPause = () => {
    if (!playlist || !playlist.tracks.length) return;

    const firstTrack = playlist.tracks[0];
    const playerTrack = toPlayerTrack(firstTrack);
    const queue = playlist.tracks.map(toPlayerTrack);
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
            queue: playlist.tracks.map((t) => t.track_id),
          },
        } as any,
        queue,
      );
    }
  };

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

  const handleTrackPlay = (track: PlaylistTrackItem) => {
    const playerTrack = toPlayerTrack(track);
    const queue = playlist?.tracks.map(toPlayerTrack) ?? [];
    const playlistContext = {
      type: "playlist",
      playlist_id: playlist?.playlist_id,
      queue: playlist?.tracks.map((t) => t.track_id) ?? [],
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

  const handleAddToNextUp = () => {
    if (!playlist?.tracks.length) return;
    const queue = playlist.tracks.map(toPlayerTrack);
    const playerState = usePlayerStore.getState();
    queue.forEach((track) => playerState.addToQueue(track));
  };

  const isAlbumActive =
    isPlaying &&
    !!playlist &&
    playlist.tracks.some((track) => track.track_id === currentTrack?.id);
  const isOwner = user?.id === playlist?.owner_user_id;

  if (loading)
    return (
      <div data-test="album-slug-loading" className="animate-pulse p-20 text-center text-white">
        Loading album...
      </div>
    );
  if (error || !playlist)
    return (
      <div data-test="album-slug-error" className="p-20 text-center text-red-500">
        {error || "Playlist not found."}
      </div>
    );

  return (
    <div
      data-test="album-slug-page"
      className="flex-1 bg-bg min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 mx-auto w-full overflow-x-hidden"
    >
      {/* Hero Section using the fetched playlist data */}
      <PlaylistHero
        key={playlist.playlist_id}
        playlist={playlist}
        isPlaying={isAlbumActive}
        activeTrackId={currentTrack?.id}
        onPlayPause={handleHeroPlayPause}
        showUploadButton={false}
        ownerUsername={albumOwner?.username}
      />

      <div className="container mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 py-6 w-full">
          {/* Left Column: Actions and Track List */}
          <div data-test="album-slug-main" className="flex-1 min-w-0">
            {isOwner ? (
              <PlaylistActions
                playlist={playlist}
                onPlaylistUpdated={(updated: Partial<PlaylistDetails>) =>
                  setPlaylist((prev) => (prev ? { ...prev, ...updated } : prev))
                }
              />
            ) : (
              <PlaylistActionsAlbum
                playlist={playlist}
                engagementKind="playlist"
                backendPlaylistExists={backendPlaylistExists}
                onAddToNextUp={handleAddToNextUp}
                onPlaylistUpdated={(updated: Partial<PlaylistDetails>) =>
                  setPlaylist((prev) => (prev ? { ...prev, ...updated } : prev))
                }
              />
            )}

            <div data-test="album-slug-content" className="flex flex-col gap-6 mt-6 lg:flex-row lg:mt-8">
              <OwnerInfo
                ownerUserId={playlist.owner_user_id}
                trackNum={totalTrackViews}
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

          {/* Right Column: Sidebar */}
          <div data-test="album-slug-sidebar" className="w-full lg:w-[280px] shrink-0">
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

export default AlbumSlugPage;
