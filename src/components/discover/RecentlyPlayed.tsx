import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import TrackCard from "@/components/UI/card/Card";
import StationCard from "@/components/UI/StationCard/StationCard";
import MixCard from "@/components/UI/MixCard/MixCard";
import PlaylistCard from "@/components/UI/PlaylistCard/PlaylistCard";
import GenreCard from "@/components/UI/GenreCard/GenreCard";
import MadeForYouCard from "@/components/UI/MadeForYouCard/MadeForYouCard";
import { mockRecentlyPlayedTracks } from "@/services/mocks/discover";
import { getRecentlyPlayed } from "@/services/api/discover.service";
import { mapRecentlyPlayedEntry } from "@/services/api/discover.mapper";
import type { Track } from "@/types/track";
import { useHistoryStore } from "@/stores/history.store";
import type { HistoryEntry } from "@/stores/history.store";

// ─── Component ────────────────────────────────────────────
const RecentlyPlayed = () => {
  const [apiTracks, setApiTracks] = useState<Track[]>([]);
  const { entries } = useHistoryStore();

  useEffect(() => {
    getRecentlyPlayed()
      .then((items) => setApiTracks(items.map(mapRecentlyPlayedEntry)))
      .catch(() => setApiTracks(mockRecentlyPlayedTracks));
  }, []);

  const recentEntries: HistoryEntry[] =
    entries.length > 0
      ? entries
      : (apiTracks.length > 0 ? apiTracks : mockRecentlyPlayedTracks).map(
          (t) => ({ type: "track" as const, item: t, playedAt: "" }),
        );

  return (
    <div data-test="section-recently-played">
      <HorizontalCarousel
        title="Recently played"
        data-section="recently-played"
      >
        {recentEntries.map((entry, i) => {
          if (entry.type === "track")
            return (
              <TrackCard key={`track-${entry.item.id}`} track={entry.item} />
            );
          if (entry.type === "station")
            return (
              <StationCard
                key={`station-${entry.item.id}`}
                station={entry.item}
                colorIndex={i}
                widthClassName="w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]"
              />
            );
          if (entry.type === "mix")
            return (
              <MixCard key={`mix-${entry.item.id}`} mix={entry.item} />
            );
          if (entry.type === "playlist")
            return (
              <PlaylistCard
                key={`playlist-${entry.item.id}`}
                item={entry.item}
                widthClassName="w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]"
              />
            );
          if (entry.type === "genre")
            return (
              <GenreCard key={`genre-${entry.item.id}`} item={entry.item} />
            );
          if (entry.type === "madeForYou")
            return (
              <MadeForYouCard key={`mfy-${entry.item.id}`} item={entry.item} />
            );
          return null;
        })}
      </HorizontalCarousel>
    </div>
  );
};

export default RecentlyPlayed;
