import HorizontalCarousel from "./HorizontalCarousel";
import TrackCard from "@/components/UI/Card";
import { mockAlbumsForYou } from "@/services/mocks/discover";

// ─── Component ────────────────────────────────────────────
const AlbumsForYou = () => {
  return (
    <HorizontalCarousel title="Albums for you" data-section="albums-for-you">
      {mockAlbumsForYou.map((track) => (
        <TrackCard key={track.id} track={track} />
      ))}
    </HorizontalCarousel>
  );
};

export default AlbumsForYou;
