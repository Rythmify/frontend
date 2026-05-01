import { useNavigate, useLocation } from "react-router-dom";
import GoMobileSection from "@/components/UI/GoMobile";
import SearchFilters, { type FiltersData } from "@/components/SearchComponents/Searchfilters";

const TABS = [
  { label: "Everything", path: "/search" },
  { label: "Tracks",     path: "/search/sounds" },
  { label: "People",     path: "/search/people" },
  { label: "Albums",     path: "/search/albums" },
  { label: "Playlists",  path: "/search/sets" },
] as const;

interface SearchSidebarProps {
  query: string;
  filters?: FiltersData;
}

export default function SearchSidebar({ query, filters }: SearchSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const activePath = TABS.find((t) => location.pathname === t.path)?.path ?? "/search";

  const handleTabClick = (path: string) => {
    if (path === activePath) return;
    const qs = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    navigate(`${path}${qs}`);
  };

  return (
    <aside className="flex flex-col gap-6 w-[220px] shrink-0">

      {/* Heading */}
      {query.trim() && (
        <h1 className="text-lg font-bold text-text leading-snug">
          Search results for{" "}
          <span className="text-text-hover">"{query}"</span>
        </h1>
      )}

      {/* Tab navigation */}
      <nav className="flex flex-col">
        {TABS.map((tab) => {
          const isActive = tab.path === activePath;
          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              disabled={isActive}
              className={`
                w-full text-left px-3 py-[10px] text-sm font-semibold
                rounded-sm transition-colors
                ${isActive
                  ? "bg-white text-black cursor-default"
                  : "text-text hover:text-text-hover bg-transparent cursor-pointer"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Filters — rendered only on typed tabs, content determined by pathname */}
      {filters && <SearchFilters filters={filters} />}

      {/* Go Mobile + Footer */}
      <GoMobileSection showFooter />

    </aside>
  );
}