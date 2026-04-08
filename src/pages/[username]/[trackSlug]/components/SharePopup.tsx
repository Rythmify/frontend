import { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaTwitter,
  FaFacebook,
  FaTumblr,
  FaPinterest,
  FaEnvelope,
  FaLink,
  FaCheck,
} from "react-icons/fa";
import type { Track } from "../../../../types/track";
import type { Playlist } from "@/services/api/playlist/playlist.service";

// Update the props to accept either track or playlist
interface SharePopupProps {
  track?: Track;
  playlist?: Playlist;
  onClose: () => void;
}

type Tab = "share" | "embed" | "message";

export default function SharePopup({
  track,
  playlist,
  onClose,
}: SharePopupProps) {
  const [activeTab, setActiveTab] = useState<Tab>("share");
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Normalize data for display
  const displayData = track
    ? {
        title: track.title,
        subtitle: track.artistName,
        image: track.coverUrl,
        duration: track.duration,
        waveformData: track.waveformData,
      }
    : {
        title: playlist?.name || "Untitled Playlist",
        subtitle: playlist?.owner_user_id || "Unknown Owner",
        image: playlist?.cover_image || "https://via.placeholder.com/150",
        duration: `${playlist?.track_count || 0} tracks`,
        waveformData: undefined, 
      };

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      ref={overlayRef}
      data-test="share-popup-overlay"
      onClick={handleBackdrop}
      className="fixed inset-0 z-[200] flex items-start justify-center pt-16 bg-black/60 backdrop-blur-sm"
    >
      <div
        className="w-[520px] max-w-[95vw] bg-[#1a1a1a] rounded-lg shadow-2xl overflow-hidden"
        style={{
          transform: visible ? "translateY(0)" : "translateY(-40px)",
          opacity: visible ? 1 : 0,
          transition:
            "transform 0.3s cubic-bezier(0.34,1.2,0.64,1), opacity 0.25s ease",
        }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <h2 className="text-white text-xs font-bold uppercase tracking-widest">
            Share
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex border-b border-[#333] mt-3 px-5">
          {(["share", "embed", "message"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mr-6 pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative ${
                activeTab === tab
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f50]" />
              )}
            </button>
          ))}
        </div>

        <div className="px-5 py-5">
          {activeTab === "share" && <ShareTab data={displayData} />}
          {activeTab === "embed" && <EmbedTab data={displayData} />}
          {activeTab === "message" && <MessageTab />}
        </div>
      </div>
    </div>
  );
}

function ShareTab({ data }: { data: any }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 bg-[#222] rounded border border-[#333] p-3">
        <img
          src={data.image}
          alt=""
          className="w-14 h-14 rounded object-cover shrink-0"
        />
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div>
            <p className="text-white text-xs font-bold truncate">
              {data.title}
            </p>
            <p className="text-gray-400 text-[11px] truncate">
              {data.subtitle}
            </p>
          </div>
          {data.waveformData && (
            <div className="flex items-end gap-[2px] h-6">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-sm shrink-0 bg-[#555]"
                  style={{ height: `${Math.random() * 24}px` }}
                />
              ))}
            </div>
          )}
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>{data.waveformData ? "0:00" : ""}</span>
            <span>{data.duration}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#222] border border-[#333] rounded px-3 py-2 text-xs text-gray-400">
          <FaLink />
          <input
            readOnly
            value={shareUrl}
            className="bg-transparent flex-1 outline-none truncate"
          />
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold rounded hover:bg-gray-200 transition-colors"
        >
          {copied ? <FaCheck /> : <FaLink />} {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function EmbedTab({ data }: { data: any }) {
  const embedCode = `<iframe width="100%" height="300" scrolling="no" frameborder="no" src="https://rythmify.com/embed?url=${encodeURIComponent(window.location.href)}"></iframe>`;
  return (
    <div className="flex flex-col gap-4">
      <textarea
        readOnly
        value={embedCode}
        className="w-full bg-[#222] border border-[#333] rounded p-2 text-xs text-gray-400 h-24 resize-none outline-none font-mono"
      />
      <button
        onClick={() => navigator.clipboard.writeText(embedCode)}
        className="self-start px-4 py-2 bg-[#f50] text-white text-xs font-bold rounded"
      >
        Copy Embed Code
      </button>
    </div>
  );
}

function MessageTab() {
  return (
    <div className="py-10 text-center text-gray-400 text-xs">
      Direct messaging is coming soon.
    </div>
  );
}
