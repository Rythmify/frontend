import { useState, useEffect } from "react";
import TrendingByGenres from "@/components/discover/TrendingByGenres";
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
      className="w-full container px-4 md:px-8 lg:px-20 bg-bg h-[calc(100vh-106px)]"
      data-test="discover-page-guest"
    >
      <div className="flex gap-11 p-0 h-full">
        {/* Main Content */}
        <div
          className="flex flex-col gap-20 flex-8 min-w-0 pt-10 overflow-y-auto [&::-webkit-scrollbar]:hidden"
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
          <TrendingByGenres
            genres={homeData?.trending_by_genre?.genres ?? []}
          />
        </div>

        {/* Sidebar */}
        <div
          className="flex-2 ps-2 pt-8"
          data-test="discover-guest-sidebar-container"
        >
          <GoMobile />
        </div>
      </div>
    </div>
  );
};

export default DiscoverPageGuest;
