import TrackCard from "@/components/UI/Card";
import HorizontalCarousel from "@/components/DiscoverComponents/HorizontalCarousel";
import { mockDiscoverTracks } from "@/mocks/discover";
import ArtistToolsCard from "@/components/discover/sidebar/ArtistToolsCard";
import ListeningHistoryCard from "@/components/discover/sidebar/ListeningHistoryCard";
import ArtistToolsCard from "@/components/DiscoverComponents/Sidebar/ArtistToolsCard";

const DiscoverPageAuth = () => {
  return (
    <div
      className="min-h-screen w-full container px-4 md:px-8 lg:px-20"
      style={{ backgroundColor: "#121212" }}
    >
    <div
      className="min-h-screen w-full container px-4 md:px-8 lg:px-20"
      style={{ backgroundColor: "#121212" }}
    >
      {/* Two Column Layout */}
      <div className="flex gap-11 p-0">
        {/* Main Content — 70% */}
        <div className="flex flex-col gap-10 flex-[7] min-w-0 pt-10">
          <HorizontalCarousel title="More of what you like">
            {mockDiscoverTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </HorizontalCarousel>
        </div>

        {/* Sidebar — 30% */}
        <div className="flex flex-col gap-6 flex-[3] ps-2 pt-8">
          {/* sidebar components go here */}
          <ArtistToolsCard />
          <ListeningHistoryCard />
        </div>
      </div>
    </div>
  );
};

export default DiscoverPageAuth;
