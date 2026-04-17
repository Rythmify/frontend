import React, { useState, useEffect, useMemo } from "react";
import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import SetsHeader from "@/components/playlist/SetsHeader";
import {
  getMyPlaylists,
  getLikedPlaylists,
  type Playlist,
} from "@/services/api/playlist/playlist.service";
import PlaylistCard, {
  type PlaylistCardData,
} from "@/components/UI/PlaylistCard/PlaylistCard";
import { useAuthStore } from "@/stores/auth.store";

const CARD_WIDTH = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]";

const SkeletonCard = () => (
  <div className={`flex flex-col gap-2 ${CARD_WIDTH} shrink-0 animate-pulse`}>
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
  const [likedAlbums, setLikedAlbums] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user: currentUser } = useAuthStore();
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
        setLikedAlbums(liked.data.items.filter((p) => p.is_album_view));
      } catch (err) {
        setError("Failed to load albums.");
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  const visibleAlbums = useMemo(() => {
    const match = (name: string) =>
      name.toLowerCase().includes(filterText.toLowerCase());
    let list: Playlist[] = [];

    if (activeFilter === "Created") {
      list = createdAlbums;
    } else if (activeFilter === "Liked") {
      list = likedAlbums;
    } else {
      const merged = [...createdAlbums, ...likedAlbums];
      const seen = new Set<string>();
      list = merged.filter((p) => {
        if (seen.has(p.playlist_id)) return false;
        seen.add(p.playlist_id);
        return true;
      });
    }
    return list.filter((p) => match(p.name));
  }, [activeFilter, filterText, createdAlbums, likedAlbums]);

  const mapToCardData = (p: Playlist): PlaylistCardData => ({
    id: p.playlist_id,
    title: p.name,
    owner: p.owner_user_id,
    ownerUsername:
      currentUser && p.owner_user_id === currentUser.id
        ? currentUser.username
        : undefined,
    coverUrl: p.cover_image || null,
    isPrivate: !p.is_public,
    isLiked: likedAlbums.some((la) => la.playlist_id === p.playlist_id),
    isAlbumView: true,
  });

  const skeletons = Array.from({ length: 6 }).map((_, i) => (
    <SkeletonCard key={i} />
  ));

  return (
    <div className="min-h-screen flex flex-col">
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

      <div className="px-4 pt-2 pb-10">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {loading ? (
          <HorizontalCarousel title=" ">{skeletons}</HorizontalCarousel>
        ) : visibleAlbums.length > 0 ? (
          <HorizontalCarousel title=" ">
            {visibleAlbums.map((p) => (
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
                ? "No albums match your search."
                : "You haven't liked any albums yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
