import HorizontalCarousel from "./HorizontalCarousel";
import StationCard from "@/components/UI/StationCard/StationCard";
import { mapDiscoveryStation } from "@/services/api/discover.mapper";
import { mockRecentlyPlayedStations } from "@/services/mocks/discover";
import type { DiscoveryStation } from "@/services/api/discover.service";

interface Props {
  stations: DiscoveryStation[];
}

const DiscoverWithStations = ({ stations }: Props) => {
  const items = stations.length ? stations.map(mapDiscoveryStation) : mockRecentlyPlayedStations;

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
