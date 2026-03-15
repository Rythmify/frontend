import { useState } from "react";

const RecordSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecordingFinished, setIsRecordingFinished] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressTransform = -100 + (seconds / 60) * 100;

  return (
    <div className="relative w-full bg-bg-upload border border-border rounded-sm mt-8 overflow-hidden font-['sohne',_sans-serif]">
      
      {/* --- Top Header Area --- */}
      <div className="p-6 flex items-center justify-between relative">
        <div className="flex items-center gap-1 text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3m-1.2-9.1c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2s-1.2-.54-1.2-1.2zm6.5 6.1c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72z" />
          </svg>
          <i className="fa-solid fa-chevron-down text-[10px] mt-1" />
        </div>

        <div className="text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
          <h4 className="text-white font-bold text-base m-0">Or record with a microphone</h4>
          <p className="text-text-upload text-xs m-0 mt-1">Upload recorded voice memos, updates, news, or intros to new releases.</p>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="w-8 h-8 flex items-center justify-center bg-[#333] rounded-full text-white cursor-pointer hover:bg-[#444] transition-colors z-10"
        >
          <i className={`fa-solid fa-chevron-up transition-transform ${!isExpanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* --- Expanded Section --- */}
      <div className={`transition-all duration-300 ${isExpanded ? "max-h-50" : "max-h-0"} overflow-hidden`}>
        
        {/* Progress Bar Track  */}
        <div className="px-6 relative h-0.5">
          <div className="absolute inset-x-6 h-full bg-[#333]" />
          {(isRecording || isRecordingFinished || isPaused) && (
            <div 
              className="absolute inset-x-6 h-full bg-accent transition-transform duration-500 ease-out origin-left"
              style={{ transform: `translateX(${progressTransform}%)` }}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default RecordSection;