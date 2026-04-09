import { useState } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import GenreCard from "@/components/UI/GenreCard/GenreCard";

interface BuzzingPlaylist {
  id: string;
  genre: string;
  cover_image: string | null;
  track_count: number;
}

const mockGenres: BuzzingPlaylist[] = [
  { id: "genre-1", genre: "Hip-Hop", cover_image: "https://picsum.photos/200/200?random=601", track_count: 1240 },
  { id: "genre-2", genre: "Pop", cover_image: "https://picsum.photos/200/200?random=602", track_count: 980 },
  { id: "genre-3", genre: "R&B", cover_image: "https://picsum.photos/200/200?random=603", track_count: 760 },
  { id: "genre-4", genre: "Electronic", cover_image: "https://picsum.photos/200/200?random=604", track_count: 850 },
  { id: "genre-5", genre: "Synthwave", cover_image: "https://picsum.photos/200/200?random=605", track_count: 430 },
  { id: "genre-6", genre: "Ambient", cover_image: "https://picsum.photos/200/200?random=606", track_count: 520 },
  { id: "genre-7", genre: "House", cover_image: "https://picsum.photos/200/200?random=607", track_count: 670 },
  { id: "genre-8", genre: "Trance", cover_image: "https://picsum.photos/200/200?random=608", track_count: 390 },
];

const TrendingByGenres = () => {
  const [genres] = useState<BuzzingPlaylist[]>(mockGenres);

  return (
    <HorizontalCarousel title="Trending by genres" data-section="trending-by-genres">
      {genres.map((item, i) => (
        <GenreCard key={item.id} item={item} index={i} />
      ))}
    </HorizontalCarousel>
  );
};

export default TrendingByGenres;
