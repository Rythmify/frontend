import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import GenreCard from "@/components/UI/GenreCard/GenreCard";
import { getHome } from "@/services/api/discover.service";
import type { BuzzingPlaylist } from "@/services/api/discover.service";

const TrendingByGenres = () => {
  const [genres, setGenres] = useState<BuzzingPlaylist[]>([]);

  useEffect(() => {
    getHome()
      .then((data) => setGenres(data.artists_to_watch))
      .catch(() => {});
  }, []);

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
