import React, { useState, useEffect } from "react";

interface ShareModalProps {
  url: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ url, onClose }) => {
  const [shortened, setShortened] = useState(false);
  const [activeTab, setActiveTab] = useState<"share" | "message">("share");

  const displayUrl = shortened ? url.split("?")[0] : url;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const socials = [
    {
      icon: "fa-brands fa-twitter",
      bg: "#1DA1F2",
      href: `https://twitter.com/intent/tweet?url=${url}`,
      name: "twitter",
    },
    {
      icon: "fa-brands fa-facebook",
      bg: "#1877F2",
      href: `https://facebook.com/sharer/sharer.php?u=${url}`,
      name: "facebook",
    },
    {
      icon: "fa-brands fa-tumblr",
      bg: "#35465C",
      href: `https://tumblr.com/share/link?url=${url}`,
      name: "tumblr",
    },
    {
      icon: "fa-brands fa-pinterest",
      bg: "#E60023",
      href: `https://pinterest.com/pin/create/button/?url=${url}`,
      name: "pinterest",
    },
    {
      icon: "fa-solid fa-envelope",
      bg: "#555",
      href: `mailto:?body=${url}`,
      name: "email",
    },
  ];

  return (
    <>
      <div
        data-test="share-modal-overlay"
        className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-16"
        onClick={onClose}
      >
        <button
          data-test="share-modal-close"
          onClick={onClose}
          className="cursor-pointer fixed top-3 right-3 cursor-pointer text-bg text-lg hover:opacity-70 z-50 bg-bg-inverted rounded-full w-8 h-8 flex items-center justify-center mt-6 mr-6"
        >
          <i className="fa-solid fa-xmark" />
        </button>
        <div
          data-test="share-modal-content"
          className="bg-bg rounded-sm p-6 w-[570px] text-bg-inverted"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-6 mb-6">
            <button
              data-test="share-tab-share"
              onClick={() => setActiveTab("share")}
              className={`font-bold pb-3 border-b-2 ${activeTab === "share" ? "text-bg-inverted border-bg-inverted" : "text-text-secondary border-transparent hover:text-bg-inverted"}`}
            >
              Share
            </button>
            <button
              data-test="share-tab-message"
              onClick={() => setActiveTab("message")}
              className={`font-bold pb-3 border-b-2 ${activeTab === "message" ? "text-bg-inverted border-bg-inverted" : "text-text-secondary border-transparent hover:text-bg-inverted"}`}
            >
              Message
            </button>
          </div>

          {activeTab === "share" ? (
            <>
              <div className="flex gap-3 mb-6">
                {socials.map((s) => (
                  <a
                    key={s.icon}
                  data-test={`share-social-${s.name}`}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl hover:opacity-80"
                  style={{ backgroundColor: s.bg }}
                >
                  <i className={s.icon} />
                </a>
              ))}
            </div>
            <div
              data-test="share-url-display"
              className="bg-input-bg rounded px-3 py-2 text-sm text-bg-inverted text-left truncate mb-3"
            >
              {displayUrl}
            </div>
              <label className="flex items-center gap-2 text-sm text-bg-inverted cursor-pointer">
              <input
                data-test="share-shorten-checkbox"
                type="checkbox"
                checked={shortened}
                onChange={(e) => setShortened(e.target.checked)}
                  className="w-4 h-4"
                />
                Shorten link
              </label>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-sm text-left text-bg-inverted">
                  To <span className="text-red-500">*</span>
                </label>
                <input
                  data-test="message-to-input"
                  type="text"
                  className="bg-input-bg rounded px-3 py-2 text-sm text-bg-inverted outline-none border border-transparent focus:border-text-hover"
                />
              </div>
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-sm text-left text-bg-inverted">
                  Write your message and add tracks or playlists{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  data-test="message-body-input"
                  className="bg-input-bg rounded px-3 py-2 text-sm text-bg-inverted outline-none border border-transparent focus:border-text-hover h-32 resize-none"
                  defaultValue={url}
                />
              </div>
              <div className="flex justify-end">
                <button
                  data-test="message-send-button"
                  className="px-3 py-2 bg-bg text-bg-inverted font-bold text-sm rounded hover:opacity-80"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ShareModal;
