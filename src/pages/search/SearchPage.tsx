import { Outlet } from "react-router-dom";
import SearchSidebar from "@/components/SearchComponents/Searchsidebar";
/**
 * SearchPage – wrapper layout for all /search/* child routes.
 * Renders the active child route via <Outlet />.
 */
export default function SearchPage() {
  return (
    <div data-test="search-page" style={{ padding: "20px 25px", flexDirection: "row", display: "flex" }}>
    <SearchSidebar query={new URLSearchParams(window.location.search).get("q") ?? ""} />
        <div className="flex-1">
          tracks albums playlists users display part
          </div>
    </div>
  );
}
