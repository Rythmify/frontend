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
    <div data-test="player-controls" className="flex items-center gap-1">

      {/* Previous */}
      <ControlBtn data-test="player-button-previous" onClick={previous}>
        <FaStepBackward className="text-xl" />
      </ControlBtn>

      {/* Play / Pause */}
      <button
        data-test="player-button-play-pause"
        onClick={togglePlay}
        className="
          w-9 h-9 rounded-full flex items-center justify-center shrink-0
          bg-white text-black hover:bg-[#ccc]
          transition-colors duration-150 cursor-pointer mx-1
        "
      >
        {isPlaying
          ? <FaPause className="text-md" />
          : <FaPlay className="text-md ml-0.5" />
        }
      </button>

      {/* Next */}
      <ControlBtn data-test="player-button-next" onClick={next}>
        <FaStepForward className="text-xl" />
      </ControlBtn>
    
      {/* Shuffle */}
      <ControlBtn
        data-test="player-button-shuffle"
        onClick={toggleShuffle}
        active={isShuffle}
      >
        <FaRandom className="text-md" />
      </ControlBtn>

      {/* Repeat */}
      <ControlBtn
        data-test="player-button-repeat"
        onClick={toggleRepeat}
        active={repeatMode !== "none"}
      >
        {repeatMode === "one"
          ? <MdRepeatOne className="text-base" />
          : <MdRepeat className="text-base" />
        }
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
        w-10 h-10 flex items-center justify-center rounded
        transition-colors duration-150 cursor-pointer
        ${active
          ? "text-accent hover:text-accent-hover"
          : "text-white hover:text-text-muted"
        }
      `}
    >
      {children}
    </button>
  );
}