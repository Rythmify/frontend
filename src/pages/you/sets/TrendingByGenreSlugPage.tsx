import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import PlaylistSidebar from "../../../components/playlist/Made for you/PlaylistSidebarForYou";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import { getFeaturedArtists } from "@/services/featuredArtists.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { MockUser } from "../../../services/mocks/users";
import type { Track } from "@/types/track";
import {
  getTrendingByGenre,
  type PlaylistDetails,
  type PlaylistTrackItem,
  type TrendingByGenreTrack,
} from "@/services/api/playlist/playlist.service";
import PlaylistActionsAlbum from "@/components/playlist/Album/PlaylistActionsAlbum";
import PlaylistActionsGuest from "@/components/playlist/PlaylistActionsGuest";
import { useAuthStore } from "@/stores/auth.store";

function formatDuration(seconds: number | null | undefined) {
  if (typeof seconds !== "number" || Number.isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.max(0, Math.floor(seconds % 60));
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function toPlaylistTrackItem(
  track: TrendingByGenreTrack,
  index: number,
): PlaylistTrackItem {
  return {
    track_id: track.id,
    position: index + 1,
    added_at: track.created_at,
    title: track.title,
    duration: track.duration,
    cover_image: track.cover_image,
    is_public: true,
    deleted_at: null,
    artist_name: track.artist_name ?? "Unknown Artist",
    artist_id: track.user_id,
    artist_username:
      track.artist_name?.trim().toLowerCase().replace(/\s+/g, "-") ??
      track.user_id,
    play_count: track.play_count,
    audio_url: track.stream_url,
  };
}

function toPlayerTrack(track: PlaylistTrackItem, genreName: string): Track {
  return {
    id: track.track_id,
    title: track.title ?? "Untitled track",
    artistName: track.artist_name ?? "Unknown Artist",
    artistUsername: track.artist_username ?? "",
    artistId: track.artist_id,
    coverUrl: track.cover_image ?? "",
    genre: genreName,
    likeCount: 0,
    repostCount: 0,
    playCount: track.play_count ?? 0,
    commentCount: 0,
    duration: formatDuration(track.duration),
    postedAt: track.added_at ?? "",
    waveformData: [],
    audioUrl: track.audio_url ?? "",
    isPrivate: !track.is_public,
  };
}

function getGenreLikeCount(tracks: TrendingByGenreTrack[]) {
  return tracks.reduce((sum, track) => sum + (track.like_count ?? 0), 0);
}

function getGenreRepostCount(tracks: TrendingByGenreTrack[]) {
  return tracks.reduce((sum, track) => sum + (track.repost_count ?? 0), 0);
}

function getGenreCover(tracks: TrendingByGenreTrack[]) {
  return tracks.find((track) => track.cover_image)?.cover_image ?? null;
}

function getGenreCreatedAt(tracks: TrendingByGenreTrack[]) {
  const dates = tracks
    .map((track) => new Date(track.created_at))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (!dates.length) return new Date().toISOString();

  const latest = dates.reduce(
    (max, date) => (date.getTime() > max.getTime() ? date : max),
    dates[0],
  );

  return latest.toISOString();
}

function TrendingByGenreSlugPage() {
  const { playlistSlug } = useParams<{ playlistSlug: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [genreName, setGenreName] = useState<string>("");
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
      if (!playlistSlug) return;

      setLoading(true);
      setError(null);

      try {
        const resolvedGenreId = playlistSlug.includes(":")
          ? (playlistSlug.split(":").pop() ?? playlistSlug)
          : playlistSlug;

        const genreData = await getTrendingByGenre(resolvedGenreId, {
          limit: 100,
          offset: 0,
        });

        const trackItems = genreData.tracks.map((track, index) =>
          toPlaylistTrackItem(track, index),
        );

        const playlistDetails: PlaylistDetails = {
          playlist_id: genreData.genre_id,
          owner_user_id: genreData.genre_id,
          name: genreData.genre_name,
          description: `Trending tracks in ${genreData.genre_name}`,
          is_public: true,
          cover_image: getGenreCover(genreData.tracks),
          subtype: "compilation",
          release_date: getGenreCreatedAt(genreData.tracks),
          genre_id: genreData.genre_id,
          tags: [],
          secret_token: null,
          created_at: getGenreCreatedAt(genreData.tracks),
          updated_at: null,
          track_count: trackItems.length,
          like_count: getGenreLikeCount(genreData.tracks),
          repost_count: getGenreRepostCount(genreData.tracks),
          is_album_view: false,
          tracks: trackItems,
        };

        if (cancelled) return;

        setPlaylist(playlistDetails);
        setGenreName(genreData.genre_name);

        const artists = await getFeaturedArtists(genreData.tracks, null);

        if (cancelled) return;

        setFeaturedArtists(artists);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Genre not found.");
          setPlaylist(null);
          setGenreName("");
          setFeaturedArtists([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [playlistSlug]);

  const handleHeroPlayPause = () => {
    if (!playlist || !playlist.tracks.length) return;

    const tracks = playlist.tracks;
    const firstTrack = tracks[0];
    const playerTrack = toPlayerTrack(firstTrack, genreName);
    const queue = tracks.map((track) => toPlayerTrack(track, genreName));
    const isThisGenrePlaying =
      (currentTrack as any)?.context?.playlist_id === playlist.playlist_id;

    if (isThisGenrePlaying) {
      togglePlay();
      return;
    }

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
  };

  const handleTrackPlay = (track: PlaylistTrackItem) => {
    if (!playlist) return;

    const playerTrack = toPlayerTrack(track, genreName);

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
          queue: playlist.tracks.map((item) => item.track_id),
        },
      } as any,
      playlist.tracks.map((item) => toPlayerTrack(item, genreName)),
    );
  };

  const isGenreActive =
    isPlaying &&
    !!playlist &&
    playlist.tracks.some((track) => track.track_id === currentTrack?.id);

  if (loading) {
    return (
      <div data-test="trending-by-genre-slug-loading" className="animate-pulse p-20 text-center text-white">
        Loading genre...
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div data-test="trending-by-genre-slug-error" className="p-20 text-center text-red-500">
        {error || "Genre not found."}
      </div>
    );
  }

  return (
    <div
      data-test="trending-by-genre-slug-page"
      className="flex-1 bg-bg min-h-screen container px-4  md:px-8 lg:px-12 xl:px-20 mx-auto w-full overflow-x-hidden"
    >
      <PlaylistHero
        key={playlist.playlist_id}
        playlist={playlist}
        isPlaying={isGenreActive}
        activeTrackId={currentTrack?.id}
        onPlayPause={handleHeroPlayPause}
        showUploadButton={false}
        ownerUsername={genreName}
        genreLabel={genreName}
      />

      <div className="container mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 py-6 w-full">
          <div data-test="trending-by-genre-slug-main" className="flex-1 min-w-0 w-full">
            {isAuthenticated ? (
              <PlaylistActionsAlbum
                playlist={playlist}
                engagementKind="genre"
                onPlaylistUpdated={(updated: Partial<PlaylistDetails>) =>
                  setPlaylist((prev) => (prev ? { ...prev, ...updated } : prev))
                }
              />
            ) : (
              <PlaylistActionsGuest playlist={playlist} />
            )}

            <div className="flex flex-col gap-6 mt-6 lg:mt-8">
              <TrackList
                tracks={playlist.tracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onTrackPlay={handleTrackPlay}
              />
            </div>
          </div>

          <div data-test="trending-by-genre-slug-sidebar" className="w-full lg:w-[280px] shrink-0">
            <PlaylistSidebar
              featuredArtists={featuredArtists}
              playlist={playlist}
              showLikes={true}
              showReposts={true}
            />
            <GuestPageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendingByGenreSlugPage;
