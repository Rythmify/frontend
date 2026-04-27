interface DisplayTrack {
  id: string;
  title: string;
  artistName?: string;
  coverUrl?: string;
}

interface TracksToAddListProps {
  tracks: DisplayTrack[];
  isPlaylist: boolean; 
  onRemove: (id: string) => void;
}

const TracksToAddList = ({
  tracks,
  isPlaylist,
  onRemove,
}: TracksToAddListProps) => {
  if (tracks.length === 0) return null;

  return (
    <div
      data-test="tracks-to-add-list"
      className={`rounded-sm overflow-hidden  ${
        isPlaylist ? "max-h-64 overflow-y-auto" : ""
      }`}
    >
      {tracks.map((track) => (
        <div
          key={track.id}
          data-test={`track-to-add-${track.id}`}
          className="flex items-center gap-2 py-2 px-2 transition-colors group"
        >
          {/* Cover */}
          <div className="w-10 h-10 shrink-0 overflow-hidden bg-[#2a2a2a]">
            {track.coverUrl ? (
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-[#666]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
          </div>

          {/* Artist · Title */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-[#aaa] truncate leading-tight">
              <span className="text-[#888]">{track.artistName}</span>
              {track.artistName && (
                <span className="text-text-secondary">·</span>
              )}
              <span className="text-white font-semibold">{track.title}</span>
            </p>
          </div>

          {/* X button */}

          <button
            type="button"
            data-test={`button-remove-track-${track.id}`}
            onClick={() => onRemove(track.id)}
            className="shrink-0 text-[#666] hover:text-white transition-colors cursor-pointer p-1"
            aria-label="Remove track"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path
                d="M10.5 1.5 6 6m0 0L1.5 10.5M6 6 1.5 1.5M6 6l4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default TracksToAddList;
