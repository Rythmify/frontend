import { useState, useEffect } from "react";
import DiscoverSideBar from "@/components/discover/sidebar/DiscoverSideBar";
import RecentlyPlayed from "@/components/discover/RecentlyPlayed";
import AlbumsForYou from "@/components/discover/AlbumsForYou";
import NewCrewForYou from "@/components/discover/NewCrewForYou";
import DiscoverWithStations from "@/components/discover/DiscoverWithStations";
import MixedForYou from "@/components/discover/MixedForYou";
import TrendingByGenres from "@/components/discover/TrendingByGenres";
import MadeForYou from "@/components/discover/MadeForYou";
import MoreOfWhatYouLike from "@/components/discover/MoreOfWhatYouLike";
import { getHome } from "@/services/api/discover.service";

const DiscoverPageAuth = () => {
  const [homeError, setHomeError] = useState<string | null>(null);

  useEffect(() => {
    getHome().catch((err: Error) => setHomeError(err.message));
  }, []);

  return (
    <div className="min-h-screen w-full container px-4 md:px-8 lg:px-20 bg-bg">
      <div className="flex gap-11 p-0">
        {/* Main Content */}
        <div className="flex flex-col gap-20 flex-8 min-w-0 pt-10">
          {homeError && (
            <p className="text-xs text-text-secondary">{homeError}</p>
          )}
          <MoreOfWhatYouLike />
          <RecentlyPlayed />
          <MixedForYou />
          <AlbumsForYou />
          <MadeForYou />
          <TrendingByGenres />
          <DiscoverWithStations />
          <NewCrewForYou />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 flex-2 ps-2 pt-8">
          <DiscoverSideBar />
        </div>
      </div>
    </div>
  );
};

export default DiscoverPageAuth;
