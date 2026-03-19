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

interface SharePopupProps {
  track: Track;
  onClose: () => void;
}

type Tab = "share" | "embed" | "message";

export default function SharePopup({ track, onClose }: SharePopupProps) {
  const [activeTab, setActiveTab] = useState<Tab>("share");
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Slide-in 
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Slide-out 
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose();
  };

  // Close on Escape
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
      style={{ transition: "background 0.3s" }}
    >
      <div
        data-test="share-popup"
        className="w-[520px] max-w-[95vw] bg-[#1a1a1a] rounded-lg shadow-2xl overflow-hidden"
        style={{
          transform: visible ? "translateY(0)" : "translateY(-40px)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.3s cubic-bezier(0.34,1.2,0.64,1), opacity 0.25s ease",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <h2 className="text-white text-xs font-bold uppercase tracking-widest">
            Share
          </h2>
          <button
            data-test="button-close-share-popup"
            onClick={handleClose}
            className="text-[var(--color-text-muted)] hover:text-white transition-colors cursor-pointer text-sm"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] mt-3 px-5">
          {(["share", "embed", "message"] as Tab[]).map((tab) => (
            <button
              key={tab}
              data-test={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`
                mr-6 pb-3 text-xs font-bold uppercase tracking-widest
                transition-colors duration-150 cursor-pointer relative
                ${activeTab === tab
                  ? "text-white"
                  : "text-[var(--color-text-muted)] hover:text-white"
                }
              `}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent)] rounded-t-sm" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-5 py-5">
          {activeTab === "share" && <ShareTab track={track} />}
          {activeTab === "embed" && <EmbedTab track={track} />}
          {activeTab === "message" && <MessageTab />}
        </div>
      </div>
    </div>
  );
}

// Share Tab 
function ShareTab({ track }: { track: Track }) {
  const [atTimestamp, setAtTimestamp] = useState(false);
  const [shortenLink, setShortenLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socials = [
    { icon: <FaTwitter />, label: "Twitter", bg: "#1da1f2", "data-test": "social-twitter" },
    { icon: <FaFacebook />, label: "Facebook", bg: "#1877f2", "data-test": "social-facebook" },
    { icon: <FaTumblr />, label: "Tumblr", bg: "#35465c", "data-test": "social-tumblr" },
    { icon: <FaPinterest />, label: "Pinterest", bg: "#e60023", "data-test": "social-pinterest" },
    { icon: <FaEnvelope />, label: "Email", bg: "#555", "data-test": "social-email" },
  ];

  return (
    <div data-test="share-tab-content" className="flex flex-col gap-4">

      {/* Track preview card — artwork + info + mini waveform */}
      <div
        data-test="share-track-preview"
        className="flex items-center gap-3 bg-[var(--color-input-bg)] rounded border border-[var(--color-border)] p-3"
      >
        {/* Artwork */}
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-14 h-14 rounded object-cover shrink-0"
        />

        {/* Info + mini waveform */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div>
            <p className="text-white text-xs font-bold truncate">{track.title}</p>
            <p className="text-[var(--color-text-muted)] text-[11px] truncate">{track.artistName}</p>
          </div>
          {/* Mini waveform bars */}
          <div className="flex items-end gap-[2px] h-6">
            {Array.from({ length: 40 }, (_, i) => {
              const h = track.waveformData
                ? track.waveformData[i % track.waveformData.length]
                : Math.random() * 80 + 20;
              const played = i < 12;
              return (
                <div
                  key={i}
                  className="w-[3px] rounded-sm shrink-0"
                  style={{
                    height: `${(h / 100) * 24}px`,
                    background: played ? "var(--color-accent)" : "#555",
                  }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
            <span>0:00</span>
            <span>{track.duration}</span>
          </div>
        </div>
      </div>

      {/* Social icons */}
      <div data-test="share-social-icons" className="flex items-start gap-4">
        {socials.map((s) => (
          <button
            key={s.label}
            data-test={s["data-test"]}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <span
              className="w-11 h-11 flex items-center justify-center rounded-full text-white text-lg group-hover:opacity-80 transition-opacity"
              style={{ background: s.bg }}
            >
              {s.icon}
            </span>
            <span className="text-[var(--color-text-muted)] text-[11px] group-hover:text-white transition-colors">
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* URL input + Copy button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded px-3 py-2">
          <FaLink className="text-[var(--color-text-muted)] text-xs shrink-0" />
          <input
            data-test="share-url-input"
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent text-[var(--color-text-muted)] text-xs flex-1 outline-none truncate"
          />
        </div>
        <button
          data-test="button-copy-link"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] text-white text-xs font-semibold rounded transition-colors cursor-pointer shrink-0"
        >
          {copied ? <FaCheck className="text-green-400" /> : <FaLink />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Checkboxes */}
      <div className="flex items-center gap-5">
        <label
          data-test="checkbox-at-timestamp"
          className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs cursor-pointer select-none hover:text-white transition-colors"
        >
          <input
            type="checkbox"
            checked={atTimestamp}
            onChange={(e) => setAtTimestamp(e.target.checked)}
            className="w-3.5 h-3.5 accent-[var(--color-accent)]"
          />
          at current timestamp
        </label>
        <label
          data-test="checkbox-shorten-link"
          className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs cursor-pointer select-none hover:text-white transition-colors"
        >
          <input
            type="checkbox"
            checked={shortenLink}
            onChange={(e) => setShortenLink(e.target.checked)}
            className="w-3.5 h-3.5 accent-[var(--color-accent)]"
          />
          Shorten link
        </label>
      </div>
    </div>
  );
}

// Embed Tab 
function EmbedTab({ track }: { track: Track }) {
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay"\n  src="https://rythmify.com/player/?url=${encodeURIComponent(window.location.href)}">\n</iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div data-test="embed-tab-content" className="flex flex-col gap-4">
      <p className="text-[var(--color-text-muted)] text-xs">
        Copy the code below to embed{" "}
        <span className="text-white font-semibold">{track.title}</span> on your website.
      </p>
      <textarea
        data-test="embed-code-textarea"
        readOnly
        value={embedCode}
        rows={4}
        className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded px-3 py-2.5 text-[var(--color-text-muted)] text-xs resize-none outline-none font-mono focus:border-[var(--color-border-light)]"
      />
      <button
        data-test="button-copy-embed"
        onClick={handleCopy}
        className="self-start flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
      >
        {copied ? <FaCheck /> : <FaLink />}
        {copied ? "Copied!" : "Copy embed code"}
      </button>
    </div>
  );
}

// Message Tab 
function MessageTab() {
  return (
    <div
      data-test="message-tab-content"
      className="flex flex-col items-center justify-center gap-3 py-10 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-[var(--color-input-bg)] flex items-center justify-center text-[var(--color-text-muted)] text-xl">
        <FaEnvelope />
      </div>
      <p className="text-[var(--color-text-muted)] text-xs max-w-[260px] leading-relaxed">
        Send this track via direct message. This feature will be available soon.
      </p>
    </div>
  );
}