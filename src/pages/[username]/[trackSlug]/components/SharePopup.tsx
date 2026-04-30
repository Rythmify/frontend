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
import type { Playlist as BackendPlaylist } from "@/services/api/playlist/playlist.service";
import type { Playlist as FrontendPlaylist } from "@/types/playlist";
import axiosInstance from "@/services/api/axiosInstance";
import { 
  searchFollowing, 
  startConversation, 
  globalSearch,
  type FollowingUser,
  type UserSearchResult 
} from "@/services/api/messaging/conversationApi";
import { toast } from "sonner";
import { FaPlay } from "react-icons/fa";

interface SharePopupProps {
  track?: Track;
  playlist?: BackendPlaylist | FrontendPlaylist;
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

  // Normalize data for display based on whether it's a track or playlist
  const displayData = track
    ? {
        title: track.title,
        subtitle: track.artistName,
        image: track.coverUrl,
        duration: track.duration,
        waveformData: track.waveformData,
      }
    : {
        title: (playlist as FrontendPlaylist)?.title || (playlist as BackendPlaylist)?.name || "Untitled Playlist",
        subtitle: (playlist as FrontendPlaylist)?.creatorName || (playlist as BackendPlaylist)?.owner_user_id || "Unknown Owner",
        image: (playlist as FrontendPlaylist)?.coverUrl || (playlist as BackendPlaylist)?.cover_image || "https://via.placeholder.com/150",
        duration: (playlist as FrontendPlaylist)?.trackCount !== undefined 
          ? `${(playlist as FrontendPlaylist).trackCount} tracks` 
          : `${(playlist as BackendPlaylist)?.track_count || 0} tracks`,
        waveformData: undefined,
      };

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

  const getResourceUrl = () => {
    const origin = window.location.origin;
    if (track) {
      return `${origin}/${track.artistUsername || "artist"}/${track.trackSlug || track.id}`;
    }
    if (playlist) {
      const isBackend = "playlist_id" in playlist;
      const slug = isBackend 
        ? (playlist.slug || playlist.playlist_id) 
        : (playlist.playlistSlug || playlist.id);
      
      const username = isBackend 
        ? ((playlist as any).owner_username || playlist.owner_user_id || "user")
        : (playlist.creatorUsername || "user");
      
      const title = (isBackend ? playlist.name : playlist.title).toLowerCase();
      const subtype = (isBackend ? playlist.subtype : (playlist as any).subtype);

      if (title.includes("station")) return `${origin}/discover/stations/${slug}`;
      if (title.includes("mix")) return `${origin}/discover/sets/${slug}`;
      if (title.includes("personalised") || title.includes("made for you")) return `${origin}/discover/personalised/${slug}`;
      if (subtype === "album") return `${origin}/${username}/album/${slug}`;
      
      return `${origin}/${username}/sets/${slug}`;
    }
    return window.location.href;
  };

  return (
    <div
      ref={overlayRef}
      data-test="share-popup-overlay"
      onClick={handleBackdrop}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 backdrop-blur-sm p-4 pb-[85px]"
      style={{ transition: "background 0.3s" }}
    >
      <div
        data-test="share-popup"
        className="w-[520px] max-w-[95vw] bg-[#1a1a1a] rounded-lg shadow-2xl overflow-hidden"
        style={{
          transform: visible ? "translateY(0)" : "translateY(20px)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.3s cubic-bezier(0.34,1.2,0.64,1), opacity 0.25s ease",
          maxHeight: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
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
                ${
                  activeTab === tab
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
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 px-5 py-5 overflow-y-auto custom-scrollbar">
            {activeTab === "share" && (
              <ShareTab
                track={track}
                playlist={playlist}
                data={displayData}
                baseUrl={getResourceUrl()}
              />
            )}
            {activeTab === "embed" && (
              <EmbedTab
                track={track}
                playlist={playlist}
                data={displayData}
                baseUrl={getResourceUrl()}
              />
            )}
            {activeTab === "message" && (
              <MessageTab 
                track={track} 
                playlist={playlist} 
                onClose={handleClose}
                baseUrl={getResourceUrl()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Share Tab
function ShareTab({
  track,
  playlist,
  data,
  baseUrl,
}: {
  track?: Track;
  playlist?: BackendPlaylist | FrontendPlaylist;
  data: any;
  baseUrl: string;
}) {
  const [atTimestamp, setAtTimestamp] = useState(false);
  const [shortenLink, setShortenLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const targetUrl = baseUrl;
  const [shareUrl, setShareUrl] = useState(targetUrl);
  const [isShortening, setIsShortening] = useState(false);

  // Sync shareUrl when targetUrl changes (e.g. navigation or prop updates)
  useEffect(() => {
    if (!shortenLink) {
      setShareUrl(targetUrl);
    }
  }, [targetUrl, shortenLink]);

  // Handle URL shortening via resolve endpoint
  useEffect(() => {
    if (shortenLink) {
      setIsShortening(true);
      // We pass the full URL to the resolve endpoint as it handles parsing based on domain
      axiosInstance
        .get(`/resolve`, { params: { url: targetUrl } })
        .then((res) => {
          // Resolve endpoint typically returns { data: { permalink, ... } }
          const permalink = res.data?.data?.permalink || res.data?.permalink || res.data?.data?.url;
          if (permalink) {
            setShareUrl(permalink);
          }
        })
        .catch((err) => {
          console.error("[SharePopup] Shortening failed:", err);
          setShareUrl(targetUrl);
        })
        .finally(() => setIsShortening(false));
    }
  }, [shortenLink, targetUrl]);

  const handleCopy = () => {
    let finalUrl = shareUrl;
    if (atTimestamp) {
      const timeParts = timestamp.split(":").map(Number);
      let totalSeconds = 0;
      if (timeParts.length === 2) totalSeconds = timeParts[0] * 60 + timeParts[1];
      else if (timeParts.length === 1) totalSeconds = timeParts[0];
      
      // Handle query parameter appending
      const separator = finalUrl.includes("?") ? "&" : "?";
      finalUrl += `${separator}t=${totalSeconds}`;
    }
    
    navigator.clipboard.writeText(finalUrl).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const [timestamp, setTimestamp] = useState("0:00");

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    if (months > 0) return `${months} months ago`;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days ago`;
    return "Today";
  };

  const socials = [
    {
      icon: <FaTwitter />,
      label: "Twitter",
      bg: "#1da1f2",
      "data-test": "social-twitter",
      shareUrl: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out ${data.title} on Rythmify!`)}`,
    },
    {
      icon: <FaFacebook />,
      label: "Facebook",
      bg: "#1877f2",
      "data-test": "social-facebook",
      shareUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      icon: <FaTumblr />,
      label: "Tumblr",
      bg: "#35465c",
      "data-test": "social-tumblr",
      shareUrl: (url: string) => `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(url)}`,
    },
    {
      icon: <FaPinterest />,
      label: "Pinterest",
      bg: "#e60023",
      "data-test": "social-pinterest",
      shareUrl: (url: string) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(data.title)}`,
    },
    {
      icon: <FaEnvelope />,
      label: "Email",
      bg: "#555",
      "data-test": "social-email",
      shareUrl: (url: string) => `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(`Listen to ${data.title} by ${data.subtitle} on Rythmify: ${url}`)}`,
    },
  ];

  const handleSocialClick = (s: typeof socials[0]) => {
    const url = s.shareUrl(shareUrl);
    if (url.startsWith("mailto:")) {
      window.location.assign(url);
    } else {
      window.open(url, "_blank", "width=600,height=400,noopener,noreferrer");
    }
  };

  return (
    <div data-test="share-tab-content" className="flex flex-col gap-4">
      {/* Preview card — artwork + info + mini waveform (if track) */}
      <div
        data-test="share-track-preview"
        className="flex items-start gap-4 bg-[#111] border border-[#333] p-4 group/preview"
      >
        {/* Artwork */}
        <div className="relative w-[120px] h-[120px] shrink-0">
          <img
            src={data.image}
            alt={data.title}
            className="w-full h-full object-cover rounded-sm"
          />
        </div>

        {/* Info + mini waveform */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform">
                <FaPlay className="text-[10px] ml-0.5" />
              </button>
              <div>
                <p className="text-[var(--color-text-muted)] text-[11px] truncate">
                  {data.subtitle}
                </p>
                <p className="text-white text-sm font-bold truncate leading-tight">
                  {data.title}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
                {formatTimeAgo(track?.postedAt || (playlist as FrontendPlaylist)?.postedAt || (playlist as BackendPlaylist)?.created_at)}
              </span>
              {track?.genre && (
                <span className="bg-[#333] text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-300">
                  # {track.genre}
                </span>
              )}
            </div>
          </div>

          {/* Mini waveform bars */}
          <div className="flex flex-col gap-1">
            <div className="flex items-end gap-[1px] h-10">
              {Array.from({ length: 60 }, (_, i) => {
                const h = data.waveformData
                  ? data.waveformData[i % data.waveformData.length]
                  : Math.random() * 60 + 20;
                return (
                  <div
                    key={i}
                    className="w-[2px] rounded-t-[1px] shrink-0"
                    style={{
                      height: `${(h / 100) * 40}px`,
                      background: i < 20 ? "var(--color-accent)" : "#444",
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
              <span>{data.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social icons */}
      <div data-test="share-social-icons" className="flex items-start gap-4">
        {socials.map((s) => (
          <button
            key={s.label}
            data-test={s["data-test"]}
            onClick={() => handleSocialClick(s)}
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
            value={isShortening ? "Shortening..." : shareUrl}
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

      {/* Checkboxes + Timestamp input */}
      <div className="flex items-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <label
            data-test="checkbox-at-timestamp"
            className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs cursor-pointer select-none hover:text-white transition-colors"
          >
            <input
              type="checkbox"
              checked={atTimestamp}
              onChange={(e) => setAtTimestamp(e.target.checked)}
              className="w-4 h-4 accent-[var(--color-accent)] rounded-sm"
            />
            at
          </label>
          <input 
            type="text" 
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            disabled={!atTimestamp}
            className={`w-14 bg-[#333] border border-[#444] rounded px-2 py-1 text-xs text-white outline-none focus:border-gray-500 transition-all ${!atTimestamp && "opacity-50 pointer-events-none"}`}
          />
        </div>

        <label
          data-test="checkbox-shorten-link"
          className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs cursor-pointer select-none hover:text-white transition-colors"
        >
          <input
            type="checkbox"
            checked={shortenLink}
            onChange={(e) => setShortenLink(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-accent)] rounded-sm"
          />
          Shorten link
        </label>
      </div>
    </div>
  );
}

// Embed Tab
function EmbedTab({
  track,
  playlist,
  data,
  baseUrl,
}: {
  track?: Track;
  playlist?: BackendPlaylist | FrontendPlaylist;
  data: any;
  baseUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const [layout, setLayout] = useState<"full" | "classic" | "mini">("full");
  const [color, setColor] = useState("#ff5500");
  const [height, setHeight] = useState("300");
  const [options, setOptions] = useState({
    autoplay: false,
    showComments: true,
    showRecommendations: true,
    showOverlays: true,
  });

  const targetUrl = baseUrl;
  const embedCode = `<iframe width="100%" height="${height}" scrolling="no" frameborder="no" allow="autoplay" src="${window.location.origin}/player/?url=${encodeURIComponent(targetUrl)}&color=${encodeURIComponent(color)}&auto_play=${options.autoplay}&show_comments=${options.showComments}"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const layouts = [
    { id: "full", icon: "/embed-full.png", label: "Visual Player" },
    { id: "classic", icon: "/embed-classic.png", label: "Classic Player" },
    { id: "mini", icon: "/embed-mini.png", label: "Mini Player" },
  ];

  return (
    <div data-test="embed-tab-content" className="flex flex-col gap-6">
      {/* Layout Selectors */}
      <div className="flex gap-4">
        {layouts.map((l) => (
          <button
            key={l.id}
            onClick={() => setLayout(l.id as any)}
            className={`w-24 h-24 bg-[#222] border-2 rounded flex items-center justify-center transition-all ${
              layout === l.id ? "border-[var(--color-accent)]" : "border-[#333] grayscale hover:grayscale-0"
            }`}
          >
            <div className="w-16 h-16 bg-[#333] rounded-sm relative overflow-hidden">
               {/* Visual representation of player layouts */}
               {l.id === 'full' && (
                 <div className="absolute inset-0 flex flex-col">
                   <div className="flex-1 bg-gray-600" />
                   <div className="h-4 bg-white/20" />
                 </div>
               )}
               {l.id === 'classic' && (
                 <div className="absolute inset-0 flex p-1 gap-1">
                   <div className="w-1/3 bg-gray-600" />
                   <div className="flex-1 flex flex-col gap-1">
                      <div className="h-2 bg-white/20" />
                      <div className="h-2 bg-white/10" />
                   </div>
                 </div>
               )}
               {l.id === 'mini' && (
                 <div className="absolute inset-x-0 bottom-0 h-4 bg-gray-600" />
               )}
            </div>
          </button>
        ))}
      </div>

      {/* Code Box */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-white">Code</label>
          <button className="text-[11px] text-[var(--color-accent)] hover:underline">WordPress code</button>
        </div>
        <div className="relative group">
          <textarea
            readOnly
            value={embedCode}
            className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[11px] text-gray-400 font-mono resize-none h-10 outline-none focus:border-gray-500"
          />
          <button 
            onClick={handleCopy}
            className="absolute right-2 top-1.5 text-[10px] font-bold text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? "COPIED!" : "COPY"}
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-5 border-t border-[#333] pt-5">
        <label className="text-xs font-bold uppercase tracking-wider text-white">Options</label>
        
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Color:</span>
              <div className="flex gap-1">
                {["#ff5500", "#795548", "#90a4ae", "#a1887f", "#757575"].map(c => (
                  <button 
                    key={c} 
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-sm border ${color === c ? "border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input 
                type="text" 
                value={color} 
                onChange={e => setColor(e.target.value)}
                className="w-16 bg-[#111] border border-[#333] rounded px-1.5 py-0.5 text-[10px] text-white outline-none ml-1"
              />
           </div>

           <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Height:</span>
              <select 
                value={height}
                onChange={e => setHeight(e.target.value)}
                className="bg-[#111] border border-[#333] rounded text-[11px] text-white outline-none px-1 py-0.5"
              >
                <option value="166">166px</option>
                <option value="300">300px</option>
                <option value="450">450px</option>
                <option value="600">600px</option>
              </select>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3">
          {Object.entries(options).map(([key, val]) => (
            <label key={key} className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer hover:text-white transition-colors capitalize">
              <input 
                type="checkbox" 
                checked={val} 
                onChange={e => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                className="w-4 h-4 accent-[var(--color-accent)] rounded-sm"
              />
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageTab({ 
  track, 
  playlist, 
  onClose,
  baseUrl,
}: { 
  track?: Track; 
  playlist?: BackendPlaylist | FrontendPlaylist;
  onClose: () => void;
  baseUrl: string;
}) {
  const [query, setQuery] = useState("");
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);
  
  // Multiple resources support
  const initialResource = track 
    ? { type: 'track', id: track.id, title: track.title, subtitle: track.artistName, image: track.coverUrl, url: baseUrl }
    : playlist 
      ? (() => {
          const isBackend = "playlist_id" in playlist;
          const id = isBackend ? playlist.playlist_id : playlist.id;
          const title = isBackend ? playlist.name : playlist.title;
          const subtitle = isBackend ? playlist.owner_user_id : playlist.creatorName;
          const image = isBackend ? playlist.cover_image : playlist.coverUrl;
          
          return { type: 'playlist', id, title, subtitle, image, url: baseUrl };
        })()
      : null;

  const [sharedResources, setSharedResources] = useState<any[]>(initialResource ? [initialResource] : []);
  const [messageBody, setMessageBody] = useState("");
  const [isSearchingRecipients, setIsSearchingRecipients] = useState(false);
  const [isSearchingResources, setIsSearchingResources] = useState(false);
  const [resourceQuery, setResourceQuery] = useState("");
  const [resourceResults, setResourceResults] = useState<any[]>([]);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Sync message body with resources
  useEffect(() => {
    const links = sharedResources.map(r => r.url).join("\n");
    setMessageBody(`Check this out:\n${links}`);
  }, [sharedResources]);

  // Recipient search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        setIsSearchingRecipients(true);
        globalSearch(query, { type: 'users', limit: 10 })
          .then(res => setRecipients(res.data.users || []))
          .catch(() => setRecipients([]))
          .finally(() => setIsSearchingRecipients(false));
      } else {
        setRecipients([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Resource search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (resourceQuery.trim().length > 0) {
        setIsSearchingResources(true);
        globalSearch(resourceQuery, { limit: 10 })
          .then(res => {
            const tracks = (res.data.tracks || []).map((t: any) => ({
              type: 'track',
              id: t.id,
              title: t.title,
              subtitle: "Track",
              image: t.cover_image || "https://via.placeholder.com/150",
              url: `${window.location.origin}/${t.artist_username || "share"}/${t.slug || t.id}`
            }));
            const playlists = (res.data.playlists || []).map((p: any) => ({
              type: 'playlist',
              id: p.id,
              title: p.title,
              subtitle: "Playlist",
              image: p.cover_image || "https://via.placeholder.com/150",
              url: p.title.toLowerCase().includes("mix") ? `${window.location.origin}/discover/sets/${p.slug || p.id}` :
                   p.title.toLowerCase().includes("station") ? `${window.location.origin}/discover/stations/${p.slug || p.id}` :
                   `${window.location.origin}/${p.owner_id || "share"}/sets/${p.slug || p.id}`
            }));
            setResourceResults([...tracks, ...playlists]);
          })
          .catch(() => setResourceResults([]))
          .finally(() => setIsSearchingResources(false));
      } else {
        setResourceResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [resourceQuery]);

  const handleSend = async () => {
    if (selectedRecipients.length === 0) {
      toast.error("Please select a recipient");
      return;
    }
    setIsSending(true);
    try {
      // Send one message per recipient, potentially multiple if multiple resources
      // For simplicity, we send one message with the combined body and the first resource as an embed
      await Promise.all(selectedRecipients.map(r => 
        startConversation({
          recipient_id: r.id,
          body: messageBody,
          resource: sharedResources.length > 0 ? { type: sharedResources[0].type, id: sharedResources[0].id } : undefined
        })
      ));
      toast.success("Message sent successfully!");
      onClose();
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div data-test="message-tab-content" className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Recipient Search */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white">To <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="flex flex-wrap gap-2 p-2 min-h-[40px] bg-[#111] border border-[#333] rounded focus-within:border-gray-500 transition-colors">
              {selectedRecipients.map(r => (
                <span key={r.id} className="flex items-center gap-1 bg-[#333] text-white text-[11px] px-2 py-0.5 rounded-full">
                  {r.display_name || r.username}
                  <button onClick={() => setSelectedRecipients(prev => prev.filter(x => x.id !== r.id))} className="hover:text-red-400 cursor-pointer"><FaTimes size={10} /></button>
                </span>
              ))}
              <input 
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={selectedRecipients.length === 0 ? "Search for users" : ""}
                className="flex-1 bg-transparent text-white text-xs outline-none min-w-[120px]"
              />
            </div>
            {(isSearchingRecipients || query.trim().length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#222] border border-[#333] rounded shadow-xl z-50 max-h-48 overflow-y-auto py-1">
                {isSearchingRecipients ? (
                  <div className="px-3 py-4 text-center text-xs text-gray-500">Searching...</div>
                ) : recipients.length > 0 ? (
                  recipients.map(r => (
                    <button 
                      key={r.id}
                      onClick={() => {
                        if (!selectedRecipients.find(x => x.id === r.id)) {
                          setSelectedRecipients([...selectedRecipients, r]);
                        }
                        setQuery("");
                        setRecipients([]);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#333] transition-colors"
                    >
                      <img src={r.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.username}`} className="w-8 h-8 rounded-full bg-gray-700" alt="" />
                      <div className="text-left">
                        <p className="text-xs text-white font-bold">{r.display_name || r.username}</p>
                        <p className="text-[10px] text-gray-500">@{r.username}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-xs text-gray-500">No users found</div>
                )}
              </div>
            )}
          </div>
        </div>


        {/* Message Body */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white">Write your message and add tracks or playlists <span className="text-red-500">*</span></label>
          <textarea 
            value={messageBody}
            onChange={e => setMessageBody(e.target.value)}
            className="w-full h-32 bg-[#111] border border-[#333] rounded p-3 text-xs text-white resize-none outline-none focus:border-gray-500 transition-colors"
          />
        </div>

        {/* Shared Resources List */}
        <div className="flex flex-col gap-3">
          {sharedResources.map((res, idx) => (
            <div key={`${res.type}-${res.id}-${idx}`} className="flex items-center gap-3 p-3 bg-[#111] border border-[#333] rounded group">
              <img 
                src={res.image || "https://via.placeholder.com/150"} 
                className="w-10 h-10 rounded object-cover shrink-0" 
                alt="" 
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-bold truncate">{res.title}</p>
                <p className="text-[10px] text-gray-500 truncate">{res.subtitle}</p>
              </div>
              <button 
                onClick={() => setSharedResources(prev => prev.filter((_, i) => i !== idx))}
                className="text-gray-500 hover:text-red-400 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>

        {/* Resource Picker (Search Tracks/Playlists) */}
        {showResourcePicker && (
          <div className="flex flex-col gap-2 p-3 bg-[#111] border border-[var(--color-accent)] rounded">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white uppercase">Search for items to add</span>
              <button onClick={() => setShowResourcePicker(false)}><FaTimes size={12} className="text-gray-500 hover:text-white" /></button>
            </div>
            <input 
              autoFocus
              type="text"
              value={resourceQuery}
              onChange={e => setResourceQuery(e.target.value)}
              placeholder="Type track or playlist name..."
              className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-xs text-white outline-none focus:border-gray-500"
            />
            {isSearchingResources ? (
              <div className="py-2 text-center text-[10px] text-gray-500">Searching...</div>
            ) : resourceResults.length > 0 ? (
              <div className="max-h-40 overflow-y-auto flex flex-col gap-1 mt-1">
                {resourceResults.map(r => (
                  <button 
                    key={r.id}
                    onClick={() => {
                      setSharedResources([...sharedResources, r]);
                      setResourceQuery("");
                      setShowResourcePicker(false);
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-[#333] rounded transition-colors text-left"
                  >
                    <img src={r.image} className="w-8 h-8 rounded object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                       <p className="text-[11px] text-white font-bold truncate">{r.title}</p>
                       <p className="text-[9px] text-gray-500">{r.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : resourceQuery.trim() && (
              <div className="py-2 text-center text-[10px] text-gray-500">No items found</div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Footer Actions */}
      {!showResourcePicker && (
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-[#333]">
          <button 
            onClick={() => setShowResourcePicker(true)}
            className="px-4 py-2 bg-[#333] hover:bg-[#444] text-white text-xs font-bold rounded transition-colors cursor-pointer"
          >
            Add track or playlist
          </button>
          <button 
            onClick={handleSend}
            disabled={isSending || selectedRecipients.length === 0}
            className="px-8 py-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold rounded transition-colors cursor-pointer"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}
