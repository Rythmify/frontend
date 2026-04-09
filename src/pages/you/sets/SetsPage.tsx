import React, { useState, useEffect, useMemo } from "react";
import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import PlaylistCard, {
  type PlaylistCardData,
} from "@/components/UI/PlaylistCard/PlaylistCard";
import {
  getMyPlaylists,
  getLikedPlaylists,
  type Playlist,
} from "@/services/api/playlist/playlist.service";

// Responsive width to match your skeleton and UI requirements
const CARD_WIDTH = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]";

const SkeletonCard = () => (
  <div className={`flex flex-col gap-2 ${CARD_WIDTH} shrink-0 animate-pulse`}>
    <div className="w-full aspect-square rounded-md bg-[#303030]" />
    <div className="h-3 bg-[#303030] rounded w-3/4" />
    <div className="h-3 bg-[#303030] rounded w-1/2" />
  </div>
);

export default function SetsPage() {
  // UI State
  const [filterText, setFilterText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Data State
  const [createdPlaylists, setCreatedPlaylists] = useState<Playlist[]>([]);
  const [likedPlaylists, setLikedPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterOptions = ["All", "Created", "Liked"];

  // Fetch data on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [created, liked] = await Promise.all([
          getMyPlaylists({ limit: 50 }),
          getLikedPlaylists({ limit: 50 }),
        ]);
        setCreatedPlaylists(created.data.items);
        setLikedPlaylists(liked.data.items);
      } catch (err) {
        setError("Failed to load your library. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filter and Search Logic
  const visiblePlaylists = useMemo(() => {
    const match = (name: string) =>
      name.toLowerCase().includes(filterText.toLowerCase());

    let list: Playlist[] = [];
    if (activeFilter === "Created") {
      list = createdPlaylists;
    } else if (activeFilter === "Liked") {
      list = likedPlaylists;
    } else {
      // "All" - Merge and remove duplicates by ID
      const merged = [...createdPlaylists, ...likedPlaylists];
      const seen = new Set<string>();
      list = merged.filter((p) => {
        if (seen.has(p.playlist_id)) return false;
        seen.add(p.playlist_id);
        return true;
      });
    }
    return list.filter((p) => match(p.name));
  }, [activeFilter, filterText, createdPlaylists, likedPlaylists]);

  // Helper to map Playlist API data to PlaylistCard props
  const mapToCardData = (p: Playlist): PlaylistCardData => ({
    id: p.playlist_id,
    title: p.name,
    owner: p.owner_user_id,
    coverUrl: p.cover_image || null,
    isPrivate: !p.is_public,
    isLiked: likedPlaylists.some((lp) => lp.playlist_id === p.playlist_id),
  });

  const skeletons = Array.from({ length: 6 }).map((_, i) => (
    <SkeletonCard key={i} />
  ));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 px-4 gap-4">
        <div className="text-white text-[17px] font-bold">
          Hear your own playlists and the playlists you've liked:
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter"
              className="text-[14px] text-white border border-transparent py-2 pr-10 pl-4 rounded-sm bg-[#303030] focus:outline-none focus:border-text-secondary w-full transition-all placeholder:text-text-secondary"
            />
            {filterText && (
              <button
                onClick={() => setFilterText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-all cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M6.94 8l-4.47 4.47 1.06 1.06L8 9.06l4.47 4.47 1.06-1.06L9.06 8l4.47-4.47-1.06-1.06L8 6.94 3.53 2.47 2.47 3.53 6.94 8z" />
                </svg>
              </button>
            )}
          </div>

          {/* Dropdown Menu */}
          <div className="relative w-full sm:w-32">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full border border-transparent rounded-sm py-2 px-3 bg-[#303030] focus:outline-none focus:border-text-secondary transition-all text-[14px] text-white font-bold hover:text-[#838383] cursor-pointer"
            >
              <span>{activeFilter}</span>
              <svg
                viewBox="0 0 24 24"
                className={`w-4 h-4 fill-current transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="M20.5303 9.53033L12 18.0607L3.46967 9.53033L4.53033 8.46967L12 15.9393L19.4697 8.46967L20.5303 9.53033Z" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute right-0 mt-1 w-full border font-bold border-text-secondary rounded-sm shadow-xl z-20 bg-[#303030] overflow-hidden">
                {filterOptions.map((option) => (
                  <li key={option}>
                    <button
                      onClick={() => {
                        setActiveFilter(option);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[14px] hover:bg-black transition-colors ${
                        activeFilter === option
                          ? "text-white"
                          : "text-text-secondary hover:text-white cursor-pointer"
                      }`}
                    >
                      {option}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Carousel */}
      <div className="px-4 pt-2 pb-10">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {loading ? (
          <HorizontalCarousel title=" ">{skeletons}</HorizontalCarousel>
        ) : visiblePlaylists.length > 0 ? (
          <HorizontalCarousel title=" ">
            {visiblePlaylists.map((p) => (
              <PlaylistCard
                key={p.playlist_id}
                item={mapToCardData(p)}
                widthClassName={CARD_WIDTH}
              />
            ))}
          </HorizontalCarousel>
        ) : (
          <div className="flex flex-1 justify-center items-center py-20">
            <p className="text-text-upload text-2xl font-bold text-center">
              {filterText
                ? "No playlists match your search."
                : "You haven't created or liked any playlists yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
