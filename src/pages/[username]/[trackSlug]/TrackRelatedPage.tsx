import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTrackBySlug, getRelatedTracks } from "@/services/track.service";
import type { Track } from "@/types/track";
import Spinner from "@/components/UI/Spinner";
import TrackList from "./components/TrackList";
import { usePlayerStore } from "@/stores/player.store";

export default function TrackRelatedPage() {
  const { username, trackId } = useParams<{ username: string; trackId: string }>();
  const navigate = useNavigate();
  const { setTrack: setPlayerTrack, currentTrack, isPlaying } = usePlayerStore();

  const [track, setTrack] = useState<Track | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username || !trackId) return;

    async function fetchData() {
      try {
        const fetchedTrack = await getTrackBySlug(username!, trackId!);
        setTrack(fetchedTrack);
        const { tracks } = await getRelatedTracks(fetchedTrack.id);
        setRelatedTracks(tracks);
      } catch (err) {
        console.error("Failed to load related tracks:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [username, trackId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-text-secondary">
        Track not found.
      </div>
    );
  }

  const effectiveArtistUsername = track.artistUsername || username || "unknown";
  const effectiveTrackSlug = track.trackSlug || trackId || "";

  return (
    <div className="py-8 container px-4 md:px-8 lg:px-20">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <div 
          className="w-40 h-40 shrink-0 cursor-pointer shadow-lg overflow-hidden rounded-sm"
          onClick={() => navigate(`/${effectiveArtistUsername}/${effectiveTrackSlug}`)}
        >
          <img 
            src={track.coverUrl} 
            alt={track.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div>
          <h1 
            className="text-white text-3xl font-bold cursor-pointer hover:underline mb-1"
            onClick={() => navigate(`/${effectiveArtistUsername}/${effectiveTrackSlug}`)}
          >
            {track.title}
          </h1>
          <p 
            className="text-xl text-text-secondary cursor-pointer hover:text-white"
            onClick={() => navigate(`/${effectiveArtistUsername}`)}
          >
            {track.artistName}
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6 border-b border-[#333] pb-2">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider text-sm">Related Tracks</h2>
      </div>

      {/* List */}
      {relatedTracks.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-white text-lg font-bold">
            No related tracks found.
          </p>
        </div>
      ) : (
        <TrackList 
          tracks={relatedTracks}
          currentTrackId={currentTrack?.id}
          isPlaying={isPlaying}
          onTrackPlay={(t) => {
            if (currentTrack?.id === t.id) {
              usePlayerStore.getState().togglePlay();
            } else {
              setPlayerTrack(t, [track, ...relatedTracks]);
            }
          }}
        />
      )}
    </div>
  );
}
