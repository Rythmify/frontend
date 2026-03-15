import TrackCard from "@/components/UI/Card";
import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import { mockDiscoverTracks } from "@/mocks/discover";
import ArtistToolsCard from "@/components/discover/sidebar/ArtistToolsCard";

const DiscoverPageAuth = () => {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#121212" }}>
      {/* Two Column Layout */}
      <div className="flex gap-11 p-0">
        {/* Main Content — 70% */}
        <div className="flex flex-col gap-10 flex-[7] min-w-0">
          <HorizontalCarousel title="More of what you like">
            {mockDiscoverTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </HorizontalCarousel>
        </div>

        {/* Sidebar — 30% */}
        <div className="flex flex-col gap-6 flex-[3]">
          {/* sidebar components go here */}
          <ArtistToolsCard />
        </div>
      </div>
    </div>
  );
};

export default DiscoverPageAuth;
