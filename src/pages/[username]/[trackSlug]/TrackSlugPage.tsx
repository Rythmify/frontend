import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TrackHero from "./components/TrackHero";
import TrackActions from "./components/TrackActions";
import TrackList from "./components/TrackList";
import TrackSidebar from "./components/TrackSidebar";
import type { Track } from "../../../types/track";
import { getTrackById, getRelatedTracks, getTrackComments, postComment } from "../../../services/track.service";
import { usePlayerStore } from "../../../stores/player.store";

export default function TrackSlugPage() {
  const { username, trackId } = useParams<{
    username: string;
    trackId: string;
  }>();
  const navigate = useNavigate();

  const [track, setTrack] = useState<Track | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [comments, setComments] = useState<any[]>([]);
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
      if (!trackId) {
        setError("Track not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedTrack = await getTrackById(trackId);

        if (cancelled) return;

        setTrack(fetchedTrack);

        // Fetch related tracks after we have the track id
        const related = await getRelatedTracks(String(fetchedTrack.id));
        if (!cancelled) setRelatedTracks(Array.isArray(related) ? related : []);

        const fetchedComments = await getTrackComments(String(fetchedTrack.id));
        if (!cancelled) setComments(Array.isArray(fetchedComments) ? fetchedComments : []);
      } catch (err) {
        if (!cancelled) setError("Failed to load track. Please try again.");
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [username, trackId]);

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
      navigate(`/${t.artistUsername}/${t.id}`);
    }
  };

  const handleComment = async (text: string, timestampSec: number) => {
    if (!track) return;
    try {
      await postComment(String(track.id), text, timestampSec);
    } catch (err) {
      console.error("Failed to post comment:", err);
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
          comments={comments}
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
            onComment={handleComment}
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
            featuredArtists={[]}
          />
        </div>

      </div>
    </div>
  );
}