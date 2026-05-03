import { Outlet, useLocation, useNavigate } from "react-router-dom";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import { useDownloadStore } from "@/stores/useDownload";
import { useAuthStore } from "@/stores/auth.store";

const tabs = [
  { label: "Overview", path: "/you/library" },
  { label: "Likes", path: "/you/likes" },
  { label: "Playlists", path: "/you/sets" },
  { label: "Albums", path: "/you/albums" },
  { label: "Stations", path: "/you/stations" },
  { label: "Following", path: "/you/following" },
  { label: "History", path: "/you/history" },
  { label: "Downloads", path: "/you/downloads" },
];

export default function LibraryLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { downloadedTracks } = useDownloadStore();

  const isPro = user?.isPro ?? false;
  const activeTab =
    tabs.find((t) => t.path === location.pathname)?.label ?? "Overview";

  return (
    <div className="container px-4 md:px-8 lg:px-20 py-6 md:py-8">
      {/* Tab Navigation */}
      <nav className="flex gap-2 sm:gap-4 md:gap-6 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label;
          const isDownloads = tab.label === "Downloads";

          return (
            <button
              key={tab.label}
              data-test={`library-tab-${tab.label.toLowerCase()}`}
              onClick={() => navigate(tab.path)}
              className={`relative pb-2 sm:pb-3 pt-0.5 sm:pt-1 px-0.5 sm:px-1 text-sm sm:text-lg md:text-2xl font-bold cursor-pointer border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? "text-white border-white"
                  : "text-text-secondary border-transparent hover:text-white"
              }`}
            >
              {tab.label}

              {/* Badge: count for premium users, lock for non-premium */}
              {isDownloads && (
                <>
                  {isPro && downloadedTracks.length > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/15 text-white text-[10px] font-bold px-1.5 py-0.5 leading-none align-middle">
                      {downloadedTracks.length}
                    </span>
                  )}
                  {!isPro && (
                    <span className="ml-1.5 inline-flex items-center justify-center align-middle opacity-40">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 1 1 6 0v2H9V6zm9 14H6V10h12v10zm-6-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                      </svg>
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-0 sm:px-2">
        <Outlet />
      </div>

      <div className="py-9 my-5 px-4">
        <GuestPageFooter />
      </div>
    </div>
  );
}
