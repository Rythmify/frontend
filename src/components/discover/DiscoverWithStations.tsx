import HorizontalCarousel from "./HorizontalCarousel";
import StationCard from "@/components/UI/StationCard/StationCard";
import { mapDiscoveryStation } from "@/services/api/discover.mapper";
import type { DiscoveryStation } from "@/services/api/discover.service";

interface Props {
  stations: DiscoveryStation[];
}

const DiscoverWithStations = ({ stations }: Props) => {
  if (!stations.length) return null;

  const items = stations.map(mapDiscoveryStation);

  return (
    <div data-test="section-discover-with-stations">
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
    </div>
  );
};

export default DiscoverWithStations;
