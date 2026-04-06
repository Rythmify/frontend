import HorizontalCarousel from "./HorizontalCarousel";
import StationCard from "@/components/UI/StationCard/StationCard";
import { mockRecentlyPlayedStations } from "@/services/mocks/discover";

const DiscoverWithStations = () => {
  return (
    <HorizontalCarousel title="Discover with Stations">
      {mockRecentlyPlayedStations.map((station, i) => (
        <StationCard key={station.id} station={station} colorIndex={i} widthClassName="w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]" />
      ))}
    </HorizontalCarousel>
  );
};

export default DiscoverWithStations;
