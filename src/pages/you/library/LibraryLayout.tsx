import { Outlet, useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { label: "Overview", path: "/you/library" },
  { label: "Likes", path: "/you/likes" },
  { label: "Playlists", path: "/you/sets" },
  { label: "Albums", path: "/you/albums" },
  { label: "Following", path: "/you/following" },
  { label: "History", path: "/you/history" },
];

export default function LibraryLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = tabs.find((t) => t.path === location.pathname)?.label ?? "Overview";

  return (
    <div className="container px-4 md:px-8 lg:px-20 py-8">
      {/* Tab Navigation */}
      <nav className="flex gap-6  mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label;
          return (
            <button
              key={tab.label}
              data-test={`library-tab-${tab.label.toLowerCase()}`}
              onClick={() => navigate(tab.path)}
              className={`pb-3 pt-1 px-1 text-2xl font-bold cursor-pointer border-b-2 -mb-px transition-colors ${
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

      <Outlet />
    </div>
  );
}
