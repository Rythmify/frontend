import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "../../../components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActions from "../../../components/playlist/Made for you/PlaylistActionsForYou";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import { usePlayerStore } from "../../../stores/player.store";
import { useAuthStore } from "@/stores/auth.store";
import {
  getMadeForYouDaily,
  getMadeForYouWeekly,
  type PlaylistDetails,
  type PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";

type MadeForYouKind = "daily" | "weekly";

function normalizeMadeSlug(rawSlug?: string) {
  return rawSlug?.replace(/^:/, "").toLowerCase();
}

function getMadeForYouKind(value: string | undefined): MadeForYouKind | null {
  if (!value) return null;
  if (value.startsWith("daily")) return "daily";
  if (value.startsWith("weekly")) return "weekly";
  return null;
}

function madeForYouToPlaylistDetails(
  payload: Awaited<ReturnType<typeof getMadeForYouDaily>>,
  ownerUserId: string,
): PlaylistDetails {
  return {
    playlist_id: payload.mix_id,
    owner_user_id: ownerUserId,
    name: payload.title,
    description: null,
    is_public: true,
    cover_image: payload.cover_url,
    created_at: payload.tracks[0]?.created_at ?? new Date().toISOString(),
    updated_at: null,
    track_count: payload.tracks.length,
    like_count: 0,
    repost_count: 0,
    tracks: payload.tracks.map(
      (track, index) =>
        ({
          track_id: track.id,
          position: index + 1,
          added_at: track.created_at,
          title: track.title,
          duration: track.duration,
          cover_image: track.cover_image,
          artist_name: track.artist_name,
          artist_id: track.user_id,
          is_public: true,
          deleted_at: null,
          audio_url: track.stream_url,
          play_count: track.play_count,
        }) as PlaylistTrackItem & { audio_url?: string; play_count?: number },
    ),
  };
}

function MadeForYouSlugPage() {
  const { kind, madeSlug, playlistSlug } = useParams<{
    kind?: string;
    madeSlug?: string;
    playlistSlug?: string;
  }>();
  const user = useAuthStore((state) => state.user);
  const currentUserId =
    user?.id ?? "a1b2c3d4-e5f6-4790-8bcd-ef1234567890";
  const normalizedSlug = normalizeMadeSlug(kind ?? madeSlug ?? playlistSlug);
  const madeForYouKind = getMadeForYouKind(normalizedSlug);
  const madeForYouBadgeWords: [string, string] =
    madeForYouKind === "weekly" ? ["WEEKLY", "WAVE"] : ["DAILY", "DROPS"];

  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
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
      if (!madeForYouKind) {
        setError("Made for you mix not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const payload =
          madeForYouKind === "weekly"
            ? await getMadeForYouWeekly()
            : await getMadeForYouDaily();

        if (cancelled) return;

        setPlaylist(madeForYouToPlaylistDetails(payload, currentUserId));
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load made for you tracks.");
          setPlaylist(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [currentUserId, madeForYouKind]);

  const toPlayerTrack = (
    track: PlaylistTrackItem & { audio_url?: string; play_count?: number },
  ) => ({
    id: track.track_id,
    title: track.title ?? "Untitled track",
    artistName: track.artist_name ?? "Unknown Artist",
    artistUsername: track.artist_id ?? "",
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

  const isPlaylistActive =
    isPlaying &&
    !!playlist &&
    playlist.tracks.some((track) => track.track_id === currentTrack?.id);

  const coverImages = useMemo(
    () => playlist?.tracks.slice(0, 3).map((track) => track.cover_image ?? null),
    [playlist],
  );

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
            queue: tracks.map((track) => track.track_id),
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
          queue: tracks.map((item) => item.track_id),
        },
      } as any,
      tracks.map(toPlayerTrack),
    );
  };

  if (loading)
    return (
      <div data-test="made-for-you-slug-loading" className="animate-pulse p-20 text-center text-white">
        Loading made for you...
      </div>
    );

  if (error || !playlist)
    return (
      <div data-test="made-for-you-slug-error" className="p-20 text-center text-red-500">
        {error || "Made for you mix not found."}
      </div>
    );

  return (
    <div
      data-test="made-for-you-slug-page"
      className="container px-4 md:px-8 lg:px-12 xl:px-20 flex-1 w-full bg-bg min-h-screen"
    >
      <PlaylistHero
        playlist={playlist}
        isPlaying={isPlaylistActive}
        activeTrackId={currentTrack?.id}
        onPlayPause={handleHeroPlayPause}
        showUploadButton={false}
        isMix={false}
        isForYou={true}
        forYouBadgeWords={madeForYouBadgeWords}
        coverImages={coverImages}
      />

      <div className="mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          <div className="flex-1 min-w-0" data-test="made-for-you-slug-main">
            <div data-test="made-for-you-slug-actions">
              <PlaylistActions
                playlist={playlist}
                initialTracks={playlist.tracks}
                isGeneratedPlaylist
                generatedPlaylistTitle={playlist.name}
              />
            </div>

            <div className="mt-8" data-test="made-for-you-slug-tracklist">
              <TrackList
                tracks={playlist.tracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onTrackPlay={handleTrackPlay}
              />
            </div>
          </div>

          <div className="w-full lg:w-[280px] shrink-0" data-test="made-for-you-slug-sidebar">
            <PlaylistSidebar playlist={playlist} />
            <GuestPageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MadeForYouSlugPage;
