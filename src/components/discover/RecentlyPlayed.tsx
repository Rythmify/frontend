import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import TrackCard from "@/components/UI/Card";
import { mockRecentlyPlayedItems } from "@/services/mocks/discover";
import { getRecentlyPlayed } from "@/services/api/discover.service";
import type { RecentlyPlayedEntry } from "@/services/api/discover.service";

// ─── Component ────────────────────────────────────────────
const RecentlyPlayed = () => {
  const [apiItems, setApiItems] = useState<RecentlyPlayedEntry[] | null>(null);

  useEffect(() => {
    getRecentlyPlayed().then(setApiItems).catch(() => {});
    // Silent fail — mock is the fallback until backend returns full track data
  }, []);

  const items = mockRecentlyPlayedItems; // TODO: replace with apiItems once TrackSummary includes artistName + coverUrl

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
