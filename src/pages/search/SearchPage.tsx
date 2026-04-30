import { Outlet, useSearchParams, useLocation } from "react-router-dom";
import SearchSidebar from "@/components/SearchComponents/Searchsidebar";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const location = useLocation();

  const isEverything = location.pathname === "/search";

  return (
    <div data-test="search-page" className="flex container px-4 md:px-8 lg:px-12 xl:px-20 flex-row gap-8 py-8 ">
      <SearchSidebar query={q} />
      <div className="flex-1">
        {isEverything ? (
          <div>Everything results for "{q}" go here</div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}