import type { Track } from "@/services/api/upload/track.service";
import { TrackRow } from "./TrackRow";

interface Props {
  tracks: Track[];
  filter: "Public" | "Private";
}

export function TrackTable({ tracks, filter }: Props) {
  return (
    <div className="border-t border-[#2a2a2a]">
      <div className="grid grid-cols-[20px_1fr_64px_110px_180px_56px_28px] gap-x-4 px-2 py-2.5 text-[11px] font-bold text-text uppercase tracking-wider border-b border-[#2a2a2a]">
        <div />
        <div>Tracks</div>
        <div>Duration</div>
        <div>Date</div>
        <div>Engagements</div>
        <div>Plays</div>
        <div />
      </div>

      {tracks.length === 0 ? (
        <div className="py-12 text-center text-text text-sm">
          No {filter.toLowerCase()} tracks found.
        </div>
      ) : (
        tracks.map((track) => <TrackRow key={track.id} track={track} />)
      )}
    </div>
  );
}
