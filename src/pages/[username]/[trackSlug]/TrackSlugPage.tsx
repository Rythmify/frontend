import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TrackHero from "./components/TrackHero";
import TrackActions from "./components/TrackActions";
import TrackSidebar from "./components/TrackSidebar";
import TrackCommentList from "./components/TrackCommentList";
import type { Track } from "../../../types/track";
import {
  getTrackBySlug,
  getRelatedTracks,
  getTrackComments,
  postComment,
} from "../../../services/track.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { Comment } from "../../../types/comment";

export default function TrackSlugPage() {
  const { username, trackId } = useParams<{
    username: string;
    trackId: string;
  }>();
  const navigate = useNavigate();

  const [track, setTrack] = useState<Track | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setTrack: setPlayerTrack, currentTrack, isPlaying } = usePlayerStore();

  // FIX: heroTrack is ALWAYS the page's track so the hero always shows what
  // this page is about.  We only fall back to currentTrack while the page
  // track is still loading.
  const heroTrack = track ?? currentTrack ?? null;

  // Fetch all data
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!username || !trackId) {
        setError("Track not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchedTrack = await getTrackBySlug(username, trackId);
        if (cancelled) return;
        setTrack(fetchedTrack);

        getRelatedTracks(String(fetchedTrack.id))
          .then(({ tracks }) => {
            if (!cancelled)
              setRelatedTracks(Array.isArray(tracks) ? tracks : []);
          })
          .catch(() => {});

        getTrackComments(String(fetchedTrack.id))
          .then((fetchedComments) => {
            if (!cancelled)
              setComments(Array.isArray(fetchedComments) ? fetchedComments : []);
          })
          .catch(() => {});
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

  // FIX: play/pause handler now always uses the page's `track`, not heroTrack.
  // If this page's track is already loaded in the player → toggle play/pause.
  // Otherwise → load the page track into the player and start playing.
  const handleHeroPlayPause = () => {
    if (!track) return;
    if (currentTrack?.id === track.id) {
      usePlayerStore.getState().togglePlay();
    } else {
      setPlayerTrack(track, [track, ...relatedTracks]);
    }
  };

  const handleTrackPlay = (t: Track) => {
    if (currentTrack?.id === t.id) {
      usePlayerStore.getState().togglePlay();
    } else {
      setPlayerTrack(
        t,
        [track!, ...relatedTracks].filter(Boolean) as Track[]
      );
      navigate(`/${t.artistUsername}/${t.id}`);
    }
  };

  const handleComment = async (text: string, timestampSec: number) => {
    if (!track) return;
    try {
      const newComment = await postComment(String(track.id), text, timestampSec);
      if (newComment) {
        setComments(prev => [...prev, newComment]);
      }
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
        <div
          className="w-full bg-[var(--color-input-bg)]"
          style={{ minHeight: "300px" }}
        />
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
      {/* Hero — always shows this page's track */}
      {heroTrack && (
        <TrackHero
          track={heroTrack}
          comments={comments}
          // FIX: isPlaying is true only when THIS page's track is the active one
          isPlaying={currentTrack?.id === track.id && isPlaying}
          onPlayPause={handleHeroPlayPause}
        />
      )}

      {/* Body — two columns */}
      <div className="flex flex-col lg:flex-row gap-8 py-2 w-full">
        {/* Left: actions + Track discussion */}
        <div data-test="track-main-content" className="flex-1 min-w-0">
          <TrackActions
            track={heroTrack ?? track}
            onAddToNextUp={() => usePlayerStore.getState().addToQueue(track)}
            onComment={handleComment}
          />
          
          {/* Comments Section - Moved below actions like SoundCloud */}
          <TrackCommentList 
            comments={comments} 
            trackId={String(track.id)} 
          />
        </div>

        {/* Right: sidebar */}
        <div
          data-test="track-sidebar-col"
          className="w-full lg:w-[280px] shrink-0 lg:pt-[12px]"
        >
          <TrackSidebar 
            track={heroTrack ?? track} 
            featuredArtists={[]} 
            relatedTracks={relatedTracks}
          />
        </div>
      </div>
    </div>
  );
}
