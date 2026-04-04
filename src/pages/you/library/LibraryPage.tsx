import { useState, useEffect } from "react";
import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import TrackCard from "@/components/UI/card/Card";
import UserCard from "@/components/UI/UserCard/UserCard";
import {
  getRecentlyPlayed,
  getTrackById,
} from "@/services/api/discover.service";
import { mapApiTrackToTrack } from "@/services/api/discover.mapper";
import { mockRecentlyPlayedTracks } from "@/services/mocks/discover";
import { mockFollowing } from "@/components/Profile/MockData/mock";
import type { Track } from "@/types/track";
import type { User } from "@/types/user";

// Adapt mockFollowing to User type
const followingUsers: User[] = mockFollowing.map((u, i) => ({
  id: i + 1,
  username: u.username,
  displayName: u.displayName,
  avatar: u.avatar,
  followers: u.followers,
  isVerified: u.isVerified,
}));

export default function LibraryPage() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);

  useEffect(() => {
    getRecentlyPlayed()
      .then((items) =>
        Promise.all(items.map((item) => getTrackById(item.track.id))),
      )
      .then((tracks) => setRecentlyPlayed(tracks.map(mapApiTrackToTrack)))
      .catch(() => setRecentlyPlayed(mockRecentlyPlayedTracks));
  }, []);

  const displayedRecent = recentlyPlayed.length
    ? recentlyPlayed
    : mockRecentlyPlayedTracks;

  return (
    <div className="flex flex-col gap-12">
      {/* Recently Played */}
      <HorizontalCarousel title="Recently played" data-section="recently-played" titleClassName="text-white font-semibold text-[19px] text-left pb-4">
        {displayedRecent.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </HorizontalCarousel>

      {/* Likes */}
      <HorizontalCarousel title="Likes" data-section="likes" titleClassName="text-white font-semibold text-[19px] text-left pb-4">
        {mockRecentlyPlayedTracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </HorizontalCarousel>

      {/* Playlists — Mariam's section */}
      <HorizontalCarousel title="Playlists" data-section="playlists" titleClassName="text-white font-semibold text-[19px] text-left pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px] aspect-square rounded-md bg-input-bg shrink-0"
          />
        ))}
      </HorizontalCarousel>

      {/* Albums — Mariam's section */}
      <HorizontalCarousel title="Albums" data-section="albums" titleClassName="text-white font-semibold text-[19px] text-left pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px] aspect-square rounded-md bg-input-bg shrink-0"
          />
        ))}
      </HorizontalCarousel>

      {/* Following */}
      <HorizontalCarousel title="Following" data-section="following" titleClassName="text-white font-semibold text-[19px] text-left pb-4">
        {followingUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </HorizontalCarousel>
    </div>
  );
}
