import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useDownloadStore } from "@/stores/useDownload";
import type { Track } from "@/types/track";

interface DownloadButtonProps {
  track: Track;

  variant?: "sc" | "icon";
}

const SC_BTN: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  height: 32,
  padding: "0 12px",
  background: "#222",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 4,
  cursor: "pointer",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  transition: "background 0.15s",
  minWidth: 32,
};

// Simple CSS spinner
function Spinner({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// Download arrow icon (outline = not downloaded)
function DownloadOutlineIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12M7 11l5 5 5-5" />
      <path d="M5 19h14" />
    </svg>
  );
}

// Download arrow icon (filled = downloaded)
function DownloadFilledIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 3H11V12.17L8.41 9.58L7 11L12 16L17 11L15.59 9.58L13 12.17V3Z" />
      <path d="M5 19H19V21H5V19Z" />
    </svg>
  );
}

export default function DownloadButton({
  track,
  variant = "sc",
}: DownloadButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isDownloaded, isDownloading, toggleDownload } = useDownloadStore();
  const [hovered, setHovered] = useState(false);

  const isPro = user?.isPro ?? false;
  const downloaded = isDownloaded(track.id);
  const loading = isDownloading(track.id);

  const handleClick = () => {
    if (!isPro) {
      navigate("/premium");
      return;
    }
    toggleDownload(track);
  };

  const tooltip = loading
    ? "Downloading…"
    : !isPro
      ? "Premium feature — upgrade to download"
      : downloaded
        ? "Remove download"
        : "Save for offline";

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        title={tooltip}
        className={`w-9 h-8 cursor-pointer flex items-center justify-center rounded bg-input-bg hover:bg-border transition-colors ${
          downloaded ? "text-[#1D9E75]" : "text-text-hover"
        } ${!isPro || loading ? "opacity-60" : ""} disabled:cursor-not-allowed`}
      >
        {loading ? (
          <Spinner size={13} />
        ) : downloaded ? (
          <DownloadFilledIcon size={14} />
        ) : (
          <DownloadOutlineIcon size={14} />
        )}
      </button>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button
        onClick={handleClick}
        disabled={loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...SC_BTN,
          color: downloaded
            ? "#1D9E75"
            : !isPro
              ? "rgba(255,255,255,0.35)"
              : "#fff",
          background: hovered ? "#333" : "#222",
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <Spinner size={13} />
        ) : downloaded ? (
          <DownloadFilledIcon size={14} />
        ) : (
          <DownloadOutlineIcon size={14} />
        )}
      </button>

      {hovered && !loading && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 3,
            zIndex: 9999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
