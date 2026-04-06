import { useState, useEffect } from "react";
import TrackCard from "@/components/UI/card/Card";
import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import { mockDiscoverTracks } from "@/services/mocks/discover";
import DiscoverSideBar from "@/components/discover/sidebar/DiscoverSideBar";
import RecentlyPlayed from "@/components/discover/RecentlyPlayed";
import AlbumsForYou from "@/components/discover/AlbumsForYou";
import NewCrewForYou from "@/components/discover/NewCrewForYou";
import DiscoverWithStations from "@/components/discover/DiscoverWithStations";
import { getHome } from "@/services/api/discover.service";
import type { HomeData } from "@/services/api/discover.service";

const DiscoverPageAuth = () => {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [homeError, setHomeError] = useState<string | null>(null);

  useEffect(() => {
    getHome()
      .then(setHomeData)
      .catch((err: Error) => setHomeError(err.message));
  }, []);

  return (
    <div className="min-h-screen w-full container px-4 md:px-8 lg:px-20 bg-bg">
      {/* Two Column Layout */}
      <div className="flex gap-11 p-0">
        {/* Main Content — 70% */}
        <div className="flex flex-col gap-15 flex-[8] min-w-0 pt-10">
          {homeError && (
            <p className="text-xs text-text-secondary">{homeError}</p>
          )}
          {/* TODO: replace mockDiscoverTracks with homeData.more_of_what_you_like
              once a MixCard component is built to render PersonalMix items */}
          <HorizontalCarousel title="More of what you like">
            {mockDiscoverTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </HorizontalCarousel>
          <RecentlyPlayed />
          <AlbumsForYou />
          <DiscoverWithStations />
          <NewCrewForYou />
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
