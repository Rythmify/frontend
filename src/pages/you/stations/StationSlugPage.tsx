import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaylistSidebarForYou from "@/components/playlist/Made for you/PlaylistSidebarForYou";
import PlaylistActionsForYou from "@/components/playlist/Made for you/PlaylistActionsForYou";
import PlaylistHero from "@/components/playlist/PlaylistHero";
import TrackList from "@/components/playlist/TrackList";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";
import { getHome, type DiscoveryStation } from "@/services/api/discover.service";
import {
  type Playlist,
  type PlaylistDetails,
} from "@/services/api/playlist/playlist.service";
import { getUserById, type PublicUser } from "@/services/user.service";
import { useHistoryStore } from "@/stores/history.store";
import { mockRecentlyPlayedStations } from "@/services/mocks/discover";
import type { MockUser } from "@/services/mocks/users";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseStationParam(value: string) {
  const idx = value.lastIndexOf(":");
  if (idx === -1) return { slug: value, id: value };
  return {
    slug: value.slice(0, idx),
    id: value.slice(idx + 1),
  };
}

function toStationPlaylist(station: DiscoveryStation): Playlist {
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

function toStationPlaylistDetails(station: DiscoveryStation): PlaylistDetails {
  return {
    ...toStationPlaylist(station),
    tracks: [],
  };
}

function toFeaturedArtist(user: PublicUser, station: DiscoveryStation): MockUser {
  return {
    id: 0,
    username: user.username ?? slugify(user.display_name),
    displayName: user.display_name,
    avatarUrl:
      user.profile_picture ?? "https://picsum.photos/seed/station-artist/100/100",
    followerCount: user.followers_count ?? 0,
    trackCount: station.track_count,
    isFollowing: false,
  };
}

export default function StationSlugPage() {
  const { stationSlug } = useParams<{ stationSlug: string }>();
  const addStation = useHistoryStore((state) => state.addStation);

  const [station, setStation] = useState<DiscoveryStation | null>(null);
  const [seedArtist, setSeedArtist] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!stationSlug) return;

      setLoading(true);
      setError(null);

      try {
        const { slug, id } = parseStationParam(stationSlug);
        const home = await getHome();
        if (cancelled) return;

        const stations = home.discover_with_stations ?? [];
        const found =
          stations.find((s) => s.id === id) ??
          stations.find((s) => slugify(s.name) === slug) ??
          stations.find((s) => UUID_RE.test(s.id) && s.id === stationSlug) ??
          mockRecentlyPlayedStations.map((s) => ({
            id: s.id,
            name: s.name,
            artist_id: s.seedArtist.id,
            artist_name: s.seedArtist.displayName,
            images: { left: s.coverUrl ?? null, center: null, right: null },
            track_count: s.trackCount,
          } satisfies DiscoveryStation))[0] ??
          null;

        if (!found) throw new Error("Station not found");

        setStation(found);

        try {
          const artist = await getUserById(found.artist_id);
          if (!cancelled) setSeedArtist(artist);
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
      <div className="animate-pulse p-20 text-center text-white">
        Loading station...
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="p-20 text-center text-red-500">
        {error || "Station not found."}
      </div>
    );
  }

  const stationPlaylist = toStationPlaylist(station);
  const stationPlaylistDetails = toStationPlaylistDetails(station);
  const featuredArtists = seedArtist ? [toFeaturedArtist(seedArtist, station)] : [];

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
      <PlaylistHero
        playlist={stationPlaylistDetails}
        isPlaying={false}
        activeTrackId={undefined}
        onPlayPause={handlePlayStation}
        showUploadButton={false}
        ownerUsername={seedArtist?.display_name ?? station.artist_name}
        isStation
        backgroundImage={station.images?.center ?? station.images?.left ?? null}
        coverImages={[
          station.images?.left ?? null,
          station.images?.center ?? null,
          station.images?.right ?? null,
        ]}
      />

      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 py-6 w-full">
          <div className="flex-1 min-w-0">
            <PlaylistActionsForYou
              playlist={stationPlaylist}
              onAddToNextUp={handlePlayStation}
            />

            <div className="mt-8">
              <TrackList tracks={[]} showMockTracks />
            </div>
          </div>

          <div className="w-full lg:w-70 shrink-0">
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
