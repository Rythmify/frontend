import { useState } from "react";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";

interface VolumeSliderProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
}

export default function VolumeSlider({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeSliderProps) {
  const [showSlider, setShowSlider] = useState(false);
  const effectiveVolume = isMuted ? 0 : volume;

  const handleVerticalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    onVolumeChange(ratio);
  };

  return (
    <div
      data-test="player-volume-wrapper"
      className="relative flex items-center shrink-0"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      {/* Vertical slider popup - appears above speaker on hover */}
      {showSlider && (
        <div
          data-test="player-volume-popup"
          className="
            absolute bottom-full left-1/2 -translate-x-1/2
            pb-3 flex flex-col items-center z-[200]
          "
        >
          <div className="
            w-8 h-28 flex flex-col items-center justify-center
            bg-[#1a1a1a] border border-white/10
            shadow-xl py-3
          ">
            {/* Vertical track */}
            <div
              data-test="player-volume-track"
              onClick={handleVerticalClick}
              className="relative w-[2px] h-full rounded-full bg-white/20 cursor-pointer"
            >
              {/* Filled portion */}
              <div
                className="absolute bottom-0 left-0 w-full rounded-full bg-[#f50]"
                style={{ height: `${effectiveVolume * 100}%` }}
              />
              {/* Thumb */}
              <div
                className="
                  absolute left-1/2 -translate-x-1/2
                  w-3 h-3 rounded-full bg-[#f50] shadow-md
                  pointer-events-none
                "
                style={{ bottom: `calc(${effectiveVolume * 100}% - 6px)` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Speaker icon */}
      <button
        data-test="player-button-mute"
        onClick={onToggleMute}
        className="
          w-11 h-11 flex items-center justify-center
          text-white hover:text-[var(--color-text-muted)]
          transition-colors cursor-pointer text-base shrink-0
        "
      >
        {isMuted || effectiveVolume === 0
          ? <HiSpeakerXMark />
          : <HiSpeakerWave />
        }
      </button>
    </div>
  );
}