import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "../../../components/Playlist/PlaylistSidebar";
import PlaylistActions from "../../../components/Playlist/PlaylistActions";
import PlaylistHero from "../../../components/Playlist/PlaylistHero";
import {
  getTrackBySlug,
  getRelatedTracks,
} from "../../../services/mocks/Track.service";
import { getUsers } from "../../../services/mocks/User.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { Track } from "../../../types/track";
import type { MockUser } from "../../../services/mocks/users";
import type { Playlist } from "@/services/api/playlist/playlist.service";

function PlaylistSlugPage() {
  const { username = "samo-lotfy", trackSlug = "msh-awl-mara" } = useParams<{
    username: string;
    trackSlug: string;
  }>();

  const [playlist , setPlaylist] = useState<Track | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<MockUser[]>([]);
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
      setLoading(true);
      try {
        const [fetchedTrack, fetchedUsers] = await Promise.all([
          getTrackBySlug(username, trackSlug),
          getUsers(),
        ]);
        if (cancelled) return;

        setPlaylist(fetchedTrack);
        setFeaturedArtists(
          Array.isArray(fetchedUsers) ? fetchedUsers.slice(0, 3) : [],
        );
        const related = await getRelatedTracks(String(fetchedTrack.id));
        if (!cancelled) setRelatedTracks(related);
      } catch (err) {
        if (!cancelled) setError("Failed to load track.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [username, trackSlug]);

  // Map Track data to Playlist interface for the Hero component
  const playlistData = useMemo<Playlist | null>(() => {
    if (!playlist ) return null;
    return {
      playlist_id: String(playlist .id),
      owner_user_id: playlist .artistUsername,
      name: playlist .title,
      is_public: !playlist .isPrivate,
      created_at: playlist .postedAt,
      track_count: 1,
      like_count: playlist .likeCount,
      description: "",
      repost_count: playlist .repostCount,
    };
  }, [playlist ]);

  const handleHeroPlayPause = () => {
    if (currentTrack?.id === playlist ?.id) {
      togglePlay();
    } else if (playlist ) {
      setPlayerTrack(playlist );
    }
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;
  if (error || !playlist  || !playlistData)
    return <div>{error || "Not found"}</div>;

  return (
    <div data-test="track-slug-page" className="flex-1 w-full">
      {/* Hero Section */}
      <PlaylistHero
        playlist={playlistData}
        isPlaying={isPlaying && currentTrack?.id === playlist .id}
        onPlayPause={handleHeroPlayPause}
      />

      <div className="container px-4 md:px-8 lg:px-20 mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          {/* Left Column */}
          <div className="flex-1 min-w-0">
            <PlaylistActions />
            <div className="mt-8">
              <h2 className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest font-semibold mb-4">
                Related Tracks
              </h2>
              {/* Render TrackList here */}
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[280px] shrink-0">
            <PlaylistSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaylistSlugPage;
