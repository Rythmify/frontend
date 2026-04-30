import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "../../../components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActions from "../../../components/playlist/Made for you/PlaylistActionsForYou";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import {
  type PlaylistDetails,
  type PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";
import { getMixTracks } from "@/services/api/discover.service";
import type {
  DiscoveryTrack,
  MixDetailsData,
} from "@/services/api/discover.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { MockUser } from "../../../services/mocks/users";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import { useAuthStore } from "@/stores/auth.store";
import { getUserById, type PublicUser } from "@/services/user.service";

// ─── Mapper ──────────────────
function mixToPlaylistDetails(
  mix: MixDetailsData,
  userId: string,
): PlaylistDetails {
  return {
    playlist_id: mix.mix_id,
    owner_user_id: userId,
    name: mix.title ?? "Mix",
    description: null,
    is_public: true,
    cover_image: mix.cover_url ?? null,
    created_at: mix.tracks[0]?.created_at ?? new Date().toISOString(),
    updated_at: null,
    track_count: mix.tracks.length,
    like_count: 0,
    repost_count: 0,
    // We map discovery fields to playlist fields
    tracks: mix.tracks.map(
      (t, i) =>
        ({
          track_id: t.id,
          position: i + 1,
          added_at: t.created_at,
          title: t.title,
          duration: t.duration ?? null,
          cover_image: t.cover_image ?? null,
          artist_name: t.artist_name ?? null,
          artist_id: t.user_id,
          is_public: true,
          deleted_at: null,
          audio_url: t.stream_url,
          play_count: t.play_count,
        }) as PlaylistTrackItem & { audio_url?: string; play_count?: number },
    ),
  };
}

function toFeaturedArtist(user: PublicUser, trackCount: number): MockUser {
  return {
    id: user.id as unknown as number,
    username: user.username ?? user.display_name,
    displayName: user.display_name,
    avatarUrl:
      user.profile_picture ?? "https://picsum.photos/seed/default/100/100",
    followerCount: user.followers_count ?? 0,
    trackCount,
    isFollowing: false,
  };
}

// ─── Page ─────────────────────────────────────────────────

function MixForYouSlugPage() {
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
        const mix = await getMixTracks(mixId);

        if (cancelled) return;

        setPlaylist(mixToPlaylistDetails(mix, currentUserId));

        const uniqueArtistIds = Array.from(
          new Set(mix.tracks.map((track) => track.user_id).filter(Boolean)),
        );

        const fetchedUsers = await Promise.all(
          uniqueArtistIds.map((id) => getUserById(id).catch(() => null)),
        );

        if (cancelled) return;

        const artists = fetchedUsers
          .filter((user): user is PublicUser => Boolean(user))
          .map((user) => {
            const trackCount = mix.tracks.filter(
              (track) => track.user_id === user.id,
            ).length;
            return toFeaturedArtist(user, trackCount);
          });

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
      <div
        data-test="mix-for-you-slug-loading"
        className="animate-pulse p-20 text-center text-white"
      >
        Loading mix...
      </div>
    );

  if (error || !playlist)
    return (
      <div
        data-test="mix-for-you-slug-error"
        className="p-20 text-center text-red-500"
      >
        {error || "Mix not found."}
      </div>
    );

  return (
    <div
      data-test="playlist-slug-page"
      className="container px-4 md:px-8 lg:px-12 xl:px-20 flex-1 w-full bg-bg min-h-screen"
    >
      <PlaylistHero
        playlist={playlist}
        isPlaying={isMixActive}
        activeTrackId={currentTrack?.id}
        onPlayPause={handleHeroPlayPause}
        showUploadButton={false}
        isMix={true}
      />

      <div className="mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          <div data-test="mix-for-you-slug-main" className="flex-1 min-w-0">
            <PlaylistActions playlist={playlist} engagementKind="mix" />
            <div data-test="mix-for-you-slug-tracklist" className="mt-8">
              <TrackList
                tracks={playlist.tracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onTrackPlay={handleTrackPlay}
              />
            </div>
          </div>

          <div
            data-test="mix-for-you-slug-sidebar"
            className="w-full lg:w-[280px] shrink-0"
          >
            <PlaylistSidebar
              showLikes={false}
              showReposts={false}
              showSocialProof={false}
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
