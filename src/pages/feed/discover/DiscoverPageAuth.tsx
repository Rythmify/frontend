import TrackCard from "@/components/UI/Card";
import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import { mockDiscoverTracks } from "@/mocks/discover";
import DiscoverSideBar from "@/components/discover/sidebar/DiscoverSideBar";
import RecentlyPlayed from "@/components/discover/RecentlyPlayed";
import AlbumsForYou from "@/components/discover/AlbumsForYou";

const DiscoverPageAuth = () => {
  return (
    <div className="min-h-screen w-full container px-4 md:px-8 lg:px-20 bg-bg">
      {/* Two Column Layout */}
      <div className="flex gap-11 p-0">
        {/* Main Content — 70% */}
        <div className="flex flex-col gap-10 flex-[8] min-w-0 pt-10">
          <HorizontalCarousel title="More of what you like">
            {mockDiscoverTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </HorizontalCarousel>
          <RecentlyPlayed />
          <AlbumsForYou />
        </div>

        {/* Sidebar — 30% */}
        <div className="flex flex-col gap-6 flex-[2] ps-2 pt-8">
          {/* sidebar components */}
          <DiscoverSideBar />
        </div>
      </div>
    </div>
  );
};

export default DiscoverPageAuth;
