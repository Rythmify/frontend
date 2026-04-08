import { Outlet } from "react-router-dom";

/**
 * SearchPage – wrapper layout for all /search/* child routes.
 * Renders the active child route via <Outlet />.
 */
export default function SearchPage() {
  return (
    <div data-test="search-page" style={{ padding: "20px 24px" }}>
      <Outlet />
    </div>
  );
}
