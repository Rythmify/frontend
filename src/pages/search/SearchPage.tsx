import { Outlet, useSearchParams, useLocation } from "react-router-dom";
import SearchSidebar from "@/components/SearchComponents/SearchSidebar";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const location = useLocation();

  const isEverything = location.pathname === "/search";

  return (
    <div data-test="search-page" className="flex flex-row gap-8 px-6 py-5">
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