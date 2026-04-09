import { useState, useEffect } from "react";
import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import TrackCard from "@/components/UI/card/Card";
import { getHome } from "@/services/api/discover.service";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";
import { mockDiscoverTracks } from "@/services/mocks/discover";
import type { Track } from "@/types/track";

const MoreOfWhatYouLike = () => {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    getHome()
      .then((data) =>
        setTracks(data.more_of_what_you_like.tracks.map(mapDiscoveryTrack)),
      )
      .catch(() => setTracks(mockDiscoverTracks));
  }, []);

  const items = tracks.length ? tracks : mockDiscoverTracks;

  return (
    <HorizontalCarousel title="More of what you like">
      {items.map((track) => (
        <TrackCard key={track.id} track={track} />
      ))}
    </HorizontalCarousel>
  );
};

export default MoreOfWhatYouLike;
