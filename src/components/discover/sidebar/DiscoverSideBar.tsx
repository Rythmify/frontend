import { useState, useEffect } from "react";
import ArtistToolsCard from "./ArtistToolsCard";
import TrackItem from "@/components/UI/TrackItem";
import TrackListSection from "@/components/UI/TrackListSection/TrackListSection";
import ArtistListSection from "@/components/UI/ArtistListSection";
import GoMobileSection from "@/components/UI/GoMobile";
import { getSuggestedArtists, getListeningHistory, getTrackById } from "@/services/api/discover.service";
import { mapApiUserToArtist, mapApiTrackToTrack } from "@/services/api/discover.mapper";
import { getUserById } from "@/services/mocks/User.service";
import type { Track } from "@/types/track";

// ─── Mock Data ────────────────────────────────────────────
const mockLikedTracks = [
  {
    id: "101",
    title: "Moonlight Sonata",
    artist: "Classical Vibes",
    coverUrl: "https://picsum.photos/48/48?random=20",
    plays: 450000,
    likes: 8200,
    reposts: 120,
    comments: 145,
  },
  {
    id: "102",
    title: "Summer Breeze",
    artist: "Jazz Collective",
    coverUrl: "https://picsum.photos/48/48?random=21",
    plays: 380000,
    likes: 6500,
    reposts: 95,
    comments: 108,
  },
  {
    id: "103",
    title: "Desert Wind",
    artist: "Ambient Soul",
    coverUrl: "https://picsum.photos/48/48?random=22",
    plays: 290000,
    likes: 5100,
    reposts: 78,
    comments: 89,
  },
];

const mockListeningHistory = [
  {
    id: "1",
    title: "ما أجهلك",
    artist: "أمجد سمير",
    coverUrl: "https://picsum.photos/48/48?random=1",
    plays: 312000,
    likes: 5140,
    reposts: 70,
    comments: 99,
  },
  {
    id: "2",
    title: "يا مسافر",
    artist: "Moh.ElGhaleez",
    coverUrl: "https://picsum.photos/48/48?random=2",
    plays: 245000,
    likes: 3200,
    reposts: 45,
    comments: 67,
  },
  {
    id: "3",
    title: "السلام",
    artist: "Fatma Amin",
    coverUrl: "https://picsum.photos/48/48?random=3",
    plays: 189000,
    likes: 2800,
    reposts: 34,
    comments: 52,
  },
];

// ─── Styles ───────────────────────────────────────────────
const styles = {
  sidebar: `
    flex flex-col gap-6
    w-full
  `,
};

// ─── Component ────────────────────────────────────────────
const DiscoverSidebar = () => {
  const [suggestedArtists, setSuggestedArtists] = useState<
    ReturnType<typeof mapApiUserToArtist>[]
  >([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [artistsError, setArtistsError] = useState<string | null>(null);
  const [historyTracks, setHistoryTracks] = useState<Track[] | null>(null);

  // Two-step fetch: get suggested user IDs → fetch full profile per user.
  useEffect(() => {
    getSuggestedArtists({ limit: 10 })
      .then((res) =>
        Promise.all(
          res.items.map((suggestedUser) => getUserById(suggestedUser.user_id)),
        ),
      )
      .then((fullProfiles) => {
        setSuggestedArtists(fullProfiles.map(mapApiUserToArtist));
      })
      .catch((err: Error) => {
        setArtistsError(err.message);
      })
      .finally(() => {
        setArtistsLoading(false);
      });
  }, []);

  // Two-step fetch: get listening history → fetch full track data per entry.
  useEffect(() => {
    getListeningHistory({ limit: 3 })
      .then(({ data: historyEntries }) =>
        Promise.all(
          historyEntries.map((historyEntry) => getTrackById(historyEntry.track.id)),
        ),
      )
      .then((fullTracks) => setHistoryTracks(fullTracks.map(mapApiTrackToTrack)))
      .catch(() => {}); // silent — mock is the fallback
  }, []);

  // Shuffle the already-loaded list — no extra network call needed.
  const handleRefreshArtists = () => {
    setSuggestedArtists((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  // Normalize API tracks to the flat shape TrackItem expects.
  // Falls back to mockListeningHistory when the fetch hasn't resolved yet.
  const listeningItems = (
    historyTracks?.map((track) => ({
      id: String(track.id),
      title: track.title,
      artist: track.artistName,
      coverUrl: track.coverUrl,
      plays: track.playCount,
      likes: track.likeCount,
      reposts: track.repostCount,
      comments: track.commentCount,
    })) ?? mockListeningHistory
  ).slice(0, 3);

  return (
    <aside data-test="discover-sidebar" className={styles.sidebar}>
      {/* Artist Tools Section */}
      <div data-test="discover-sidebar-artist-tools">
        <ArtistToolsCard />
      </div>

      {/* Suggested Artists Section */}
      <div data-test="discover-sidebar-suggested-artists">
        {artistsError ? (
          <p className="text-xs text-text-secondary">{artistsError}</p>
        ) : (
          <ArtistListSection
            title="ARTISTS YOU SHOULD FOLLOW"
            artists={artistsLoading ? [] : suggestedArtists}
            onRefresh={handleRefreshArtists}
            maxDisplay={3}
          />
        )}
      </div>

      {/* Liked Tracks Section */}
      <div data-test="discover-sidebar-liked-tracks">
        <TrackListSection
          title={`${mockLikedTracks.length} LIKES`}
          viewAllLink="/you/likes"
        >
          {mockLikedTracks.slice(0, 3).map((track) => (
            <TrackItem
              key={track.id}
              {...track}
              initialLiked={true}
              //TODO: waiting for back to implement engagement endpoints
              onUnlike={(id) => {
                console.log("Unlike track:", id);
              }}
            />
          ))}
        </TrackListSection>
      </div>

      {/* Listening History Section */}
      <div data-test="discover-sidebar-listening-history">
        <TrackListSection title="LISTENING HISTORY" viewAllLink="/you/history">
          {listeningItems.map((track) => (
            <TrackItem key={track.id} {...track} initialLiked={false} />
          ))}
        </TrackListSection>
      </div>

      {/* Go Mobile Section */}
      <div data-test="discover-sidebar-go-mobile">
        <GoMobileSection />
      </div>
    </aside>
  );
};

export default DiscoverSidebar;
