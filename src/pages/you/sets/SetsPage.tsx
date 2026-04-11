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
import SetsHeader from "@/components/playlist/SetsHeader";

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
      <SetsHeader
        title="Hear your own playlists and the playlists you've liked:"
        filterText={filterText}
        setFilterText={setFilterText}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        filterOptions={filterOptions}
      />

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
