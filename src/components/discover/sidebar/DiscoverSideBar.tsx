import { useState } from "react";
import ArtistToolsCard from "./ArtistToolsCard";
import TrackItem from "@/components/UI/TrackItem";
import TrackListSection from "@/components/UI/TrackListSection/TrackListSection";
import ArtistListSection from "@/components/UI/ArtistListSection";
import GoMobileSection from "@/components/UI/GoMobile";

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

const mockSuggestedArtistsData = [
  {
    username: "fatma-amin",
    avatar: "https://picsum.photos/48/48?random=10",
    followers: 45200,
    tracks: 23,
    isVerified: true,
  },
  {
    username: "moh-elghaleez",
    avatar: "https://picsum.photos/48/48?random=11",
    followers: 38500,
    tracks: 18,
    isVerified: false,
  },
  {
    username: "league-of-legends",
    avatar: "https://picsum.photos/48/48?random=12",
    followers: 1200000,
    tracks: 45,
    isVerified: true,
  },
  {
    username: "shahd-music",
    avatar: "https://picsum.photos/48/48?random=13",
    followers: 28300,
    tracks: 12,
    isVerified: false,
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
  const [suggestedArtists, setSuggestedArtists] = useState(
    mockSuggestedArtistsData,
  );

  const handleRefreshArtists = () => {
    console.log("Refreshing suggested artists...");
    const shuffled = [...suggestedArtists].sort(() => Math.random() - 0.5);
    setSuggestedArtists(shuffled);
  };

  return (
    <aside data-test="discover-sidebar" className={styles.sidebar}>
      {/* Artist Tools Section */}
      <div data-test="discover-sidebar-artist-tools">
        <ArtistToolsCard />
      </div>

      {/* Suggested Artists Section */}
      <div data-test="discover-sidebar-suggested-artists">
        <ArtistListSection
          title="ARTISTS YOU SHOULD FOLLOW"
          artists={suggestedArtists}
          onRefresh={handleRefreshArtists}
          maxDisplay={3}
        />
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
          {mockListeningHistory.slice(0, 3).map((track) => (
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
