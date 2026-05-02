import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebarForYou from "@/components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActionsForYou from "@/components/playlist/Made for you/PlaylistActionsForYou";
import PlaylistHero from "@/components/playlist/PlaylistHero";
import TrackList from "@/components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import {
  getStationTracks,
  type PlaylistTrackItem,
  type StationTracksResponse,
} from "@/services/api/playlist/playlist.service";
import { type Playlist, type PlaylistDetails } from "@/services/api/playlist/playlist.service";
import { getUserById, type PublicUser } from "@/services/user.service";
import { getFeaturedArtists } from "@/services/featuredArtists.service";
import { useHistoryStore } from "@/stores/history.store";
import type { MockUser } from "@/services/mocks/users";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type StationView = StationTracksResponse["station"];

function toStationPlaylist(station: StationView): Playlist {
  return {
    playlist_id: station.id,
    owner_user_id: station.artist_id,
    name: station.name,
    description: null,
    is_public: true,
    cover_image: station.images?.center ?? station.images?.left ?? null,
    subtype: "playlist",
    created_at: "",
    updated_at: null,
    track_count: station.track_count,
    like_count: 0,
    repost_count: 0,
  };
}

function toStationPlaylistDetails(
  station: StationView,
  tracks: PlaylistTrackItem[],
): PlaylistDetails {
  return {
    ...toStationPlaylist(station),
    tracks,
  };
}

export default function StationSlugPage() {
  const { stationSlug } = useParams<{ stationSlug: string }>();
  const addStation = useHistoryStore((state) => state.addStation);

  const [station, setStation] = useState<StationView | null>(null);
  const [stationTracks, setStationTracks] = useState<PlaylistTrackItem[]>([]);
  const [seedArtist, setSeedArtist] = useState<PublicUser | null>(null);
  const [featuredArtists, setFeaturedArtists] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!stationSlug) return;

      setLoading(true);
      setError(null);

      try {
        const parts = stationSlug.split(":");
        const primaryId = parts[0] || stationSlug;
        const secondaryId = parts.length > 1 ? parts.at(-1) : null;
        
        let stationRes;
        try {
          stationRes = await getStationTracks(primaryId);
        } catch (err) {
          if (secondaryId) {
            stationRes = await getStationTracks(secondaryId);
          } else {
            throw err;
          }
        }
        
        if (cancelled) return;

        setStation(stationRes.station);
        setStationTracks(stationRes.tracks);

        try {
          // Use artist_id from station if available, otherwise fallback to the ID we used
          const artistId = stationRes.station.artist_id || primaryId;
          const artists = await getFeaturedArtists([{ artist_id: artistId }], null);
          const artist = await getUserById(artistId);
          if (!cancelled) {
            setSeedArtist(artist);
            setStationTracks(stationRes.tracks);
            setFeaturedArtists(artists);
          }
        } catch {
          if (!cancelled) setSeedArtist(null);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setStation(null);
          setSeedArtist(null);
          setError("Station not found.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [stationSlug]);

  if (loading) {
    return (
      <div
        data-test="station-slug-loading"
        className="animate-pulse p-20 text-center text-white"
      >
        Loading station...
      </div>
    );
  }

  if (error || !station) {
    return (
      <div
        data-test="station-slug-error"
        className="p-20 text-center text-red-500"
      >
        {error || "Station not found."}
      </div>
    );
  }

  const stationPlaylistDetails = toStationPlaylistDetails(station, stationTracks);

  const handlePlayStation = () => {
    addStation({
      id: station.id,
      name: station.name,
      seedArtist: {
        id: seedArtist?.id ?? station.artist_id,
        displayName: seedArtist?.display_name ?? station.artist_name,
        username: seedArtist?.username ?? slugify(station.artist_name),
        avatarUrl:
          seedArtist?.profile_picture ??
          "https://picsum.photos/seed/station-artist/100/100",
      },
      coverUrl: station.images?.center ?? station.images?.left ?? null,
      trackCount: station.track_count,
    });
  };

  return (
    <div
      data-test="station-slug-page"
      className="flex-1 w-full bg-bg min-h-screen"
    >
      <div data-test="station-slug-hero">
        <PlaylistHero
          playlist={stationPlaylistDetails}
          isPlaying={false}
          activeTrackId={undefined}
          onPlayPause={handlePlayStation}
          showUploadButton={false}
          ownerUsername={seedArtist?.display_name ?? station.artist_name}
          isStation
          coverImages={[
            station.images?.left ?? null,
            station.images?.center ?? null,
            station.images?.right ?? null,
          ]}
        />
      </div>

      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          <div className="flex-1 min-w-0" data-test="station-slug-main">
            <div data-test="station-slug-actions">
              <PlaylistActionsForYou
                playlist={stationPlaylistDetails}
                initialTracks={stationTracks}
                onAddToNextUp={handlePlayStation}
                isStation={true}
                engagementKind="station"
              />
            </div>

            <div className="mt-8" data-test="station-slug-tracklist">
              <TrackList tracks={stationTracks} showMockTracks={false} />
            </div>
          </div>

          <div
            className="w-full lg:w-70 shrink-0"
            data-test="station-slug-sidebar"
          >
            <PlaylistSidebarForYou
              playlist={stationPlaylistDetails}
              featuredArtists={featuredArtists}
            />
            <GuestPageFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
