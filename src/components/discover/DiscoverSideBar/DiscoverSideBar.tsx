import { useState } from "react";
import ArtistToolsCard from "./ArtistToolsCard";
import TrackItem from "@/components/UI/TrackItem";
import TrackListSection from "@/components/UI/TrackListSection";
import ArtistListSection from "@/components/UI/ArtistListSection";
import GoMobileSection from "@/components/UI/GoMobile";

// ─── Mock Data ────────────────────────────────────────────
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
    plays: 45000,
    likes: 1200,
    reposts: 30,
    comments: 45,
  },
  {
    id: "3",
    title: "السلام",
    artist: "Fatma Amin",
    coverUrl: "https://picsum.photos/48/48?random=3",
    plays: 89000,
    likes: 2100,
    reposts: 50,
    comments: 67,
  },
];

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

const mockSuggestedArtists = [
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
    followers: 12800,
    tracks: 15,
    isVerified: false,
  },
  {
    username: "alaa-hamed",
    avatar: "https://picsum.photos/48/48?random=12",
    followers: 67500,
    tracks: 42,
    isVerified: true,
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
  const [suggestedArtists, setSuggestedArtists] =
    useState(mockSuggestedArtists);

  // Handle refresh suggested artists
  const handleRefreshArtists = () => {
    // TODO: Fetch new suggested artists from API
    console.log("Refreshing suggested artists...");

    //shuffle the existing list (a demo for now)
    setSuggestedArtists([...suggestedArtists].sort(() => Math.random() - 0.5));
  };

  return (
    <aside className={styles.sidebar}>
      {/* Artist Tools */}
      <ArtistToolsCard />

      {/* Liked Tracks Section */}
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
              // TODO: Call API to unlike track
              console.log("Unlike track:", id);
            }}
          />
        ))}
      </TrackListSection>

      {/* Listening History */}
      <TrackListSection title="LISTENING HISTORY" viewAllLink="/you/history">
        {mockListeningHistory.slice(0, 3).map((track) => (
          <TrackItem key={track.id} {...track} initialLiked={false} />
        ))}
      </TrackListSection>

      {/* Suggested Artists */}
      <ArtistListSection
        title="SUGGESTED ARTISTS"
        artists={suggestedArtists}
        onRefresh={handleRefreshArtists}
        maxDisplay={3}
      />

      {/* Go Mobile */}
      <GoMobileSection />
    </aside>
  );
};

export default DiscoverSidebar;
