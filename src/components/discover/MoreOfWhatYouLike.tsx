import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import TrackCard from "@/components/UI/card/Card";
import { mockDiscoverTracks } from "@/services/mocks/discover";

// ─── Component ────────────────────────────────────────────
const MoreOfWhatYouLike = () => {
  return (
    <HorizontalCarousel title="More of what you like">
      {mockDiscoverTracks.map((track) => (
        <TrackCard key={track.id} track={track} />
      ))}
    </HorizontalCarousel>
  );
};

export default MoreOfWhatYouLike;
