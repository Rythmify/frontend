import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("@/services/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

import SearchFilters, { type FiltersData } from "@/components/SearchComponents/Searchfilters";
import axiosInstance from "@/services/api/axiosInstance";

const mockAxios = axiosInstance as unknown as { get: ReturnType<typeof vi.fn> };

function renderFilters(path: string, filters: FiltersData, search = "q=jazz") {
  return render(
    <MemoryRouter initialEntries={[`${path}?${search}`]}>
      <Routes>
        <Route path={path} element={<SearchFilters filters={filters} />} />
      </Routes>
    </MemoryRouter>,
  );
}

const tagFilters = {
  available: { tags: ["rock"] },
  active: { tag: null },
} as FiltersData;

const trackFilters = {
  available: {
    tags: ["rock"],
    time_ranges: ["past_day"],
    durations: ["short"],
  },
  active: { tag: null, time_range: null, duration: null },
} as FiltersData;

describe("SearchFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({
      data: { data: [{ name: "Jazz Fusion" }, "Lo Fi", { value: "Ambient" }, { label: "Soul" }] },
    });
  });

  it("renders nothing when filters are null", () => {
    const { container } = renderFilters("/search/sounds", null);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders track time, duration, and platform tag controls", async () => {
    const user = userEvent.setup();
    renderFilters("/search/sounds", trackFilters, "q=jazz&time_range=past_day&duration=short&tag=Lo+Fi");

    expect(screen.getByTestId("search-filters-title")).toHaveTextContent("Filter results");
    expect(screen.getByText("Past day")).toBeInTheDocument();
    expect(screen.getByText("< 2 min")).toBeInTheDocument();

    await user.click(screen.getByTestId("search-filter-dropdown-btn-added-any-time"));
    expect(screen.getByText("Any time")).toBeInTheDocument();
    expect(screen.getByText("Past week")).toBeInTheDocument();

    await user.click(screen.getByTestId("search-filter-dropdown-btn-any-length"));
    expect(screen.getByText("Any length")).toBeInTheDocument();
    expect(screen.getByText("> 30 min")).toBeInTheDocument();

    expect(await screen.findByTestId("search-filter-tag-lo-fi")).toBeInTheDocument();
    expect(mockAxios.get).toHaveBeenCalledWith("/tags", { params: { limit: 100 } });
  });

  it("updates track search params from dropdown items and tag pills", async () => {
    const user = userEvent.setup();
    renderFilters("/search/sounds", trackFilters);

    await user.click(screen.getByTestId("search-filter-dropdown-btn-added-any-time"));
    await user.click(screen.getByTestId("search-filter-item-past-week"));
    expect(screen.getAllByText("Past week").length).toBeGreaterThan(0);

    await user.click(screen.getByTestId("search-filter-dropdown-btn-any-length"));
    await user.click(screen.getByText("10–30 min"));
    expect(screen.getAllByText("10–30 min").length).toBeGreaterThan(0);

    await user.click(await screen.findByTestId("search-filter-tag-jazz-fusion"));
    expect(screen.getByTestId("search-filter-tag-jazz-fusion")).toHaveClass("text-text-hover");
  });

  it("clears active track params when selected again or Any is clicked", async () => {
    const user = userEvent.setup();
    renderFilters("/search/sounds", trackFilters, "q=jazz&time_range=past_week&duration=long&tag=Jazz+Fusion");

    await user.click(screen.getByTestId("search-filter-dropdown-btn-added-any-time"));
    await user.click(screen.getByTestId("search-filter-item-any-time"));
    expect(screen.getByText("Added any time")).toBeInTheDocument();

    await user.click(screen.getByTestId("search-filter-dropdown-btn-any-length"));
    await user.click(screen.getByTestId("search-filter-item-any-length"));
    expect(screen.getAllByText("Any length").length).toBeGreaterThan(0);

    await user.click(await screen.findByTestId("search-filter-tag-jazz-fusion"));
    expect(screen.getByTestId("search-filter-tag-jazz-fusion")).not.toHaveClass("text-text-hover");
  });

  it("renders people location filters and toggles the active location", async () => {
    const user = userEvent.setup();
    renderFilters(
      "/search/people",
      { available: { locations: [{ value: "Cairo" }, { label: "Paris" }] }, active: { location: null } } as any,
      "q=jazz&location=Cairo",
    );

    expect(screen.getByTestId("search-filter-by-location")).toBeInTheDocument();
    expect(screen.getByTestId("search-filter-item-cairo")).toHaveClass("text-text-hover");

    await user.click(screen.getByTestId("search-filter-item-any-location"));
    expect(screen.queryByTestId("search-filter-item-any-location")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("search-filter-item-paris"));
    expect(screen.getByTestId("search-filter-item-paris")).toHaveClass("text-text-hover");
  });

  it("renders album and playlist tag filters from platform tags", async () => {
    const user = userEvent.setup();
    renderFilters("/search/albums", tagFilters);
    await user.click(await screen.findByTestId("search-filter-tag-ambient"));
    expect(screen.getByTestId("search-filter-tag-ambient")).toHaveClass("text-text-hover");
  });

  it("returns null for unsupported paths and empty filter lists", async () => {
    const { container: unsupported } = renderFilters("/other", tagFilters);
    expect(unsupported).toBeEmptyDOMElement();

    mockAxios.get.mockResolvedValueOnce({ data: { data: [] } });
    const { container: albums } = renderFilters("/search/albums", tagFilters);
    await waitFor(() => expect(albums.querySelector("[data-test='search-filter-by-tag']")).not.toBeInTheDocument());

    const { container: people } = renderFilters(
      "/search/people",
      { available: { locations: [] }, active: { location: null } } as any,
    );
    expect(people.querySelector("[data-test='search-filter-by-location']")).not.toBeInTheDocument();
  });

  it("handles failed platform tag loading", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("nope"));
    renderFilters("/search/sets", tagFilters);
    await waitFor(() => expect(screen.queryByTestId("search-filter-by-tag")).not.toBeInTheDocument());
  });
});
