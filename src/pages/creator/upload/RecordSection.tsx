import { useState, useRef } from "react";
import HandleRecording from "./HandleRecording";
import MicSelector from "./MicSelector";

const RecordSection = ({ onFinish }: { onFinish: (data: Blob) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecordingFinished, setIsRecordingFinished] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedMicId, setSelectedMicId] = useState("default");
  const [history, setHistory] = useState<number[]>([]);
  const [redoStack, setRedoStack] = useState<number[]>([]);
  const [currentSegmentStart, setCurrentSegmentStart] = useState(0);
  const [audioSegments, setAudioSegments] = useState<Blob[]>([]);
  const [redoAudioStack, setRedoAudioStack] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative container bg-bg-upload border border-border rounded-sm mt-8 overflow-visible ">
      {/* Top Header Area & mic to see which mics you have on your system*/}
      <div className="p-6 flex items-center justify-between relative">
        <MicSelector
          selectedMicId={selectedMicId}
          onSelectMic={setSelectedMicId}
        />

        <div className="text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
          <h4 className="text-text-upload font-bold text-base m-0">
            Or record with a microphone
          </h4>
          <p className="text-text-upload text-xs m-0 mt-1">
            Upload recorded voice memos, updates, news, or intros to new
            releases.
          </p>
        </div>

        {/* Expand/ collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 flex items-center justify-center bg-transparent rounded-full text-white cursor-pointer hover:bg-[#444] transition-colors z-10"
        >
          <i
            className={`fa-solid fa-chevron-up transition-transform ${!isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* --- Expanded Section --- */}
      <div
        className={`transition-all duration-300 ${isExpanded ? "max-h-50" : "max-h-0"} overflow-hidden`}
      >
        {/* Progress Bar Track*/}
        <div className="px-10 relative h-0.5">
          <div className="absolute inset-x-6 h-full bg-[#757575]" />
          {(isRecording || isRecordingFinished || isPaused) && (
            <div
              className="absolute left-6 h-full bg-accent transition-all duration-1000 ease-linear rounded-full"
              style={{
                width: `calc(${(seconds / 60) * 100}% - 48px)`,
                maxWidth: "calc(100% - 48px)", //24px from each side
                transitionProperty: isPaused ? "none" : "all", //to smoothly pause
                minWidth: seconds > 0 ? "4px" : "0px", //show small progress at beginning
              }}
            />
          )}
        </div>

        {/* Calling handle record component*/}
        <HandleRecording
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          isRecordingFinished={isRecordingFinished}
          setIsRecordingFinished={setIsRecordingFinished}
          seconds={seconds}
          setSeconds={setSeconds}
          formatTime={formatTime}
          history={history}
          setHistory={setHistory}
          redoStack={redoStack}
          setRedoStack={setRedoStack}
          currentSegmentStart={currentSegmentStart}
          setCurrentSegmentStart={setCurrentSegmentStart}
          onFinish={onFinish}
          audioSegments={audioSegments}
          setAudioSegments={setAudioSegments}
          mediaRecorderRef={mediaRecorderRef}
          redoAudioStack={redoAudioStack}
          setRedoAudioStack={setRedoAudioStack}
        />
      </div>
    </div>
  );
};

export default RecordSection;
