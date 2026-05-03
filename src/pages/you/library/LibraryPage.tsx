import { Link } from "react-router-dom";
import TrackCard from "@/components/UI/card/Card";
import UserCard from "@/components/UI/UserCard/UserCard";
import LikesContent from "@/components/UI/LikesContent/LikesContent";
import PlaylistCard from "@/components/UI/PlaylistCard/PlaylistCard";
import StationCard from "@/components/UI/StationCard/StationCard";
import MadeForYouCard from "@/components/UI/MadeForYouCard/MadeForYouCard";
import MixCard from "@/components/UI/MixCard/MixCard";
import GenreCard from "@/components/UI/GenreCard/GenreCard";
import { LibrarySection, CARD_WIDTH } from "@/components/library/LibrarySection";
import { PlaylistFilterDropdown } from "@/components/library/PlaylistFilterDropdown";
import { useLibraryData } from "@/components/library/useLibraryData";

export default function LibraryPage() {
  const {
    recentEntries,
    recentTracks,
    likedTracks,
    likedStations,
    likedRadioTracks,
    likedMixes,
    likedGenres,
    visiblePlaylists,
    displayedAlbums,
    displayedFollowing,
    setFollowingUsers,
    playlistFilter,
    setPlaylistFilter,
    showMixesAndGenres,
  } = useLibraryData();

  return (
    <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
      {/* Recently Played */}
      <LibrarySection title="Recently played" data-test="library-recently-played">
        {recentEntries.map((entry, i) => {
          if (entry.type === "track")
            return (
              <TrackCard
                key={`track-${entry.item.id}`}
                track={entry.item}
                widthClassName={CARD_WIDTH}
                contextQueue={recentTracks}
              />
            );
          if (entry.type === "station")
            return (
              <StationCard
                key={`station-${entry.item.id}`}
                station={entry.item}
                widthClassName={CARD_WIDTH}
                colorIndex={i}
              />
            );
          if (entry.type === "mix")
            return (
              <MixCard
                key={`mix-${entry.item.id}`}
                mix={entry.item}
                widthClassName={CARD_WIDTH}
              />
            );
          return null;
        })}
      </LibrarySection>

      {/* Likes */}
      <LibrarySection
        title="Likes"
        data-test="library-likes"
        action={
          <Link
            to="/discover"
            data-test="library-likes-browse"
            className="text-text-secondary text-sm hover:text-white transition-colors"
          >
            Browse trending playlists
          </Link>
        }
      >
        <LikesContent
          tracks={likedTracks}
          showControls={false}
          widthClassName={CARD_WIDTH}
        />
      </LibrarySection>

      {likedRadioTracks.length > 0 && (
        <LibrarySection title="More of what you like" data-test="library-radio">
          {likedRadioTracks.map((item) => (
            <TrackCard
              key={item.playlistId}
              track={item.track}
              widthClassName={CARD_WIDTH}
              radioLikeMode
              radioPlaylistId={item.playlistId}
            />
          ))}
        </LibrarySection>
      )}

      {/* Playlists */}
      <LibrarySection
        title="Playlists"
        data-test="library-playlists"
        action={
          <PlaylistFilterDropdown value={playlistFilter} onChange={setPlaylistFilter} />
        }
      >
        {visiblePlaylists.map((item) => (
          <PlaylistCard key={item.id} item={item} widthClassName={CARD_WIDTH} />
        ))}

        {showMixesAndGenres &&
          likedMixes.map((mix, mixIndex) => {
            const mixId = mix.mix_id ?? mix.id;
            if (mix.kind === "daily" || mix.kind === "weekly") {
              return (
                <MadeForYouCard
                  key={mixId}
                  item={{
                    id: mix.id,
                    title: mix.title || (mix.kind === "daily" ? "Daily Drops" : "Weekly Wave"),
                    subtitle: mix.kind === "daily" ? "Daily mix" : "Weekly mix",
                    coverUrl: mix.cover_image ?? "",
                    madeKind: mix.kind,
                    badgeWords: mix.kind === "daily" ? ["DAILY", "DROPS"] : ["WEEKLY", "WAVE"],
                    badgeBg: mix.kind === "daily" ? "#1a237e" : "#1b5e20",
                  }}
                  widthClassName={CARD_WIDTH}
                />
              );
            }
            return (
              <MixCard
                key={mixId}
                mix={{
                  id: mix.id,
                  mix_id: mix.mix_id,
                  label: mix.title || `Mix ${mixIndex + 1}`,
                  flavor: "listening_history",
                  genre_name: null,
                  cover_image: mix.cover_image ?? null,
                  track_count: 0,
                  generated_at: "",
                  preview_track: null as any,
                  is_liked_by_me: true,
                }}
                widthClassName={CARD_WIDTH}
              />
            );
          })}

        {showMixesAndGenres &&
          likedGenres.map((genre, i) => (
            <GenreCard
              key={genre.id}
              item={{
                id: genre.id,
                genre: genre.genre,
                cover_image: genre.cover_image,
                track_count: 0,
              }}
              index={i}
              widthClassName={CARD_WIDTH}
            />
          ))}
      </LibrarySection>

      {/* Albums */}
      <LibrarySection title="Albums" data-test="library-albums">
        {displayedAlbums.map((item) => (
          <PlaylistCard key={item.id} item={item} widthClassName={CARD_WIDTH} />
        ))}
      </LibrarySection>

      {/* Stations */}
      <LibrarySection
        title="Stations"
        data-test="library-stations"
        action={
          <Link
            to="/discover"
            data-test="library-stations-browse"
            className="text-text-secondary text-sm hover:text-white transition-colors"
          >
            Browse trending playlists
          </Link>
        }
      >
        {likedStations.map((station, i) => (
          <StationCard
            key={station.id}
            station={station}
            widthClassName={CARD_WIDTH}
            colorIndex={i}
          />
        ))}
      </LibrarySection>

      {/* Following */}
      <LibrarySection title="Following" data-test="library-following">
        {displayedFollowing.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            widthClassName={CARD_WIDTH}
            initialIsFollowing={true}
            onUnfollow={() => setFollowingUsers((prev) => prev.filter((f) => f.id !== u.id))}
          />
        ))}
      </LibrarySection>
    </div>
  );
}
