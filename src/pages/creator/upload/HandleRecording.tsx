import React, { useEffect } from "react";

interface HandleRecordingProps {
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  isRecordingFinished: boolean;
  setIsRecordingFinished: (val: boolean) => void;
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  formatTime: (s: number) => string;
  history: number[];
  setHistory: React.Dispatch<React.SetStateAction<number[]>>;
  redoStack: number[];
  setRedoStack: React.Dispatch<React.SetStateAction<number[]>>;
  currentSegmentStart: number;
  setCurrentSegmentStart: React.Dispatch<React.SetStateAction<number>>;
  onFinish: (data: Blob) => void;
  mediaRecorderRef: React.RefObject<MediaRecorder | null>;
  audioSegments: Blob[];
  setAudioSegments: React.Dispatch<React.SetStateAction<Blob[]>>;
  redoAudioStack: Blob[];
  setRedoAudioStack: React.Dispatch<React.SetStateAction<Blob[]>>;
  selectedMicId: string;
}

const HandleRecording = ({
  isRecording,
  setIsRecording,
  isPaused,
  setIsPaused,
  isRecordingFinished,
  setIsRecordingFinished,
  seconds,
  setSeconds,
  formatTime,
  history,
  setHistory,
  redoStack,
  setRedoStack,
  currentSegmentStart,
  setCurrentSegmentStart,
  onFinish,
  mediaRecorderRef,
  audioSegments,
  setAudioSegments,
  redoAudioStack,
  setRedoAudioStack,
  selectedMicId,
}: HandleRecordingProps) => {
  useEffect(() => {
    let interval: any;
    if (isRecording && !isPaused && seconds < 60) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (seconds >= 60) {
      setIsRecording(false);
      setIsPaused(false);
      setIsRecordingFinished(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [
    isRecording,
    isPaused,
    seconds,
    setIsRecording,
    setIsPaused,
    setIsRecordingFinished,
    setSeconds,
  ]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMicId ? { exact: selectedMicId } : undefined,
        },
      });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const segmentBlob = new Blob(chunks, {
          type: "audio/ogg; codecs=opus",
        });
        setAudioSegments((prev) => [...prev, segmentBlob]);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const handleRecordToggle = () => {
    if (isRecordingFinished) {
      handleRestart();
      setIsRecording(true);
      startRecording(); // Start recording
    } else if (!isRecording) {
      setCurrentSegmentStart(seconds);
      setIsRecording(true);
      setRedoStack([]);
      setRedoAudioStack([]); // Reset redo stack
      startRecording(); // Start recording
    } else {
      if (!isPaused) {
        mediaRecorderRef.current?.stop();
        const segmentDuration = seconds - currentSegmentStart;
        if (segmentDuration > 0) {
          setHistory([...history, segmentDuration]);
        }
      } else {
        setCurrentSegmentStart(seconds);
        startRecording();
      }
      setIsPaused(!isPaused);
    }
  };

  //undo icon function to undo the last segment
  const handleUndo = () => {
    if (history.length === 0 || audioSegments.length === 0) return;

    // undo time
    const lastTime = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setRedoStack([...redoStack, lastTime]);

    // remove audio segment
    const lastAudio = audioSegments[audioSegments.length - 1];
    setAudioSegments(audioSegments.slice(0, -1));
    setRedoAudioStack([...redoAudioStack, lastAudio]);

    setSeconds((prev) => Math.max(0, prev - lastTime));
  };

  //redo icon function to redo the last segment
  const handleRedo = () => {
    if (redoStack.length === 0 || redoAudioStack.length === 0) return;

    const segmentToRestore = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setHistory([...history, segmentToRestore]);

    const audioToRestore = redoAudioStack[redoAudioStack.length - 1];
    setRedoAudioStack(redoAudioStack.slice(0, -1));
    setAudioSegments([...audioSegments, audioToRestore]);

    setSeconds((prev) => Math.min(60, prev + segmentToRestore));
  };

  //stop icon function to stop the recording and save it without deleting it
  const handleStop = () => {
    if (isRecording || isPaused) {
      // If we stop while recording, stop the recorder first to trigger onstop
      if (isRecording && !isPaused) {
        mediaRecorderRef.current?.stop();
        const segmentDuration = seconds - currentSegmentStart;
        if (segmentDuration > 0) {
          setHistory([...history, segmentDuration]);
        }
      }

      // timeout to ensure the last segment is pushed to audioSegments
      mediaRecorderRef.current!.onstop = () => {
        setAudioSegments((prev) => {
          const finalBlob = new Blob(prev, {
            type:
              mediaRecorderRef.current?.mimeType ?? "audio/ogg; codecs=opus",
          });
          onFinish(finalBlob);
          return prev;
        });
        setIsRecording(false);
        setIsPaused(false);
        setIsRecordingFinished(true);
      };

      mediaRecorderRef.current?.stop();
    } else {
      // recorder already stopped, all segments are ready
      const finalBlob = new Blob(audioSegments, {
        type: mediaRecorderRef.current?.mimeType ?? "audio/ogg; codecs=opus",
      });
      onFinish(finalBlob);
      setIsRecording(false);
      setIsPaused(false);
      setIsRecordingFinished(true);
    }
  };

  //delete icon function to reset the recording and start over again
  const handleRestart = () => {
    setSeconds(0);
    setIsRecording(false);
    setIsPaused(false);
    setIsRecordingFinished(false);
    setAudioSegments([]);
    setRedoAudioStack([]);
    setHistory([]);
    setRedoStack([]);
    mediaRecorderRef.current?.stop();
  };

  return (
    /* Action buttons + Record button + timer*/
    <div className="p-6 flex items-center justify-center relative">
      {/* action buttons */}
      <div className="flex items-center gap-1 absolute left-6">
        {[
          {
            path: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
            action: handleStop,
          },
          {
            path: "M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8",
            action: handleUndo,
          },
          {
            path: "M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7z",
            action: handleRedo,
          },
          {
            path: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM8 9h8v10H8zm7.5-5-1-1h-5l-1 1H5v2h14V4z",
            action: handleRestart,
          },
        ].map((btn, i) => (
          <button
            data-test={`${btn.action === handleStop ? "stop-recording-button" : btn.action === handleUndo ? "undo-recording-button" : btn.action === handleRedo ? "redo-recording-button" : "restart-recording-button"}`}
            key={i}
            onClick={btn.action}
            className={`p-2 rounded-full transition-colors ${
              isRecordingFinished || isPaused
                ? "text-[#ffffff] hover:bg-[#565656] cursor-pointer"
                : "text-[#ffffff]/20 cursor-default"
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d={btn.path} />
            </svg>
          </button>
        ))}
      </div>

      {/* Record/ pause / resume button*/}
      <button
        data-test="record-toggle-button"
        onClick={handleRecordToggle}
        className="flex items-center gap-2 bg-[#565656] hover:bg-[#8b8b8b] text-[#ffffff] px-4 py-2.5 rounded-full font-bold 
      text-sm cursor-pointer transition-all justify-center z-10"
      >
        <svg
          className={`shrink-0 text-[#FB2C36] ${isRecording && !isPaused ? "animate-pulse" : ""}`}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="#E64A19"
        >
          <path
            d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5m0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 
				2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8"
          />
        </svg>

        <span>
          {!isRecording
            ? "Start recording"
            : isPaused
              ? "Resume recording"
              : "Pause recording"}
        </span>
      </button>

      {/*Timer Section stays absolute right */}
      <div className="text-[#ffffff] font-bold text-[11px] min-w-10 text-right absolute right-6">
        {formatTime(seconds)}
      </div>
    </div>
  );
};

export default HandleRecording;
