import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "@/components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActions from "@/components/playlist/Album/PlaylistActionsAlbum";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import {
  getPlaylist,
  type PlaylistDetails,
} from "@/services/api/playlist/playlist.service";
import { getUsers } from "../../../services/mocks/User.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { MockUser } from "../../../services/mocks/users";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";

function AlbumSlugPage() {
  const { username, albumSlug } = useParams<{
    username: string;
    albumSlug: string;
  }>();

  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredArtists, setFeaturedArtists] = useState<MockUser[]>([]);

  const {
    setTrack: setPlayerTrack,
    togglePlay,
    isPlaying,
    currentTrack,
  } = usePlayerStore();

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      if (!albumSlug) return;

      setLoading(true);
      setError(null);

      try {
        const [playlistRes, fetchedUsers] = await Promise.all([
          getPlaylist(albumSlug, { include_tracks: true }),
          getUsers(),
        ]);

        if (cancelled) return;

        setPlaylist(playlistRes.data);

        setFeaturedArtists(
          Array.isArray(fetchedUsers) ? fetchedUsers.slice(0, 3) : [],
        );
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Failed to load playlist.");

          try {
            const fetchedUsers = await getUsers();
            setFeaturedArtists(
              Array.isArray(fetchedUsers) ? fetchedUsers.slice(0, 3) : [],
            );
          } catch {
            setFeaturedArtists([]);
          }
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
      data-test="album-slug-page"
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
        showUploadButton={false}
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
              />
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-[280px] shrink-0">
            <PlaylistSidebar
              featuredArtists={featuredArtists}
              playlist={playlist}
            />
            <GuestPageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlbumSlugPage;
