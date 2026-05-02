import CoverImage from "@/components/UI/CoverImage";

interface MiniPlayerProps {
  coverImage: string | null
  trackName: string
  artistName: string
  onClose: () => void
}

const MiniPlayer = ({ coverImage, trackName, artistName, onClose }: MiniPlayerProps) => {
  return (
    <div data-test="mini-player" className="flex items-center justify-between px-4 py-2 bg-bg border-t border-border">

      {/* Left: avatar + info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-sm overflow-hidden flex-shrink-0">
          <CoverImage src={coverImage} alt={trackName} className="w-full h-full object-cover" />
        </div>

        {/* Track + Artist */}
        <div className="flex items-center gap-1 text-sm">
          <span className="font-semibold text-white">{trackName}</span>
          <span className="text-text-secondary">·</span>
          <span className="text-text-secondary">{artistName}</span>
        </div>
      </div>

      {/* Close */}
      <button
        data-test="mini-player-close"
        onClick={onClose}
        className="text-text-secondary hover:text-white transition-colors text-lg px-2"
      >
        ×
      </button>

    </div>
  )
}

export default MiniPlayer