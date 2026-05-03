import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "../../../components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActionsGuest from "@/components/playlist/PlaylistActionsGuest";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import {
  type PlaylistDetails,
  type PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";
import {
  getCuratedMixByIdFromHome,
  type CuratedHomeMixPreview,
} from "@/services/api/discover.service";
import { getFeaturedArtists } from "@/services/featuredArtists.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { MockUser } from "../../../services/mocks/users";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import { useAuthStore } from "@/stores/auth.store";
import { getRelatedTracks } from "@/services/track.service";
import type { Track } from "@/types/track";


// ─── Mapper ──────────────────
function mixToPlaylistDetails(
  mix: CuratedHomeMixPreview,
  seedTrack: Track,
  tracks: Track[],
  userId: string,
): PlaylistDetails {
  return {
    playlist_id: mix.mix_id,
    owner_user_id: userId,
    name: mix.title ?? seedTrack.title ?? "Mix",
    description: seedTrack.title
      ? `Related tracks : ${seedTrack.title}`
      : "Related tracks picked for you",
    is_public: true,
    cover_image: mix.cover_url ?? seedTrack.coverUrl ?? null,
    created_at: mix.preview_track.created_at,
    updated_at: null,
    track_count: tracks.length,
    like_count: 0,
    repost_count: 0,
    tracks: tracks.map(
      (track, index) =>
        ({
          track_id: track.id,
          position: index + 1,
          added_at: track.postedAt,
          title: track.title,
          duration: null,
          cover_image: track.coverUrl || null,
          artist_name: track.artistName,
          artist_id: track.artistId || track.artistUsername,
          is_public: !track.isPrivate,
          deleted_at: null,
          audio_url: track.audioUrl,
          play_count: track.playCount,
        }) as PlaylistTrackItem & { audio_url?: string; play_count?: number },
    ),
  };
}

// ─── Page ─────────────────────────────────────────────────

function CuratedForYouSlugPage() {
  const { mixSlug } = useParams<{ mixSlug: string }>();
  const user = useAuthStore((state) => state.user);
  const mixId = mixSlug;

  const currentUserId = user?.id ?? "a1b2c3d4-e5f6-4790-8bcd-ef1234567890";

  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [featuredArtists, setFeaturedArtists] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    setTrack: setPlayerTrack,
    togglePlay,
    isPlaying,
    currentTrack,
  } = usePlayerStore();

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!mixId) return;

      setLoading(true);
      setError(null);

      try {
        const mix = await getCuratedMixByIdFromHome(mixId);

        if (!mix) {
          throw new Error("Mix not found.");
        }

        const { referenceTrack, tracks } = await getRelatedTracks(
          mix.preview_track.id,
        );

        if (!tracks.length) {
          throw new Error("Mix not found.");
        }

        if (cancelled) return;

        setPlaylist(mixToPlaylistDetails(mix, referenceTrack, tracks, currentUserId));

        const artists = await getFeaturedArtists([referenceTrack], user);

        if (cancelled) return;

        setFeaturedArtists(artists);
      } catch (err) {
        if (cancelled) return;
        setError("Mix not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [mixId, currentUserId]);

  // Convert playlist tracks to Player format
  const toPlayerTrack = (
    track: PlaylistTrackItem & { audio_url?: string; play_count?: number },
  ) => ({
    id: track.track_id,
    title: track.title ?? "Untitled track",
    artistName: track.artist_name ?? "Unknown Artist",
    artistUsername: "",
    coverUrl: track.cover_image ?? "",
    genre: "",
    likeCount: 0,
    repostCount: 0,
    playCount: track.play_count ?? 0,
    commentCount: 0,
    duration:
      typeof track.duration === "number"
        ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, "0")}`
        : "0:00",
    postedAt: track.added_at ?? "",
    waveformData: [],
    audioUrl: track.audio_url ?? "",
    isPrivate: !track.is_public,
  });

  const handleHeroPlayPause = () => {
    if (!playlist || !playlist.tracks.length) return;

    const tracks = playlist.tracks as any[];
    const firstTrack = tracks[0];
    const playerTrack = toPlayerTrack(firstTrack);
    const queue = tracks.map(toPlayerTrack);

    const isThisPlaying =
      (currentTrack as any)?.context?.playlist_id === playlist.playlist_id;

    if (isThisPlaying) {
      togglePlay();
    } else {
      setPlayerTrack(
        {
          ...playerTrack,
          context: {
            type: "playlist",
            playlist_id: playlist.playlist_id,
            queue: tracks.map((t) => t.track_id),
          },
        } as any,
        queue,
      );
    }
  };

  const handleTrackPlay = (track: any) => {
    if (!playlist) return;

    const playerTrack = toPlayerTrack(track);
    const tracks = playlist.tracks as any[];

    if (currentTrack?.id === playerTrack.id) {
      togglePlay();
      return;
    }

    setPlayerTrack(
      {
        ...playerTrack,
        context: {
          type: "playlist",
          playlist_id: playlist.playlist_id,
          queue: tracks.map((t) => t.track_id),
        },
      } as any,
      tracks.map(toPlayerTrack),
    );
  };

  const isMixActive =
    isPlaying &&
    !!playlist &&
    playlist.tracks.some((track) => track.track_id === currentTrack?.id);

  if (loading)
    return (
      <div data-test="curated-for-you-slug-loading" className="animate-pulse p-20 text-center text-white">
        Loading mix...
      </div>
    );

  if (error || !playlist)
    return (
      <div data-test="curated-for-you-slug-error" className="p-20 text-center text-red-500">
        {error || "Mix not found."}
      </div>
    );

  return (
    <div
      data-test="playlist-slug-page"
      className="container px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 flex-1 w-full bg-bg min-h-screen overflow-x-hidden"
    >
      <PlaylistHero
        playlist={playlist}
        isPlaying={isMixActive}
        activeTrackId={currentTrack?.id}
        onPlayPause={handleHeroPlayPause}
        showUploadButton={false}
        isMix={true}
      />

      <div className="mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 py-6 w-full">
          <div data-test="curated-for-you-slug-main" className="flex-1 min-w-0 w-full">
            <PlaylistActionsGuest playlist={playlist} />
            <div data-test="curated-for-you-slug-tracklist" className="mt-8">
              <TrackList
                tracks={playlist.tracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onTrackPlay={handleTrackPlay}
              />
            </div>
          </div>

          <div data-test="curated-for-you-slug-sidebar" className="w-full lg:w-[280px] shrink-0">
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

export default CuratedForYouSlugPage;
