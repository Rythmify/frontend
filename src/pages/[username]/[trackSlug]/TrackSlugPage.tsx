import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TrackHero from "./components/TrackHero";
import TrackActions from "./components/TrackActions";
import TrackList from "./components/TrackList";
import TrackSidebar from "./components/TrackSidebar";
import type { Track } from "../../../types/track";
import type { MockUser } from "../../../services/mocks/users";
import { getTrackBySlug, getRelatedTracks } from "../../../services/mocks/Track.service";
import { getUsers } from "../../../services/mocks/User.service";
import { usePlayerStore } from "../../../stores/player.store";

export default function TrackSlugPage() {
  const { username = "samo-lotfy", trackSlug = "msh-awl-mara" } = useParams<{
    username: string;
    trackSlug: string;
  }>();
  const navigate = useNavigate();

  const [track, setTrack] = useState<Track | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setTrack: setPlayerTrack, currentTrack, isPlaying } = usePlayerStore();

  // The hero always shows the currently playing track if one exists,
  // otherwise falls back to the page's track
  const heroTrack = currentTrack ?? track;

  // Fetch all data 
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [fetchedTrack, fetchedUsers] = await Promise.all([
          getTrackBySlug(username, trackSlug),
          getUsers(),
        ]);

        if (cancelled) return;

        setTrack(fetchedTrack);
        setFeaturedArtists(Array.isArray(fetchedUsers) ? fetchedUsers.slice(0, 3) : []);

        // Fetch related tracks after we have the track id
        const related = await getRelatedTracks(String(fetchedTrack.id));
        if (!cancelled) setRelatedTracks(Array.isArray(related) ? related : []);
      } catch (err) {
        if (!cancelled) setError("Failed to load track. Please try again.");
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [username, trackSlug]);

  // Playback handlers 
  const handleHeroPlayPause = () => {
    if (!heroTrack) return;
    if (currentTrack?.id === heroTrack.id) {
      usePlayerStore.getState().togglePlay();
    } else {
      setPlayerTrack(heroTrack, [heroTrack, ...relatedTracks]);
    }
  };

  const handleTrackPlay = (t: Track) => {
    if (currentTrack?.id === t.id) {
      usePlayerStore.getState().togglePlay();
    } else {
      setPlayerTrack(t, [track!, ...relatedTracks].filter(Boolean) as Track[]);
      navigate(`/${t.artistUsername}/${t.trackSlug}`);
    }
  };

  // Loading state 
  if (loading) {
    return (
      <div
        data-test="track-slug-loading"
        className="flex-1 w-full animate-pulse"
      >
        {/* Hero skeleton */}
        <div
          className="w-full bg-[var(--color-input-bg)]"
          style={{ minHeight: "300px" }}
        />
        {/* Body skeleton */}
        <div className="flex flex-col lg:flex-row gap-8 py-2 w-full mt-4">
          <div className="flex-1 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-[var(--color-input-bg)] rounded"
              />
            ))}
          </div>
          <div className="w-full lg:w-[280px] space-y-3">
            <div className="h-6 bg-[var(--color-input-bg)] rounded w-2/3" />
            <div className="h-6 bg-[var(--color-input-bg)] rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Error state 
  if (error || !track) {
    return (
      <div
        data-test="track-slug-error"
        className="flex-1 w-full flex items-center justify-center py-20"
      >
        <p className="text-[var(--color-error)] text-sm">
          {error ?? "Track not found."}
        </p>
      </div>
    );
  }

  // Main render 
  return (
    <div
      data-test="track-slug-page"
      className="flex-1 container px-4 md:px-8 lg:px-20"
    >
      {/* Hero — always shows the currently playing track */}
      {heroTrack && (
        <TrackHero
          track={heroTrack}
          comments={[]}
          isPlaying={currentTrack?.id === heroTrack.id && isPlaying}
          onPlayPause={handleHeroPlayPause}
        />
      )}

      {/* Body — two columns */}
      <div className="flex flex-col lg:flex-row gap-8 py-2 w-full">

        {/* Left: actions + track list */}
        <div data-test="track-main-content" className="flex-1 min-w-0">
          <TrackActions
            track={heroTrack ?? track}
            onAddToNextUp={() => usePlayerStore.getState().addToQueue(track)}
            onComment={(text) => console.log("New comment:", text)}
          />
          <div className="mt-6">
            <h2 className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest font-semibold mb-2">
              Related Tracks
            </h2>
            <TrackList
              tracks={relatedTracks}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onTrackPlay={handleTrackPlay}
            />
          </div>
        </div>

        {/* Right: sidebar */}
        <div
          data-test="track-sidebar-col"
          className="w-full lg:w-[280px] shrink-0 lg:pt-[12px]"
        >
          <TrackSidebar
            track={heroTrack ?? track}
            featuredArtists={featuredArtists}
          />
        </div>

      </div>
    </div>
  );
}