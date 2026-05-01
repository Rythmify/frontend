import { useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "@/services/api/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = "past_hour" | "past_day" | "past_week" | "past_month" | "past_year";
type Duration  = "short" | "medium" | "long" | "extra";

interface TrackFiltersData {
  available: {
    tags: string[];
    time_ranges: TimeRange[];
    durations: Duration[];
  };
  active: {
    tag: string | null;
    time_range: TimeRange | null;
    duration: Duration | null;
  };
}

interface TagFiltersData {
  available: { tags: string[] };
  active:    { tag: string | null };
}

interface UserFiltersData {
  available: { locations: string[] };
  active:    { location: string | null };
}

export type FiltersData =
  | TrackFiltersData
  | TagFiltersData
  | UserFiltersData
  | null;

interface SearchFiltersProps {
  filters: FiltersData;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  past_hour:  "Past hour",
  past_day:   "Past day",
  past_week:  "Past week",
  past_month: "Past month",
  past_year:  "Past year",
};

const DURATION_LABELS: Record<Duration, string> = {
  short:  "< 2 min",
  medium: "2–10 min",
  long:   "10–30 min",
  extra:  "> 30 min",
};

// ─── Hook: fetch all platform tags from /tags endpoint ────────────────────────
// Backend response shape:
// { data: [{ id, name }, ...], message, pagination }
// data is the array directly — NOT { data: { tags: [] } }

function usePlatformTags() {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    axiosInstance
      .get("/tags", { params: { limit: 100 } })
      .then(({ data }) => {
        if (cancelled) return;
        // data.data is the raw array of { id, name } objects
        const raw: any[] = Array.isArray(data?.data) ? data.data : [];
        const normalized = raw.map((t) =>
          typeof t === "string" ? t : String(t?.name ?? t?.value ?? t?.label ?? "")
        ).filter(Boolean);
        setTags(normalized);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  return tags;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DropdownItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-sm transition-colors rounded-sm
        ${active
          ? "text-text-hover font-semibold"
          : "text-text-secondary hover:text-text"
        }`}
    >
      {label}
    </button>
  );
}

function FilterDropdown({
  label,
  activeLabel,
  children,
}: {
  label: string;
  activeLabel: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between py-2 text-sm text-text hover:text-text-hover transition-colors"
      >
        <span className={activeLabel ? "text-text-hover font-semibold" : ""}>
          {activeLabel ?? label}
        </span>
        <i className={`fa-solid fa-chevron-down text-xs text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="flex flex-col pb-1">
          {children}
        </div>
      )}
    </div>
  );
}

function TagFilter({
  tags,
  activeTag,
  onSelect,
}: {
  tags: string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
}) {
  if (!Array.isArray(tags) || tags.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 pt-2">
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        Filter by tag
      </span>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelect(activeTag === tag ? null : tag)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-colors
              ${activeTag === tag
                ? "border-text-hover text-text-hover bg-text-hover/10"
                : "border-border text-text-secondary hover:border-text-secondary hover:text-text"
              }`}
          >
            <span className="text-text-muted">#</span>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

function LocationFilter({
  locations,
  activeLocation,
  onSelect,
}: {
  locations: string[];
  activeLocation: string | null;
  onSelect: (location: string | null) => void;
}) {
  if (!Array.isArray(locations) || locations.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 pt-2">
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        Filter by location
      </span>
      <div className="flex flex-col">
        {activeLocation && (
          <DropdownItem
            label="Any location"
            active={false}
            onClick={() => onSelect(null)}
          />
        )}
        {locations.map((loc) => (
          <DropdownItem
            key={loc}
            label={loc}
            active={activeLocation === loc}
            onClick={() => onSelect(activeLocation === loc ? null : loc)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SearchFilters({ filters }: SearchFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const platformTags = usePlatformTags();

  if (!filters) return null;

  const setParam = (key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null) next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace: true });
  };

  const pathname = location.pathname;

  // ── Tracks ─────────────────────────────────────────────────────────────────
  if (pathname === "/search/sounds") {
    const activeTimeRange = searchParams.get("time_range") as TimeRange | null;
    const activeDuration  = searchParams.get("duration")   as Duration  | null;
    const activeTag       = searchParams.get("tag");

    return (
      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <span className="text-xs font-semibold text-text uppercase tracking-wider mb-2">
          Filter results
        </span>

        {/* Time range */}
        <FilterDropdown
          label="Added any time"
          activeLabel={activeTimeRange ? TIME_RANGE_LABELS[activeTimeRange] : null}
        >
          <DropdownItem
            label="Any time"
            active={!activeTimeRange}
            onClick={() => setParam("time_range", null)}
          />
          {(["past_hour", "past_day", "past_week", "past_month", "past_year"] as TimeRange[]).map((tr) => (
            <DropdownItem
              key={tr}
              label={TIME_RANGE_LABELS[tr]}
              active={activeTimeRange === tr}
              onClick={() => setParam("time_range", activeTimeRange === tr ? null : tr)}
            />
          ))}
        </FilterDropdown>

        <div className="border-t border-border/50" />

        {/* Duration */}
        <FilterDropdown
          label="Any length"
          activeLabel={activeDuration ? DURATION_LABELS[activeDuration] : null}
        >
          <DropdownItem
            label="Any length"
            active={!activeDuration}
            onClick={() => setParam("duration", null)}
          />
          {(["short", "medium", "long", "extra"] as Duration[]).map((d) => (
            <DropdownItem
              key={d}
              label={DURATION_LABELS[d]}
              active={activeDuration === d}
              onClick={() => setParam("duration", activeDuration === d ? null : d)}
            />
          ))}
        </FilterDropdown>

        {/* Tags from /tags endpoint */}
        {platformTags.length > 0 && (
          <>
            <div className="border-t border-border/50 mt-1" />
            <TagFilter
              tags={platformTags}
              activeTag={activeTag}
              onSelect={(tag) => setParam("tag", tag)}
            />
          </>
        )}
      </div>
    );
  }

  // ── People ─────────────────────────────────────────────────────────────────
  if (pathname === "/search/people") {
    const rawLocations = Array.isArray((filters as any)?.available?.locations)
      ? (filters as any).available.locations
      : [];
    const locations: string[] = rawLocations.map((loc: any) =>
      typeof loc === "string" ? loc : (loc?.value ?? loc?.label ?? String(loc))
    );
    const activeLocation = searchParams.get("location");

    return (
      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <LocationFilter
          locations={locations}
          activeLocation={activeLocation}
          onSelect={(loc) => setParam("location", loc)}
        />
      </div>
    );
  }

  // ── Albums + Playlists — tags from /tags endpoint ─────────────────────────
  if (pathname === "/search/albums" || pathname === "/search/sets") {
    const activeTag = searchParams.get("tag");

    return (
      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <TagFilter
          tags={platformTags}
          activeTag={activeTag}
          onSelect={(tag) => setParam("tag", tag)}
        />
      </div>
    );
  }

  return null;
}