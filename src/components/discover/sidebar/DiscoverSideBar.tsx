import { useState, useEffect } from "react";
import ArtistToolsCard from "./ArtistToolsCard";
import TrackItem from "@/components/UI/TrackItem";
import TrackListSection from "@/components/UI/TrackListSection/TrackListSection";
import ArtistListSection from "@/components/UI/ArtistListSection/ArtistListSection";
import GoMobileSection from "@/components/UI/GoMobile";
import {
  getSuggestedArtists,
  getListeningHistory,
} from "@/services/api/discover.service";
import {
  mapSuggestedArtistToArtistCard,
  mapTrackSummaryToTrack,
} from "@/services/api/discover.mapper";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import type { Track } from "@/types/track";

const DiscoverSidebar = () => {
  const [suggestedArtists, setSuggestedArtists] = useState<
    ReturnType<typeof mapSuggestedArtistToArtistCard>[]
  >([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [artistsError, setArtistsError] = useState<string | null>(null);
  const [apiHistoryTracks, setApiHistoryTracks] = useState<Track[]>([]);

  const likedTracks = useLikesStore((s) => s.likedTracks);
  const historyEntries = useHistoryStore((s) => s.entries);

  useEffect(() => {
    getSuggestedArtists({ limit: 10 })
      .then((res) =>
        setSuggestedArtists(res.data.map(mapSuggestedArtistToArtistCard)),
      )
      .catch((err: Error) => setArtistsError(err.message))
      .finally(() => setArtistsLoading(false));
  }, []);

  useEffect(() => {
    getListeningHistory({ limit: 3 })
      .then(({ data }) =>
        setApiHistoryTracks(data.map((e) => mapTrackSummaryToTrack(e.track))),
      )
      .catch(() => {});
  }, []);

  const handleRefreshArtists = () =>
    setSuggestedArtists((prev) => [...prev].sort(() => Math.random() - 0.5));

  const historyTracks: Track[] =
    historyEntries.length > 0
      ? historyEntries
          .filter((e) => e.type === "track")
          .map((e) => (e as { type: "track"; item: Track; playedAt: string }).item)
          .slice(0, 3)
      : apiHistoryTracks.slice(0, 3);

  const toItem = (t: Track) => ({
    id: String(t.id),
    title: t.title,
    artist: t.artistName,
    artistUsername: t.artistUsername,
    coverUrl: t.coverUrl,
    audioUrl: t.audioUrl,
    plays: t.playCount,
    likes: t.likeCount,
    reposts: t.repostCount,
    comments: t.commentCount,
    genre: t.genre,
    duration: t.duration,
    postedAt: t.postedAt,
    isPrivate: t.isPrivate,
  });

  return (
    <aside
      data-test="discover-sidebar"
      className="flex flex-col gap-6 w-full sticky top-[50px]"
    >
      <div data-test="discover-sidebar-artist-tools">
        <ArtistToolsCard />
      </div>

      <div data-test="discover-sidebar-suggested-artists">
        <ArtistListSection
          title="ARTISTS YOU SHOULD FOLLOW"
          artists={artistsLoading || artistsError ? [] : suggestedArtists}
          onRefresh={handleRefreshArtists}
          maxDisplay={3}
        />
      </div>

      {likedTracks.length > 0 && (
        <div data-test="discover-sidebar-liked-tracks">
          <TrackListSection
            title={`${likedTracks.length} LIKES`}
            viewAllLink="/you/likes"
          >
            {likedTracks.slice(0, 3).map((track) => (
              <TrackItem
                key={String(track.id)}
                {...toItem(track)}
              />
            ))}
          </TrackListSection>
        </div>
      )}

      {historyTracks.length > 0 && (
        <div data-test="discover-sidebar-listening-history">
          <TrackListSection title="LISTENING HISTORY" viewAllLink="/you/history">
            {historyTracks.map((track) => (
              <TrackItem
                key={String(track.id)}
                {...toItem(track)}
                initialLiked={false}
              />
            ))}
          </TrackListSection>
        </div>
      )}

      <div data-test="discover-sidebar-go-mobile">
        <GoMobileSection />
      </div>
    </aside>
  );
};

export default DiscoverSidebar;
