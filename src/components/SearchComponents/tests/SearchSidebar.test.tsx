import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

vi.mock("@/components/UI/GoMobile", () => ({
  default: ({ showFooter }: { showFooter: boolean }) => (
    <div data-test="go-mobile" data-footer={String(showFooter)} />
  ),
}));

vi.mock("@/components/SearchComponents/Searchfilters", () => ({
  default: ({ filters }: any) => <div data-test="search-filters" data-kind={filters.kind ?? "filters"} />,
}));

import SearchSidebar from "@/components/SearchComponents/Searchsidebar";

function LocationProbe() {
  const location = useLocation();
  return <div data-test="location-probe">{location.pathname}{location.search}</div>;
}

function renderSidebar(path = "/search", query = "hello", filters: any = undefined) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/search/*"
          element={
            <>
              <SearchSidebar query={query} filters={filters} />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SearchSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading, tabs, mobile section, and active tab", () => {
    renderSidebar("/search", "hello");

    expect(screen.getByTestId("search-sidebar-title")).toHaveTextContent('Search results for "hello"');
    expect(screen.getByTestId("search-tab-everything")).toBeDisabled();
    expect(screen.getByTestId("search-tab-tracks")).not.toBeDisabled();
    expect(screen.getByTestId("go-mobile")).toHaveAttribute("data-footer", "true");
  });

  it("omits the heading when query is blank", () => {
    renderSidebar("/search", "   ");
    expect(screen.queryByTestId("search-sidebar-title")).not.toBeInTheDocument();
  });

  it("navigates to a different tab with the trimmed encoded query", async () => {
    const user = userEvent.setup();
    renderSidebar("/search", " jazz & blues ");

    await user.click(screen.getByTestId("search-tab-tracks"));

    expect(screen.getByTestId("location-probe")).toHaveTextContent("/search/sounds?q=jazz%20%26%20blues");
    expect(screen.getByTestId("search-tab-tracks")).toBeDisabled();
  });

  it("navigates without a query string when the query is empty", async () => {
    const user = userEvent.setup();
    renderSidebar("/search/people", "");

    await user.click(screen.getByTestId("search-tab-albums"));

    expect(screen.getByTestId("location-probe")).toHaveTextContent("/search/albums");
  });

  it("does not navigate when clicking the active tab", async () => {
    const user = userEvent.setup();
    renderSidebar("/search/sets", "mix");

    await user.click(screen.getByTestId("search-tab-playlists"));

    expect(screen.getByTestId("location-probe")).toHaveTextContent("/search/sets");
  });

  it("falls back to the everything tab for unknown nested paths", () => {
    renderSidebar("/search/unknown", "mix");
    expect(screen.getByTestId("search-tab-everything")).toBeDisabled();
  });

  it("renders filters only when provided", () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={["/search/sounds"]}>
        <Routes>
          <Route path="/search/*" element={<SearchSidebar query="mix" />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("search-filters")).not.toBeInTheDocument();

    rerender(
      <MemoryRouter initialEntries={["/search/sounds"]}>
        <Routes>
          <Route path="/search/*" element={<SearchSidebar query="mix" filters={{ kind: "track" } as any} />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("search-filters")).toHaveAttribute("data-kind", "track");
  });
});
