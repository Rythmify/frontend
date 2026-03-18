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
    },
    {
      icon: "fa-brands fa-facebook",
      bg: "#1877F2",
      href: `https://facebook.com/sharer/sharer.php?u=${url}`,
    },
    {
      icon: "fa-brands fa-tumblr",
      bg: "#35465C",
      href: `https://tumblr.com/share/link?url=${url}`,
    },
    {
      icon: "fa-brands fa-pinterest",
      bg: "#E60023",
      href: `https://pinterest.com/pin/create/button/?url=${url}`,
    },
    { icon: "fa-solid fa-envelope", bg: "#555", href: `mailto:?body=${url}` },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-white/50 flex items-start justify-center z-50 pt-16"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="cursor-pointer fixed top-3 right-3 cursor-pointer text-white text-lg hover:opacity-70 z-50 bg-gray-900 rounded-full w-8 h-8 flex items-center justify-center mt-6 mr-6"
        >
          <i className="fa-solid fa-xmark" />
        </button>
        <div
          className="bg-[#1a1a1a] rounded-sm p-6 w-[570px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-6  mb-6">
            <button
              onClick={() => setActiveTab("share")}
              className={`font-bold pb-3 border-b-2 ${activeTab === "share" ? "text-white border-white" : "text-text-secondary border-transparent hover:text-white"}`}
            >
              Share
            </button>
            <button
              onClick={() => setActiveTab("message")}
              className={`font-bold pb-3 border-b-2 ${activeTab === "message" ? "text-white border-white" : "text-text-secondary border-transparent hover:text-white"}`}
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
              <div className="bg-[#333] rounded px-3 py-2 text-sm text-white text-left truncate mb-3">
                {displayUrl}
              </div>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input
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
                <label className="text-sm text-left text-white">
                  To <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="bg-[#333] rounded px-3 py-2 text-sm text-white outline-none border border-transparent focus:border-white"
                />
              </div>
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-sm text-left text-white">
                  Write your message and add tracks or playlists{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="bg-[#333] rounded px-3 py-2 text-sm text-white outline-none border border-transparent focus:border-white h-32 resize-none"
                  defaultValue={url}
                />
              </div>
              <div className="flex justify-end">
                <button className="px-3 py-2 bg-white text-black font-bold text-sm rounded hover:bg-gray-200">
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
