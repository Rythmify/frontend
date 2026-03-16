import { useState, useEffect, useRef } from "react";

const MicSelector = ({ selectedMicId, onSelectMic }: any) => {
  const [isMicMenuOpen, setIsMicMenuOpen] = useState(false);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  {/* event to get available microphones in system*/}
  const getMicrophones = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      setMics(devices.filter((d) => d.kind === "audioinput"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const close = () => setIsMicMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Icon and Chevron to be always down */}
      <div
        className="flex items-center gap-2 text-white cursor-pointer transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          if (!isMicMenuOpen) getMicrophones();
          setIsMicMenuOpen(!isMicMenuOpen);
        }}
      >
        {/* Microphone Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3m-1.2-9.1c0-.66.54-1.2 
          1.2-1.2s1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2s-1.2-.54-1.2-1.2zm6.5 6.1c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 
          11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72z" />
        </svg>
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${isMicMenuOpen ? "" : ""}`} />
      </div>

      {/* The Floating Menu & to be always on top when clicked*/}
      {isMicMenuOpen && (
        <div 
          className="absolute top-[calc(100%+15px)] left-0 right-0 z-[999] w-fit bg-[#2E2E2E] border border-[#333] 
          rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.5)] "
          onClick={(e) => e.stopPropagation()}
        >
          {mics.map((mic) => (
            <div
              key={mic.deviceId}
              onClick={() => {
                onSelectMic(mic.deviceId);
                setIsMicMenuOpen(false);
              }}
              className="flex items-center justify-between px-4 py-3 hover:bg-[#3a3a3a] cursor-pointer transition-colors"
            >
              <span className={`text-[13px] truncate pr-4 ${mic.deviceId === selectedMicId ? 
                "text-white text-[14px] font-bold" : "text-gray-400 text-[14px] "}`}>
                {mic.label || "Microphone"}
              </span>
              {mic.deviceId === selectedMicId && (
                <i className="fa-solid fa-check text-white font-normal text-[14px] " />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MicSelector;