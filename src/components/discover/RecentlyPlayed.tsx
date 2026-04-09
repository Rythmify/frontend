import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import TrackCard from "@/components/UI/card/Card";
import {
  mockRecentlyPlayedItems,
  mockRecentlyPlayedTracks,
} from "@/services/mocks/discover";
import { getRecentlyPlayed } from "@/services/api/discover.service";
import { mapRecentlyPlayedEntry } from "@/services/api/discover.mapper";
import type { Track } from "@/types/track";

// ─── Component ────────────────────────────────────────────
const RecentlyPlayed = () => {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    getRecentlyPlayed()
      .then((items) => setTracks(items.map(mapRecentlyPlayedEntry)))
      .catch(() => setTracks(mockRecentlyPlayedTracks));
  }, []);

  // Fallback: show only track items from the mock (not mixes or stations)
  const mockFallback = mockRecentlyPlayedItems.filter(
    (item): item is Track & { type: "track" } => item.type === "track",
  );

  const items: Track[] = tracks ?? mockFallback;

  return (
    <div data-test="section-recently-played">
      <HorizontalCarousel
        title="Recently played"
        data-section="recently-played"
      >
        {items.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </HorizontalCarousel>
    </div>
  );
};

export default RecentlyPlayed;
