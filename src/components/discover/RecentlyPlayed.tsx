import HorizontalCarousel from "./HorizontalCarousel";
import TrackCard from "@/components/UI/Card";
import { mockRecentlyPlayedItems } from "@/services/mocks/discover";

// ─── Component ────────────────────────────────────────────
const RecentlyPlayed = () => {
  const items = mockRecentlyPlayedItems;

  return (
    <HorizontalCarousel title="Recently played" data-section="recently-played">
      {items.map((item) => {
        if (item.type === "track")
          return <TrackCard key={item.id} track={item} />;
        if (item.type === "mix") {
          // return <MixCard key={item.id} mix={item} />;
          return null; // TODO: Implement MixCard
        }
        if (item.type === "station") {
          // return <StationCard key={item.id} station={item} />;
          return null; // TODO: Implement StationCard
        }
      })}
    </HorizontalCarousel>
  );
};

export default RecentlyPlayed;
