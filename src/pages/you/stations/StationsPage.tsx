import StationCard from "@/components/UI/StationCard/StationCard";
import { useLikesStore } from "@/stores/likes.store";

const CARD_WIDTH = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]";

export default function StationsPage() {
  const { likedStations } = useLikesStore();

  return (
    <div className="flex flex-col gap-6 w-full">
      <p className="text-white text-lg font-semibold">Stations you have liked:</p>

      {likedStations.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-white font-bold text-2xl">You have no liked stations yet.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {likedStations.map((station, i) => (
            <StationCard key={station.id} station={station} widthClassName={CARD_WIDTH} colorIndex={i} />
          ))}
        </div>
      )}
    </div>
  );
}
