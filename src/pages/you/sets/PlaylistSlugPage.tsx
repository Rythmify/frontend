import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "@/components/playlist/PlaylistSidebar";
import PlaylistActions from "@/components/playlist/PlaylistActions";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import {
  getPlaylist,
  updatePlaylist,
  type PlaylistDetails,
  type PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";
import { getUserById, type PublicUser } from "@/services/user.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { Track } from "../../../types/track";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import OwnerInfo from "@/components/playlist/OwnerInfo";
import { useAuthStore } from "../../../stores/auth.store";
import PlaylistActionsForYou from "@/components/playlist/Made for you/PlaylistActionsForYou";

function PlaylistSlugPage() {
  const { username, playlistSlug } = useParams<{
    username: string;
    playlistSlug: string;
  }>();

  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [albumOwner, setAlbumOwner] = useState<PublicUser | null>(null);

  const { user } = useAuthStore();
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
        setError("Playlist not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const playlistId = playlistSlug.includes(":")
          ? (playlistSlug.split(":").pop() ?? playlistSlug)
          : playlistSlug;

        const playlistRes = await getPlaylist(playlistId, {
          include_tracks: true,
        });

        if (cancelled) return;

        setPlaylist(playlistRes.data);

        try {
          const owner = await getUserById(playlistRes.data.owner_user_id);
          if (!cancelled) setAlbumOwner(owner);
        } catch {
          if (!cancelled) setAlbumOwner(null);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load playlist.");
          setAlbumOwner(null);
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
    if (!playlist || !playlist.tracks.length) return;

    const firstTrack = playlist.tracks[0];
    const playerTrack = toPlayerTrack(firstTrack);
    const queue = playlist.tracks.map(toPlayerTrack);
    const isThisPlaylistPlaying =
      (currentTrack as any)?.context?.playlist_id === playlist.playlist_id;

    if (isThisPlaylistPlaying) {
      togglePlay();
      return;
    }

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
  };

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

  const isPlaylistActive =
    isPlaying &&
    !!playlist &&
    playlist.tracks.some((track) => track.track_id === currentTrack?.id);

  const handleCoverUpload = async (file: File) => {
    if (!playlist) return;

    try {
      const res = await updatePlaylist(playlist.playlist_id, {
        cover_image: file,
      });

      setPlaylist((prev) => (prev ? { ...prev, ...res.data } : prev));
    } catch (err) {
      console.error("Failed to update playlist cover image:", err);
      if (!error) setError("Failed to update playlist cover image.");
    }
  };

  const canEditPlaylist = user?.id === playlist?.owner_user_id;
  const showOwnerActions = canEditPlaylist;

  if (loading) {
    return (
      <div className="animate-pulse p-20 text-center text-white">
        Loading playlist...
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="p-20 text-center text-red-500">
        {error || "Playlist not found."}
      </div>
    );
  }

  return (
    <div
      data-test="playlist-slug-page"
      className="container px-4 md:px-8 lg:px-12 xl:px-20 flex-1 w-full bg-bg min-h-screen"
    >
      <PlaylistHero
        playlist={playlist}
        isPlaying={isPlaylistActive}
        activeTrackId={currentTrack?.id}
        onPlayPause={handleHeroPlayPause}
        onImageUpload={handleCoverUpload}
        showUploadButton={canEditPlaylist}
        ownerUsername={albumOwner?.username ?? username}
      />

      <div className=" mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          {/* Left Column: Actions and Track List */}
          <div className="flex-1 min-w-0">
            {showOwnerActions ? (
              <PlaylistActions
                playlist={playlist}
                onPlaylistUpdated={(updated: Partial<PlaylistDetails>) =>
                  setPlaylist((prev) => (prev ? { ...prev, ...updated } : prev))
                }
              />
            ) : (
              <PlaylistActionsForYou playlist={playlist} />
            )}

            <div className="flex flex-col lg:flex-row gap-6 mt-8">
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
              <div className="flex-1 min-w-0">
                <TrackList
                  tracks={playlist.tracks}
                  currentTrackId={currentTrack?.id}
                  isPlaying={isPlaying}
                  onTrackPlay={handleTrackPlay}
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[280px] shrink-0">
            <PlaylistSidebar playlist={playlist} />
            <GuestPageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaylistSlugPage;
