import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import TrackCard from "@/components/UI/card/Card";
import { mockAlbumsForYou } from "@/services/mocks/discover";
import { getAlbumsForYou } from "@/services/api/discover.service";
import { mapApiTrackToTrack } from "@/services/api/discover.mapper";
import type { Track } from "@/types/track";

// ─── Component ────────────────────────────────────────────
const AlbumsForYou = () => {
  const [apiTracks, setApiTracks] = useState<Track[] | null>(null);

  useEffect(() => {
    getAlbumsForYou()
      .then((albumTracks) => setApiTracks(albumTracks.map(mapApiTrackToTrack)))
      .catch(() => {}); // stub throws — mock is the fallback until backend implements this
  }, []);

  const items = apiTracks ?? mockAlbumsForYou;

  return (
    <HorizontalCarousel title="Albums for you" data-section="albums-for-you">
      {items.map((track) => (
        <TrackCard key={track.id} track={track} />
      ))}
    </HorizontalCarousel>
  );
};

export default AlbumsForYou;