import { Outlet, useLocation, useNavigate } from "react-router-dom";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
const tabs = [
  { label: "Overview", path: "/you/library" },
  { label: "Likes", path: "/you/likes" },
  { label: "Playlists", path: "/you/sets" },
  { label: "Albums", path: "/you/albums" },
  { label: "Stations", path: "/you/stations" },
  { label: "Following", path: "/you/following" },
  { label: "History", path: "/you/history" },
];

export default function LibraryLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = tabs.find((t) => t.path === location.pathname)?.label ?? "Overview";

  return (
    <div className="container px-4 md:px-8 lg:px-20 py-6 md:py-8">
      {/* Tab Navigation */}
      <nav className="flex gap-2 sm:gap-4 md:gap-6 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label;
          return (
            <button
              key={tab.label}
              data-test={`library-tab-${tab.label.toLowerCase()}`}
              onClick={() => navigate(tab.path)}
              className={`pb-2 sm:pb-3 pt-0.5 sm:pt-1 px-0.5 sm:px-1 text-sm sm:text-lg md:text-2xl font-bold cursor-pointer border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? "text-white border-white"
                  : "text-text-secondary border-transparent hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="px-0 sm:px-2">
        <Outlet />
      </div>
      <div className="py-9 my-5 px-4">
              <GuestPageFooter></GuestPageFooter>
            </div>
    </div>
  );
}
