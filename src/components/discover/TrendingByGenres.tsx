import { useState } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import GenreCard from "@/components/UI/GenreCard/GenreCard";

interface BuzzingPlaylist {
  id: string;
  genre: string;
  cover_image: string | null;
  track_count: number;
}

const TrendingByGenres = () => {
  const [genres] = useState<BuzzingPlaylist[]>([]);
  if (genres.length === 0) return null;

  return (
    <HorizontalCarousel title="Trending by genres">
      {genres.map((item, i) => (
        <GenreCard key={item.id} item={item} index={i} />
      ))}
    </HorizontalCarousel>
  );
};

export default TrendingByGenres;
