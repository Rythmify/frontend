import * as Tooltip from "@radix-ui/react-tooltip";
import TrackItem from "./TrackItem";
import type { PlaylistTrackItem } from "@/services/api/playlist/playlist.service";
import { mockPlaylistTracks } from "@/services/mocks/handlers/playlistHandlers";

interface TrackListProps {
  tracks: PlaylistTrackItem[];
  currentTrackId?: string;
  isPlaying?: boolean;
  onTrackPlay?: (track: PlaylistTrackItem) => void;
  onTrackLike?: (track: PlaylistTrackItem) => void;
  showMockTracks?: boolean;
}

export default function TrackList({
  tracks,
  currentTrackId,
  isPlaying = false,
  onTrackPlay,
  onTrackLike,
  showMockTracks = false,
}: TrackListProps) {
  const safeTracks = Array.isArray(tracks) ? tracks : [];
  const visibleTracks =
    safeTracks.length > 0
      ? safeTracks
      : showMockTracks
        ? mockPlaylistTracks
        : [];

  return (
    <Tooltip.Provider delayDuration={400} skipDelayDuration={100}>
      <div data-test="track-list" className="flex flex-col w-full">
        {visibleTracks.map((track, index) => (
          <TrackItem
            key={track.track_id}
            track={track}
            index={index + 1}
            isCurrent={track.track_id === currentTrackId}
            isPlaying={isPlaying && track.track_id === currentTrackId}
            onPlay={onTrackPlay ? () => onTrackPlay(track) : undefined}
            onLike={() => onTrackLike?.(track)}
          />
        ))}
      </div>
    </Tooltip.Provider>
  );
}

