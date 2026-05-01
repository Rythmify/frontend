import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import TrackCard from "@/components/UI/card/Card";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";

import type { DiscoveryTrack } from "@/services/api/discover.service";

interface Props {
  tracks: DiscoveryTrack[];
}

const MoreOfWhatYouLike = ({ tracks }: Props) => {
  const items = tracks.length ? tracks.map(mapDiscoveryTrack) : [];

  return (
    <div data-test="section-more-of-what-you-like">
      <HorizontalCarousel title="More of what you like">
        {items.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            addToPlaylistTracks={items}
          />
        ))}
      </HorizontalCarousel>
    </div>
  );
};

export default MoreOfWhatYouLike;
