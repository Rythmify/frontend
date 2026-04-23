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
  PersonalMix,
} from "@/services/api/discover.service";
import { mockMixes, mockMixTracks } from "@/services/mocks/discover";
import { getUsers } from "../../../services/mocks/User.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { MockUser } from "../../../services/mocks/users";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import { useAuthStore } from "@/stores/auth.store";

// ─── Mapper ──────────────────
function mixToPlaylistDetails(
  mix: PersonalMix,
  tracks: DiscoveryTrack[],
  userId: string,
): PlaylistDetails {
  return {
    playlist_id: mix.id,
    owner_user_id: userId,
    name: mix.label ?? "Mix",
    description: null,
    is_public: true,
    cover_image: mix.cover_image ?? null,
    created_at: mix.generated_at,
    updated_at: null,
    track_count: mix.track_count,
    like_count: 0,
    repost_count: 0,
    // We map discovery fields to playlist fields
    tracks: tracks.map(
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

function buildFeaturedArtists(
  tracks: DiscoveryTrack[],
  users: MockUser[],
): MockUser[] {
  const userById = new Map(users.map((user) => [String(user.id), user]));
  const seen = new Set<string>();
  const result: MockUser[] = [];

  for (const track of tracks) {
    const ownerId = track.user_id;
    if (!ownerId || seen.has(ownerId)) continue;

    const user = userById.get(ownerId);
    if (!user) continue;

    seen.add(ownerId);
    result.push(user);
  }

  return result;
}

// ─── Page ─────────────────────────────────────────────────

function MixForYouSlugPage() {
  const { mixSlug } = useParams<{ mixSlug: string }>();
  const user = useAuthStore((state) => state.user);
  const mixId = mixSlug?.includes(":") ? mixSlug.split(":").pop() : mixSlug;

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
        const [{ mix, tracks }, fetchedUsers] = await Promise.all([
          getMixTracks(mixId),
          getUsers(),
        ]);

        if (cancelled) return;

        setPlaylist(mixToPlaylistDetails(mix, tracks, currentUserId));
        setFeaturedArtists(
          Array.isArray(fetchedUsers)
            ? buildFeaturedArtists(tracks, fetchedUsers as MockUser[])
            : [],
        );
      } catch (err) {
        if (cancelled) return;

        const mockMix = mockMixes.find((m) => m.id === mixId) ?? mockMixes[0];
        setPlaylist(
          mixToPlaylistDetails(mockMix, mockMixTracks, currentUserId),
        );
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
        isPlaying={isMixActive}
        activeTrackId={currentTrack?.id}
        onPlayPause={handleHeroPlayPause}
        showUploadButton={false}
        isMix={true}
      />

      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          <div className="flex-1 min-w-0">
            <PlaylistActions playlist={playlist} />
            <div className="mt-8">
              <TrackList
                tracks={playlist.tracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onTrackPlay={handleTrackPlay}
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
