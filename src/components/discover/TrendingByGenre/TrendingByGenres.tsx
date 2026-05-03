import HorizontalCarousel from "../HorizontalCarousel";
import GenreCard from "@/components/UI/GenreCard/GenreCard";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";
import type { DiscoveryTrack } from "@/services/api/discover.service";
import type { Track } from "@/types/track";

interface BuzzingPlaylist {
  id: string;
  genre: string;
  cover_image: string | null;
  track_count: number;
  previewTrack?: Track;
}
interface Props {
  genres: {
    genre_id: string;
    genre_name: string;
    preview_track?: DiscoveryTrack;
  }[];
}

const TrendingByGenres = ({ genres }: Props) => {
  if (!genres.length) return null;

  const items: BuzzingPlaylist[] = genres.map((g) => ({
    id: g.genre_id,
    genre: g.genre_name,
    cover_image: g.preview_track?.cover_image ?? null,
    track_count: 0,
    previewTrack: g.preview_track
      ? mapDiscoveryTrack(g.preview_track)
      : undefined,
  }));

  return (
    <div data-test="section-trending-by-genres">
      <HorizontalCarousel
        title="Trending by genres"
        data-section="trending-by-genres"
      >
        {items.map((item, i) => (
          <GenreCard key={item.id} item={item} index={i} />
        ))}
      </HorizontalCarousel>
    </div>
  );
};

export default TrendingByGenres;
