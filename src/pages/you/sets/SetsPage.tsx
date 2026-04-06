import React, { useState, useEffect } from "react";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import SetsHeader from "@/components/Playlist/SetsHeader";
import {
  getMyPlaylists,
  getLikedPlaylists,
  type Playlist,
} from "@/services/api/playlist/playlist.service";
import PlaylistCard from "@/components/Playlist/PlaylistCard";

const SkeletonCard = () => (
  <div className="flex flex-col gap-2 w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px] shrink-0 animate-pulse">
    <div className="w-full aspect-square rounded-md bg-[#303030]" />
    <div className="h-3 bg-[#303030] rounded w-3/4" />
    <div className="h-3 bg-[#303030] rounded w-1/2" />
  </div>
);

export default function SetsPage() {
  const [filterText, setFilterText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [createdPlaylists, setCreatedPlaylists] = useState<Playlist[]>([]);
  const [likedPlaylists, setLikedPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterOptions = ["All", "Created", "Liked"];

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

  // Search filter
  const match = (name: string) =>
    name.toLowerCase().includes(filterText.toLowerCase());

  // Pick which playlists to show based on active filter-> dropdown and search text
  const visiblePlaylists: Playlist[] = (() => {
    if (activeFilter === "Created")
      return createdPlaylists.filter((p) => match(p.name));
    if (activeFilter === "Liked")
      return likedPlaylists.filter((p) => match(p.name));
    const merged = [...createdPlaylists, ...likedPlaylists];
    const seen = new Set<string>();
    return merged.filter((p) => {
      if (seen.has(p.playlist_id)) return false;
      seen.add(p.playlist_id);
      return match(p.name);
    });
  })();

  const skeletons = Array.from({ length: 6 }).map((_, i) => (
    <SkeletonCard key={i} />
  ));

  const carouselContent = loading
    ? skeletons
    : visiblePlaylists.length > 0
      ? visiblePlaylists.map((p) => (
          <PlaylistCard key={p.playlist_id} playlist={p} />
        ))
      : [
          <p key="empty" className="text-gray-400 text-sm py-6 px-1">
            No playlists found.
          </p>,
        ];

  return (
    <div className="container px-4 md:px-4 lg:px-20">
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

      {error && <p className="text-red-500 text-sm px-4 mt-2">{error}</p>}
      
      {/*if there are no playlists and no error show a message to create playlists*/}
      {!loading && visiblePlaylists.length === 0 && !error && (
        <p className="text-text-upload text-lg py-6 px-1 justify-center flex">
          You haven't liked any playlists yet
        </p>
      )}
      <div className="px-4 pt-2 pb-10">
        <HorizontalCarousel title=" ">{carouselContent}</HorizontalCarousel>
      </div>

      <div className="py-2 px-4">
        <GuestPageFooter />
      </div>
    </div>
  );
}
