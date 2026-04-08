import React, { useState, useEffect } from "react";
import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import SetsHeader from "@/components/Playlist/SetsHeader";
import {
  getMyPlaylists,
  getLikedPlaylists,
  type Playlist,
} from "@/services/api/playlist/playlist.service";
import PlaylistCard from "@/components/Playlist/PlaylistCard";
import { useLikesStore } from "@/stores/likes.store";

const SkeletonCard = () => (
  <div className="flex flex-col gap-2 w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px] shrink-0 animate-pulse">
    <div className="w-full aspect-square rounded-md bg-[#303030]" />
    <div className="h-3 bg-[#303030] rounded w-3/4" />
    <div className="h-3 bg-[#303030] rounded w-1/2" />
  </div>
);

export default function AlbumsPage() {
  const [filterText, setFilterText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [createdAlbums, setCreatedAlbums] = useState<Playlist[]>([]);
  const [apiLikedAlbums, setApiLikedAlbums] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { likedAlbums: storeLikedAlbums } = useLikesStore();

  const filterOptions = ["All", "Created", "Liked"];

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      setError(null);
      try {
        const [created, liked] = await Promise.all([
          getMyPlaylists({ limit: 50 }),
          getLikedPlaylists({ limit: 50 }),
        ]);
        setCreatedAlbums(created.data.items.filter((p) => p.is_album_view));
        setApiLikedAlbums(liked.data.items.filter((p) => p.is_album_view));
      } catch (err) {
        setError("Failed to load albums. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  // Merge API liked albums with store liked albums (store takes priority / fills gaps)
  const allLikedAlbums: Playlist[] = (() => {
    const merged = [...apiLikedAlbums, ...storeLikedAlbums];
    const seen = new Set<string>();
    return merged.filter((p) => {
      if (seen.has(p.playlist_id)) return false;
      seen.add(p.playlist_id);
      return true;
    });
  })();

  // Filter albums by search
  const match = (name: string) =>
    name.toLowerCase().includes(filterText.toLowerCase());

  // Pick which albums to show based on filter & search
  const visibleAlbums: Playlist[] = (() => {
    if (activeFilter === "Created")
      return createdAlbums.filter((p) => match(p.name));
    if (activeFilter === "Liked")
      return allLikedAlbums.filter((p) => match(p.name));
    // Merge created + liked, remove duplicates
    const merged = [...createdAlbums, ...allLikedAlbums];
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

  return (
    <div className="min-h-screen flex flex-col">
      {(visibleAlbums.length > 0 || loading) && (
        <SetsHeader
          title="Hear your own albums and the albums you've liked:"
          filterText={filterText}
          setFilterText={setFilterText}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          filterOptions={filterOptions}
        />
      )}

      {error && <p className="text-red-500 text-sm px-4 mt-2">{error}</p>}

      <div className="flex px-4 pt-2 pb-10">
        {loading ? (
          <HorizontalCarousel title=" ">{skeletons}</HorizontalCarousel>
        ) : visibleAlbums.length > 0 ? (
          <HorizontalCarousel title=" ">
            {visibleAlbums.map((p) => (
              <PlaylistCard key={p.playlist_id} playlist={p} />
            ))}
          </HorizontalCarousel>
        ) : (
          <div className="flex flex-1 justify-center items-center">
            <p className="text-text-upload text-2xl font-bold text-center pt-16 pb-30">
              You haven't liked any albums yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
