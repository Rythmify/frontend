import React, { useState, useEffect, useMemo, useCallback } from "react";
import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import MixCard from "@/components/UI/MixCard/MixCard";
import GenreCard from "@/components/UI/GenreCard/GenreCard";
import MadeForYouCard, {
  type MadeForYouItem,
} from "@/components/UI/MadeForYouCard/MadeForYouCard";
import PlaylistCard, {
  type PlaylistCardData,
} from "@/components/UI/PlaylistCard/PlaylistCard";
import { getHome, type HomeData } from "@/services/api/discover.service";
import type { PersonalMix } from "@/services/api/discover.service";
import {
  getMyPlaylists,
  getLikedPlaylists,
  type Playlist,
} from "@/services/api/playlist/playlist.service";
import SetsHeader from "@/components/playlist/SetsHeader";
import { useAuthStore } from "@/stores/auth.store";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";
import { useLikesStore } from "@/stores/likes.store";
import type { BuzzingPlaylist } from "@/components/UI/GenreCard/GenreCard";

// Responsive width to match your skeleton and UI requirements
const CARD_WIDTH = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]";

type SetsMixCardItem = {
  id: string;
  mix_id: string;
  title: string;
  subtitle: string;
  cover_image: string | null;
  badgeWords: [string, string];
  badgeBg: string;
  previewTrack: ReturnType<typeof mapDiscoveryTrack>;
  label: string;
  flavor: PersonalMix["flavor"];
  genre_name: string | null;
  track_count: number;
  generated_at: string;
  is_liked_by_me?: boolean;
  madeKind?: undefined;
};

type SetsCarouselItem = MadeForYouItem | SetsMixCardItem;

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
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const seedFromHomeData = useLikesStore((s) => s.seedFromHomeData);

  const filterOptions = ["All", "Created", "Liked"];

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [home, created, liked] = await Promise.all([
        getHome(),
        getMyPlaylists({ limit: 50 }),
        getLikedPlaylists({ limit: 50 }),
      ]);
      setHomeData(home);
      seedFromHomeData(home);
      setCreatedPlaylists(created.data.items.filter((p) => !p.is_album_view));
      setLikedPlaylists(liked.data.items.filter((p) => !p.is_album_view));
    } catch (err) {
      setError("Failed to load your library. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [seedFromHomeData]);

  // Fetch data on mount and refresh after playlist edits
  useEffect(() => {
    fetchAll();

    const handlePlaylistUpdated = () => {
      fetchAll();
    };

    window.addEventListener("playlist-updated", handlePlaylistUpdated);
    return () => {
      window.removeEventListener("playlist-updated", handlePlaylistUpdated);
    };
  }, [fetchAll]);

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
    ownerUsername:
      user && p.owner_user_id === user.id ? user.username : undefined,
    coverUrl: p.cover_image || null,
    isPrivate: !p.is_public,
    isLiked: likedPlaylists.some((lp) => lp.playlist_id === p.playlist_id),
  });

  const madeForYouItems: MadeForYouItem[] = useMemo(() => {
    if (!homeData?.made_for_you) return [];

    const items: MadeForYouItem[] = [];

    if (homeData.made_for_you.daily_mix.is_liked_by_me) {
      items.push({
        id: homeData.made_for_you.daily_mix.id,
        title: homeData.made_for_you.daily_mix.label,
        subtitle: homeData.made_for_you.daily_mix.description,
        coverUrl: homeData.made_for_you.daily_mix.cover_url ?? "",
        madeKind: "daily",
        badgeWords: ["DAILY", "DROPS"],
        badgeBg: "#1a237e",
        previewTrack: mapDiscoveryTrack(homeData.made_for_you.daily_mix.preview_track),
      });
    }

    if (homeData.made_for_you.weekly_mix.is_liked_by_me) {
      items.push({
        id: homeData.made_for_you.weekly_mix.id,
        title: homeData.made_for_you.weekly_mix.label,
        subtitle: homeData.made_for_you.weekly_mix.description,
        coverUrl: homeData.made_for_you.weekly_mix.cover_url ?? "",
        madeKind: "weekly",
        badgeWords: ["WEEKLY", "WAVE"],
        badgeBg: "#1b5e20",
        previewTrack: mapDiscoveryTrack(homeData.made_for_you.weekly_mix.preview_track),
      });
    }

    return items;
  }, [homeData]);

  const mixItems: SetsCarouselItem[] = useMemo(() => {
    const mixedForYou: SetsMixCardItem[] =
      homeData?.mixed_for_you
        ?.filter((mix) => mix.is_liked_by_me)
        .map((mix) => ({
          id: mix.mix_id ?? mix.id,
          mix_id: mix.mix_id ?? mix.id,
          title: mix.label ?? "",
          subtitle:
            mix.flavor === "listening_history"
              ? "Based on listening history"
              : "Based on your taste",
          cover_image: mix.cover_image ?? mix.preview_track.cover_image ?? null,
          badgeWords: ["MIX", ""],
          badgeBg: mix.flavor === "listening_history" ? "#1a237e" : "#1b5e20",
          previewTrack: mapDiscoveryTrack(mix.preview_track),
          label: mix.label ?? "",
          flavor: mix.flavor,
          genre_name: mix.genre_name,
          track_count: mix.track_count,
          generated_at: mix.generated_at,
          is_liked_by_me: mix.is_liked_by_me,
        })) ?? [];

    return [...mixedForYou, ...madeForYouItems];
  }, [homeData, madeForYouItems]);

  const visibleMixItems = useMemo(() => {
    if (activeFilter === "Created") return [];
    return mixItems.filter((mix) => mix.title.toLowerCase().includes(filterText.toLowerCase()));
  }, [activeFilter, filterText, mixItems]);

  const isMadeForYouItem = (item: SetsCarouselItem): item is MadeForYouItem =>
    item.madeKind === "daily" || item.madeKind === "weekly";

  const genreItems = useMemo(() => {
    const items =
      homeData?.trending_by_genre.genres
        ?.filter((genre) => genre.is_liked)
        .map((genre) => ({
          id: genre.genre_id,
          genre: genre.genre_name,
          cover_image: genre.preview_track.cover_image,
          track_count: 0,
          previewTrack: mapDiscoveryTrack(genre.preview_track),
        })) ?? [];

    if (activeFilter === "Created") return [];

    return items.filter((genre) =>
      genre.genre.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [activeFilter, filterText, homeData]);

  const skeletons = Array.from({ length: 6 }).map((_, i) => (
    <SkeletonCard key={i} />
  ));

  const hasVisibleContent =
    visiblePlaylists.length > 0 || visibleMixItems.length > 0 || genreItems.length > 0;

  return (
    <div className="container min-h-screen flex flex-col">
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
      <div data-test="sets-page-content" className="px-4 pt-2 pb-10">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {loading ? (
          <HorizontalCarousel title=" ">{skeletons}</HorizontalCarousel>
        ) : hasVisibleContent ? (
          <HorizontalCarousel title=" ">
            <>
              {visiblePlaylists.map((p) => (
                <PlaylistCard
                  key={p.playlist_id}
                  item={mapToCardData(p)}
                  widthClassName={CARD_WIDTH}
                />
              ))}
              {visibleMixItems.map((mix) =>
                isMadeForYouItem(mix) ? (
                  <MadeForYouCard
                    key={mix.id}
                    item={mix}
                    widthClassName={CARD_WIDTH}
                  />
                ) : (
                  <MixCard
                    key={mix.id}
                    mix={{
                      id: mix.id,
                      mix_id: mix.id,
                      label: mix.title,
                      flavor: "listening_history",
                      genre_name: null,
                      cover_image: mix.cover_image,
                      track_count: 0,
                      generated_at: new Date().toISOString(),
                      preview_track: {
                        id: mix.previewTrack?.id ?? mix.id,
                        title: mix.previewTrack?.title ?? mix.title,
                        cover_image: mix.previewTrack?.coverUrl ?? mix.cover_image,
                        duration: null,
                        genre_name: null,
                        play_count: 0,
                        like_count: 0,
                        repost_count: 0,
                        user_id: "",
                        artist_name: mix.previewTrack?.artistName ?? "",
                        stream_url: mix.previewTrack?.audioUrl ?? "",
                        created_at: mix.previewTrack?.postedAt ?? new Date().toISOString(),
                      },
                    } as any}
                    widthClassName={CARD_WIDTH}
                  />
                ),
              )}
              {genreItems.map((genre) => (
                <GenreCard
                  key={genre.id}
                  item={genre as BuzzingPlaylist}
                  widthClassName={CARD_WIDTH}
                />
              ))}
            </>
          </HorizontalCarousel>
        ) : (
          <div data-test="sets-page-empty" className="flex flex-1 justify-center items-center py-20">
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
