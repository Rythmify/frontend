import { mockRecentlyPlayedStations } from "@/services/mocks/discover";
import StationCard from "@/components/UI/StationCard/StationCard";

const CARD_WIDTH = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]";

export default function StationsPage() {
  const stations = mockRecentlyPlayedStations;

  return (
    <div className="flex flex-col gap-6 w-full">
      <p className="text-white text-lg font-semibold">Here the stations you have liked:</p>

      {stations.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-white font-bold text-2xl">You have no stations yet.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {stations.map((station, i) => (
            <StationCard key={station.id} station={station} widthClassName={CARD_WIDTH} colorIndex={i} />
          ))}
        </div>
      )}
    </div>
  );
}
