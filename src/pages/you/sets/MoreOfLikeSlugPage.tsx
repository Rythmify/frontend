import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebar from "@/components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActions from "@/components/playlist/Made for you/PlaylistActionsForYou";
import PlaylistHero from "../../../components/playlist/PlaylistHero";
import {
  type PlaylistDetails,
  type PlaylistTrackItem,
  getRadioTracks,
} from "@/services/api/playlist/playlist.service";
import { getRelatedTracks, getTrackById } from "@/services/track.service";
import { getFeaturedArtists } from "@/services/featuredArtists.service";
import { getUserById, type PublicUser } from "@/services/user.service";
import { usePlayerStore } from "../../../stores/player.store";
import type { Track } from "../../../types/track";
import type { MockUser } from "../../../services/mocks/users";
import TrackList from "../../../components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";
import {
  UUID_RE,
  buildFeaturedArtistSources,
  buildPlaylist,
  mapRadioTrackToPlayerTrack,
  radioTracksToPlaylistDetails,
  toPlaylistTrackItem,
  toPlayerTrack,
  trackDurationSeconds,
  withSeedTrack,
} from "./moreOfLike.helpers";

function MoreOfLikeSlugPage() {
  const { username, playlistSlug } = useParams<{
    username: string;
    playlistSlug: string;
  }>();
  const { user: currentUser } = useAuthStore();
  const isRadioPlaylistRoute =
    !!playlistSlug && !playlistSlug.includes(":") && UUID_RE.test(playlistSlug);

  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredArtists, setFeaturedArtists] = useState<MockUser[]>([]);
  const [albumOwner, setAlbumOwner] = useState<PublicUser | null>(null);
  const [seedTrack, setSeedTrack] = useState<Track | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [relatedPlaylistTracks, setRelatedPlaylistTracks] = useState<
    PlaylistTrackItem[]
  >([]);

  const {
    setTrack: setPlayerTrack,
    togglePlay,
    isPlaying,
    currentTrack,
  } = usePlayerStore();

  const tracksForDisplay = useMemo(() => {
    return withSeedTrack(seedTrack, relatedPlaylistTracks);
  }, [seedTrack, relatedPlaylistTracks]);

  const tracksForAddToPlaylist = tracksForDisplay;

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!playlistSlug) {
        setError("Related tracks not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const trackId = playlistSlug.includes(":")
          ? (playlistSlug.split(":").pop() ?? playlistSlug)
          : playlistSlug;
        if (isRadioPlaylistRoute) {
          const payload = await getRadioTracks(trackId);
          if (cancelled) return;

          const playlistData = radioTracksToPlaylistDetails(payload);
          const seedTrackForFeatures = mapRadioTrackToPlayerTrack(
            payload.reference_track,
          );
          setPlaylist(playlistData);
          setSeedTrack(seedTrackForFeatures);
          const radioTracks = payload.tracks.map(mapRadioTrackToPlayerTrack);
          setRelatedTracks(radioTracks);
          setRelatedPlaylistTracks(playlistData.tracks);
          const artists = await getFeaturedArtists(
            buildFeaturedArtistSources(seedTrackForFeatures, radioTracks),
            currentUser,
          );

          if (!cancelled) {
            setFeaturedArtists(artists);
          }
          setAlbumOwner(null);
        } else {
          const { referenceTrack, tracks } = await getRelatedTracks(trackId);
          const fullReferenceTrack = await getTrackById(trackId).catch(() => null);
          const hydratedReferenceTrack = fullReferenceTrack ?? referenceTrack;

          if (cancelled) return;

          setSeedTrack(hydratedReferenceTrack);
          setRelatedTracks(tracks);
          setRelatedPlaylistTracks(
            tracks.map((track: Track, index: number) =>
              toPlaylistTrackItem(track, index + 1),
            ),
          );
          setPlaylist(buildPlaylist(hydratedReferenceTrack, tracks));

          const artists = await getFeaturedArtists(
            buildFeaturedArtistSources(hydratedReferenceTrack, tracks),
            currentUser,
          );

          if (!cancelled) {
            setFeaturedArtists(artists);
          }

          try {
            if (UUID_RE.test(hydratedReferenceTrack.artistUsername)) {
              const owner = await getUserById(hydratedReferenceTrack.artistUsername);
              if (!cancelled) setAlbumOwner(owner);
            } else {
              if (!cancelled) setAlbumOwner(null);
            }
          } catch {
            if (!cancelled) setAlbumOwner(null);
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load related tracks.");
          setFeaturedArtists([]);
          setSeedTrack(null);
          setRelatedTracks([]);
          setRelatedPlaylistTracks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [playlistSlug, isRadioPlaylistRoute, currentUser?.id, currentUser?.following_ids?.join("|") ?? ""]);

  const handleHeroPlayPause = () => {
    if (!playlist || !tracksForDisplay.length) return;

    const playerTrack = toPlayerTrack(tracksForDisplay[0], username ?? "");
    const queue = tracksForDisplay.map((track) =>
      toPlayerTrack(track, username ?? ""),
    );
    const isThisPlaylistPlaying =
      (currentTrack as any)?.context?.playlist_id === playlist.playlist_id;

    if (isThisPlaylistPlaying) {
      togglePlay();
    } else {
      setPlayerTrack(
          {
            ...playerTrack,
            context: {
              type: "playlist",
              playlist_id: playlist.playlist_id,
              queue: tracksForDisplay.map((t) => t.track_id),
            },
          } as any,
          queue,
      );
    }
  };

  const handleTrackPlay = (track: PlaylistTrackItem) => {
    const playerTrack = toPlayerTrack(track, username ?? "");
    const queue = tracksForDisplay.map((t) => toPlayerTrack(t, username ?? ""));
    const playlistContext = {
      type: "playlist",
      playlist_id: playlist?.playlist_id,
      queue: tracksForDisplay.map((t) => t.track_id),
    };

    if (currentTrack?.id === playerTrack.id) {
      togglePlay();
      return;
    }

    setPlayerTrack(
      {
        ...playerTrack,
        context: playlistContext,
      } as any,
      queue,
    );
  };

  const isAlbumActive =
    isPlaying &&
    !!playlist &&
    tracksForDisplay.some((track) => track.track_id === currentTrack?.id);

  if (loading)
    return (
      <div
        data-test="more-of-like-slug-loading"
        className="animate-pulse p-20 text-center text-white"
      >
        Loading playlist...
      </div>
    );
  if (error || !playlist)
    return (
      <div
        data-test="more-of-like-slug-error"
        className="p-20 text-center text-red-500"
      >
        {error || "Related tracks not found."}
      </div>
    );

  return (
    <div
      data-test="more-of-like-slug-page"
      className="container px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 flex-1 bg-bg min-h-screen overflow-x-hidden"
    >
      <PlaylistHero
        key={playlist.playlist_id}
        playlist={playlist}
        isPlaying={isAlbumActive}
        activeTrackId={currentTrack?.id}
        onPlayPause={handleHeroPlayPause}
        showUploadButton={false}
        ownerUsername={
          albumOwner?.username ??
          seedTrack?.artistName ??
          seedTrack?.artistUsername ??
          undefined
        }
        moreOfLike={true}
        moreOfLikeTitle={seedTrack?.title}
        extraDurationSeconds={trackDurationSeconds(seedTrack)}
      />

      <div className="container mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 py-6 w-full">
          <div data-test="more-of-like-slug-main" className="flex-1 min-w-0 w-full">
            <PlaylistActions
              playlist={playlist}
              initialTracks={tracksForAddToPlaylist}
              isGeneratedPlaylist
              engagementKind={"radioTracks" }
              radioSeedTrack={seedTrack ?? undefined}
              onPlaylistUpdated={(updated: Partial<PlaylistDetails>) =>
                setPlaylist((prev) => (prev ? { ...prev, ...updated } : prev))
              }
            />

            <div
              data-test="more-of-like-slug-tracklist"
              className="flex flex-col gap-6 mt-6 lg:mt-8"
            >
              <TrackList
                tracks={tracksForDisplay}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onTrackPlay={handleTrackPlay}
                moreOfLikeSeedTrack={seedTrack}
              />
            </div>
          </div>

          <div
            data-test="more-of-like-slug-sidebar"
            className="w-full lg:w-[280px] shrink-0"
          >
            <PlaylistSidebar
              featuredArtists={featuredArtists}
              playlist={playlist}
              showSocialProof={false}
              showLikes={false}
              showReposts={false}
            />
            <GuestPageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoreOfLikeSlugPage;
