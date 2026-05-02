import { Link } from "react-router-dom";
import CoverImage from "@/components/UI/CoverImage";
import type { Track } from "@/services/api/upload/track.service";
import { PERIOD_LABELS } from "./insights.types";
import type { Period } from "./insights.types";

interface Props {
  tracks: Track[];
  period: Period;
}

export function InsightsTopTracks({ tracks, period }: Props) {
  return (
    <div className="bg-[#111] rounded-xl p-5" data-test="insights-top-tracks">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-bold">Top tracks</h3>
        <Link to="/artists" className="text-text text-xs hover:text-text-hover transition-colors">
          See all
        </Link>
      </div>
      <p className="text-text text-xs mb-4">{PERIOD_LABELS[period]}</p>

      {tracks.length === 0 ? (
        <p className="text-text text-sm py-4">Upload tracks to see insights.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tracks.map((track, i) => (
            <div
              key={track.id}
              className="flex items-center gap-3"
              data-test={`insights-top-track-${track.id}`}
            >
              <span className="text-text text-xs w-4 shrink-0 text-right">{i + 1}</span>
              <div className="w-9 h-9 shrink-0 rounded-sm overflow-hidden">
                <CoverImage src={track.cover_image} alt={track.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-hover text-sm font-semibold truncate">{track.title}</p>
                {track.artists && (
                  <p className="text-text text-xs truncate">{track.artists}</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-text-hover text-xs shrink-0">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {(track.play_count ?? 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
