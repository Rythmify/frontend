import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "../../../components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActions from "../../../components/playlist/Made for you/PlaylistActionsForYou";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import type { PlaylistDetails } from "@/services/api/playlist/playlist.service";
import { getMixTracks } from "@/services/api/discover.service";
import type { DiscoveryTrack, PersonalMix } from "@/services/api/discover.service";
import { mockMixes, mockMixTracks } from "@/services/mocks/discover";
import { getUsers } from "../../../services/mocks/User.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { MockUser } from "../../../services/mocks/users";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";

// ─── Mapper ───────────────────────────────────────────────

function mixToPlaylistDetails(
  mix: PersonalMix,
  tracks: DiscoveryTrack[],
): PlaylistDetails {
  return {
    playlist_id: mix.id,
    owner_user_id: "",
    name: mix.label ?? "Mix",
    description: null,
    is_public: false,
    cover_image: mix.cover_image ?? null,
    created_at: mix.generated_at,
    updated_at: null,
    track_count: mix.track_count,
    like_count: 0,
    repost_count: 0,
    tracks: tracks.map((t, i) => ({
      track_id: t.id,
      position: i,
      added_at: t.created_at,
      title: t.title,
      duration: t.duration ?? null,
      cover_image: t.cover_image ?? null,
      artist_name: t.artist_name ?? null,
      artist_id: t.user_id,
      is_public: true,
      deleted_at: null,
    })),
  };
}

// ─── Page ─────────────────────────────────────────────────

function MixForYouSlugPage() {
  const { mixSlug } = useParams<{ mixSlug: string }>();
  const mixId = mixSlug?.split(":").slice(1).join(":") ?? "";

  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [featuredArtists, setFeaturedArtists] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setTrack: setPlayerTrack, togglePlay, isPlaying, currentTrack } =
    usePlayerStore();

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!mixId) return;

      setLoading(true);
      setError(null);

      try {
        const [{ mix, tracks }, fetchedUsers] = await Promise.all([
          getMixTracks(mixId),
          getUsers(),
        ]);

        if (cancelled) return;

        setPlaylist(mixToPlaylistDetails(mix, tracks));
        setFeaturedArtists(
          Array.isArray(fetchedUsers) ? fetchedUsers.slice(0, 3) : [],
        );
      } catch {
        if (cancelled) return;

        // Fallback to mock data so clicking mock mix cards always works
        const mockMix =
          mockMixes.find((m) => m.id === mixId) ?? mockMixes[0];
        setPlaylist(mixToPlaylistDetails(mockMix, mockMixTracks));

        try {
          const fetchedUsers = await getUsers();
          if (!cancelled) {
            setFeaturedArtists(
              Array.isArray(fetchedUsers) ? fetchedUsers.slice(0, 3) : [],
            );
          }
        } catch {
          // leave featuredArtists empty
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [mixId]);

  const handleHeroPlayPause = () => {
    if (!playlist || !playlist.tracks.length) return;

    const firstTrack = playlist.tracks[0];
    const isThisPlaying =
      (currentTrack as any)?.context?.playlist_id === playlist.playlist_id;

    if (isThisPlaying) {
      togglePlay();
    } else {
      setPlayerTrack({
        id: firstTrack.track_id,
        context: {
          type: "playlist",
          playlist_id: playlist.playlist_id,
          queue: playlist.tracks.map((t) => t.track_id),
        },
      } as any);
    }
  };

  if (loading)
    return (
      <div className="animate-pulse p-20 text-center text-white">
        Loading mix...
      </div>
    );

  if (error || !playlist)
    return (
      <div className="p-20 text-center text-red-500">
        {error || "Mix not found."}
      </div>
    );

  return (
    <div
      data-test="playlist-slug-page"
      className="flex-1 w-full bg-bg min-h-screen"
    >
      <PlaylistHero
        playlist={playlist}
        isPlaying={
          isPlaying &&
          (currentTrack as any)?.context?.playlist_id === playlist.playlist_id
        }
        onPlayPause={handleHeroPlayPause}
      />

      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          <div className="flex-1 min-w-0">
            <PlaylistActions playlist={playlist} />

            <div className="mt-8">
              <h2 className="text-text-muted text-xs uppercase tracking-widest font-semibold mb-4 border-b border-[#333] pb-2">
                Tracks
              </h2>
              <TrackList
                tracks={playlist.tracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
              />
            </div>
          </div>

          <div className="w-full lg:w-70 shrink-0">
            <PlaylistSidebar
              playlist={playlist}
              featuredArtists={featuredArtists}
            />
            <GuestPageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MixForYouSlugPage;
