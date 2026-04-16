import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "../../../components/playlist/PlaylistSidebar";
import PlaylistActions from "../../../components/playlist/PlaylistActions";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import {
  getPlaylist,
  type PlaylistDetails,
  type PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";
import { getUsers } from "../../../services/mocks/User.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { Track } from "../../../types/track";
import type { MockUser } from "../../../services/mocks/users";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";

function PlaylistSlugPage() {
  const { username, playlistSlug } = useParams<{
    username: string;
    playlistSlug: string;
  }>();

  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    setTrack: setPlayerTrack,
    togglePlay,
    isPlaying,
    currentTrack,
  } = usePlayerStore();

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      if (!playlistSlug) return;

      setLoading(true);
      setError(null);
      try {
        // Fetch playlist details including tracks
        const [playlistRes, fetchedUsers] = await Promise.all([
          getPlaylist(playlistSlug, { include_tracks: true }),
          getUsers(),
        ]);

        if (cancelled) return;

        setPlaylist(playlistRes.data);
      } catch (err) {
        if (!cancelled) setError("Failed to load playlist.");
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [playlistSlug]);

  const handleHeroPlayPause = () => {
    if (!playlist || !playlist.tracks.length) return;

    const firstTrack = playlist.tracks[0];
    const isThisPlaylistPlaying =
      (currentTrack as any)?.context?.playlist_id === playlist.playlist_id;

    if (isThisPlaylistPlaying) {
      togglePlay();
    } else {
      // Set the first track and provide the playlist context for the queue
      setPlayerTrack({
        id: firstTrack.track_id,
        context: {
          type: "playlist",
          playlist_id: playlist.playlist_id,
          queue: playlist.tracks.map((t) => t.track_id),
        },
      } as any);
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

    if (currentTrack?.id === playerTrack.id) {
      togglePlay();
      return;
    }

    setPlayerTrack(playerTrack, queue);
  };

  if (loading)
    return (
      <div className="animate-pulse p-20 text-center text-white">
        Loading playlist...
      </div>
    );
  if (error || !playlist)
    return (
      <div className="p-20 text-center text-red-500">
        {error || "Playlist not found."}
      </div>
    );

  return (
    <div
      data-test="playlist-slug-page"
      className="flex-1 w-full bg-bg min-h-screen"
    >
      {/* Hero Section using the fetched playlist data */}
      <PlaylistHero
        playlist={playlist}
        isPlaying={
          isPlaying &&
          (currentTrack as any)?.context?.playlist_id === playlist.playlist_id
        }
        onPlayPause={handleHeroPlayPause}
      />

      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          {/* Left Column: Actions and Track List */}
          <div className="flex-1 min-w-0">
            <PlaylistActions
              playlist={playlist}
              onPlaylistUpdated={(updated: Partial<PlaylistDetails>) =>
                setPlaylist((prev) => (prev ? { ...prev, ...updated } : prev))
              }
            />

            <div className="mt-8">
              <TrackList
                tracks={playlist.tracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onTrackPlay={handleTrackPlay}
              />
            </div>
          </div>

          {/* Right Column: Sidebar */}
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
