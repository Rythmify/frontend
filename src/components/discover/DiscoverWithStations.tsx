import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import StationCard from "@/components/UI/StationCard/StationCard";
import { getHome } from "@/services/api/discover.service";
import { mapDiscoveryStation } from "@/services/api/discover.mapper";
import { mockRecentlyPlayedStations } from "@/services/mocks/discover";
import type { Station } from "@/types/station";

const DiscoverWithStations = () => {
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    getHome()
      .then((data) =>
        setStations(data.discover_with_stations.map(mapDiscoveryStation)),
      )
      .catch(() => setStations(mockRecentlyPlayedStations));
  }, []);

  const items = stations.length ? stations : mockRecentlyPlayedStations;

  return (
    <HorizontalCarousel title="Discover with Stations">
      {items.map((station, i) => (
        <StationCard
          key={station.id}
          station={station}
          colorIndex={i}
          widthClassName="w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]"
        />
      ))}
    </HorizontalCarousel>
  );
};

export default DiscoverWithStations;
