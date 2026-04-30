import { useNavigate, useLocation } from "react-router-dom";
import GoMobileSection from "@/components/UI/GoMobile"; 

// ─── Route map ────────────────────────────────────────────────────────────────

const TABS = [
  { label: "Everything", path: "/search" },
  { label: "Tracks",     path: "/search/sounds" },
  { label: "People",     path: "/search/people" },
  { label: "Albums",     path: "/search/albums" },
  { label: "Playlists",  path: "/search/sets" },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface SearchSidebarProps {
  /** The current search query — displayed in the heading and appended to nav links */
  query: string;
  /** Optional filters section — pass the relevant filter component per tab */
  filters?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchSidebar({ query, filters }: SearchSidebarProps) {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Exact-match the current path to determine the active tab.
  // /search matches Everything; /search/sounds matches Tracks, etc.
  const activePath = TABS.find((t) => location.pathname === t.path)?.path ?? "/search";

  const handleTabClick = (path: string) => {
    // If already on this tab, do nothing
    if (path === activePath) return;
    // Preserve the query param when switching tabs
    const qs = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    navigate(`${path}${qs}`);
  };

  return (
    <div className=" flex flex-col gap-6 w-[220px] shrink-0">

      {/* ── Heading ── */}
      {query.trim() && (
        <h1 className="text-lg font-bold text-text leading-snug">
          Search results for{" "}
          <span className="text-text-hover">"{query}"</span>
        </h1>
      )}

      {/* ── Tab navigation ── */}
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
                ${
                  isActive
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

      {/* ── Filters (injected per tab) ── */}
      {filters && (
        <div className="flex flex-col gap-3">
          {filters}
        </div>
      )}

      {/* ── Go Mobile + Footer ── */}
      <GoMobileSection showFooter />

    </div>
  );
}