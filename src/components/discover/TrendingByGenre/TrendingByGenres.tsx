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


const GENRE_IMAGES: Record<string, string> = {
  "hip-hop":
    "https://images.unsplash.com/photo-1547355253-ff0740f859b4?w=400&q=80",
  "hip hop":
    "https://images.unsplash.com/photo-1547355253-ff0740f859b4?w=400&q=80",
  rap: "https://images.unsplash.com/photo-1547355253-ff0740f859b4?w=400&q=80",
  pop: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80",
  "r&b":
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
  rnb: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
  soul: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
  electronic:
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
  edm: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
  house:
    "https://images.unsplash.com/photo-1571266028243-d220c6a7efd9?w=400&q=80",
  "deep house":
    "https://images.unsplash.com/photo-1571266028243-d220c6a7efd9?w=400&q=80",
  techno:
    "https://images.unsplash.com/photo-1571266028243-d220c6a7efd9?w=400&q=80",
  trance:
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
  synthwave:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
  ambient:
    "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&q=80",
  rock: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80",
  metal:
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80",
  alternative:
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80",
  jazz: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&q=80",
  blues:
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&q=80",
  classical:
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&q=80",
  orchestra:
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&q=80",
  country:
    "https://images.unsplash.com/photo-1469022563428-aa04fef9f5a2?w=400&q=80",
  folk: "https://images.unsplash.com/photo-1469022563428-aa04fef9f5a2?w=400&q=80",
  latin:
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
  reggae:
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
  funk: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400&q=80",
  disco:
    "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400&q=80",
  afrobeats:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
  afrobeat:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
  indie:
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80",
  "lo-fi":
    "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&q=80",
  lofi: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&q=80",
  trap: "https://images.unsplash.com/photo-1547355253-ff0740f859b4?w=400&q=80",
  drill: "https://images.unsplash.com/photo-1547355253-ff0740f859b4?w=400&q=80",
};

const DEFAULT_GENRE_IMAGE =
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80";

const MOCK_GENRES = [
  { genre_id: "genre-1", genre_name: "Hip-Hop" },
  { genre_id: "genre-2", genre_name: "Pop" },
  { genre_id: "genre-3", genre_name: "Electronic" },
  { genre_id: "genre-4", genre_name: "Rock" },
  { genre_id: "genre-5", genre_name: "Jazz" },
  { genre_id: "genre-6", genre_name: "Classical" },
  { genre_id: "genre-7", genre_name: "Country" },
  { genre_id: "genre-8", genre_name: "Reggae" },
];

const TrendingByGenres = ({ genres }: Props) => {
  const displayGenres = genres.length > 0 ? genres : MOCK_GENRES;

  const items: BuzzingPlaylist[] = displayGenres.map((g) => ({
    id: g.genre_id,
    genre: g.genre_name,
    cover_image:
      GENRE_IMAGES[(g.genre_name || "").toLowerCase()] ?? DEFAULT_GENRE_IMAGE,
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
