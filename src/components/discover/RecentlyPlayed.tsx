import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import TrackCard from "@/components/UI/card/Card";
import StationCard from "@/components/UI/StationCard/StationCard";
import MixCard from "@/components/UI/MixCard/MixCard";
import PlaylistCard from "@/components/UI/PlaylistCard/PlaylistCard";
import AlbumCard from "@/components/UI/AlbumCard";
import GenreCard from "@/components/UI/GenreCard/GenreCard";
import MadeForYouCard from "@/components/UI/MadeForYouCard/MadeForYouCard";
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
      .catch(() => {});
  }, []);

  const rawEntries: HistoryEntry[] =
    entries.length > 0
      ? entries
      : apiTracks.map((t) => ({
          type: "track" as const,
          item: t,
          playedAt: "",
        }));

  const cardPreviewIndexMap = new Map<string, number>();
  rawEntries.forEach((e, i) => {
    let previewId: string | null = null;
    if (e.type === "station")
      previewId = e.item.previewTrack ? String(e.item.previewTrack.id) : null;
    if (e.type === "mix")
      previewId = e.item.preview_track ? e.item.preview_track.id : null;
    if (e.type === "album")
      previewId = e.item.previewTrack ? String(e.item.previewTrack.id) : null;
    if (e.type === "genre")
      previewId = e.item.previewTrack ? String(e.item.previewTrack.id) : null;
    if (e.type === "madeForYou")
      previewId = e.item.previewTrack ? String(e.item.previewTrack.id) : null;
    if (previewId !== null && !cardPreviewIndexMap.has(previewId)) {
      cardPreviewIndexMap.set(previewId, i);
    }
  });

  const recentEntries = rawEntries.filter((e, i) => {
    if (e.type !== "track") return true;
    const cardIdx = cardPreviewIndexMap.get(String(e.item.id));
    return cardIdx === undefined || cardIdx > i;
  });

  if (!recentEntries.length) return null;

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
            return <MixCard key={`mix-${entry.item.id}`} mix={entry.item} />;
          if (entry.type === "playlist")
            return (
              <PlaylistCard
                key={`playlist-${entry.item.id}`}
                item={entry.item}
                widthClassName="w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]"
              />
            );
          if (entry.type === "album")
            return (
              <AlbumCard
                key={`album-${entry.item.id}`}
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
