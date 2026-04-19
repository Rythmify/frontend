import { useState, useEffect } from "react";
import TrendingByGenres from "@/components/discover/TrendingByGenre/TrendingByGenres";
import CuratedByRythmify from "@/components/discover/CuratedByRythmify/CuratedByRythmify";
import { getHome } from "@/services/api/discover.service";
import type { HomeData } from "@/services/api/discover.service";
import GoMobile from "@/components/UI/GoMobile";

const DiscoverPageGuest = () => {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [homeError, setHomeError] = useState<string | null>(null);

  useEffect(() => {
    getHome()
      .then(setHomeData)
      .catch((err: Error) => setHomeError(err.message));
  }, []);

  return (
    <div
      className="w-full container px-4 md:px-8 lg:px-20 bg-bg lg:h-[calc(100vh-106px)]"
      data-test="discover-page-guest"
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-11 p-0 lg:h-full">
        {/* Main Content */}
        <div
          className="flex flex-col gap-10 sm:gap-14 lg:gap-20 w-full lg:flex-8 min-w-0 pt-6 sm:pt-10 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          data-test="discover-guest-main-content"
        >
          {homeError && (
            <p
              className="text-xs text-text-secondary"
              data-test="discover-guest-error"
            >
              {homeError}
            </p>
          )}
          <CuratedByRythmify mixes={homeData?.curated?.mixes ?? []} />
          <TrendingByGenres
            genres={homeData?.trending_by_genre?.genres ?? []}
          />
        </div>

        {/* Sidebar — hidden below lg */}
        <div
          className="hidden lg:block lg:flex-2 ps-2 pt-8"
          data-test="discover-guest-sidebar-container"
        >
          <GoMobile />
        </div>
      </div>
    </div>
  );
};

export default DiscoverPageGuest;
