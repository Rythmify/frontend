import { usePlayerStore } from "../../stores/player.store";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaRandom,
} from "react-icons/fa";
import { MdRepeat, MdRepeatOne } from "react-icons/md";

export default function PlayerControls() {
  const {
    isPlaying,
    isShuffle,
    repeatMode,
    togglePlay,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerStore();

  return (
    <div data-test="player-controls" className="flex items-center gap-0.5 sm:gap-1">
      {/* Previous */}
      <ControlBtn data-test="player-button-previous" onClick={previous}>
        <FaStepBackward size={14} />
      </ControlBtn>

      {/* Play / Pause */}
      <button
        data-test="player-button-play-pause"
        onClick={togglePlay}
        className="
          w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0
          bg-white text-black hover:bg-white/90
          transition-all duration-150 cursor-pointer mx-1
        "
      >
        {isPlaying ? (
          <FaPause size={12} />
        ) : (
          <FaPlay size={12} className="ml-0.5" />
        )}
      </button>

      {/* Next */}
      <ControlBtn data-test="player-button-next" onClick={next}>
        <FaStepForward size={14} />
      </ControlBtn>

      {/* Shuffle */}
      <ControlBtn
        data-test="player-button-shuffle"
        onClick={toggleShuffle}
        active={isShuffle}
      >
        <FaRandom size={14} />
      </ControlBtn>

      {/* Repeat */}
      <ControlBtn
        data-test="player-button-repeat"
        onClick={toggleRepeat}
        active={repeatMode !== "none"}
      >
        {repeatMode === "one" ? (
          <MdRepeatOne size={18} />
        ) : (
          <MdRepeat size={18} />
        )}
      </ControlBtn>
    </div>
  );
}

function ControlBtn({
  children,
  onClick,
  active = false,
  "data-test": dataTest,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  "data-test"?: string;
}) {
  return (
    <button
      data-test={dataTest}
      onClick={onClick}
      className={`
        w-8 h-8 flex items-center justify-center
        transition-colors duration-150 cursor-pointer
        ${active ? "text-[#f50]" : "text-white hover:text-white/70"}
      `}
    >
      {children}
    </button>
  );
}