import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  globalSearch,
  startConversation,
} from "@/services/api/messaging/conversationApi";

interface ShareModalProps {
  url: string;
  onClose: () => void;
}

type Tab = "share" | "message";

type Recipient = {
  id: string;
  username: string;
  display_name: string;
  profile_picture: string | null;
  is_verified?: boolean;
  score?: number;
};

const ShareModal: React.FC<ShareModalProps> = ({ url, onClose }) => {
  const [shortened, setShortened] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("share");
  const [query, setQuery] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [isSearchingRecipients, setIsSearchingRecipients] = useState(false);
  const [messageBody, setMessageBody] = useState(`Check this out:\n${url}`);
  const [isSending, setIsSending] = useState(false);

  const displayUrl = shortened ? url.split("?")[0] : url;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    setMessageBody(`Check this out:\n${url}`);
  }, [url]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = query.trim();
      if (!q) {
        setRecipients([]);
        return;
      }

      setIsSearchingRecipients(true);
      globalSearch(q, { type: "users", limit: 10 })
        .then((res) => {
          const globalItems: Recipient[] = (res.data.users ?? []).map((user) => ({
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            profile_picture: user.profile_picture,
          }));

          const selectedIds = new Set(selectedRecipients.map((user) => user.id));
          setRecipients(globalItems.filter((user) => !selectedIds.has(user.id)));
        })
        .catch(() => setRecipients([]))
        .finally(() => setIsSearchingRecipients(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedRecipients]);

  const messagePreview = useMemo(() => messageBody.trim(), [messageBody]);

  const handleSend = async () => {
    if (selectedRecipients.length === 0) {
      toast.error("Please select a recipient");
      return;
    }

    if (!messagePreview) {
      toast.error("Please write a message");
      return;
    }

    setIsSending(true);
    try {
      await Promise.all(
        selectedRecipients.map((recipient) =>
          startConversation({
            recipient_id: recipient.id,
            body: messagePreview,
          }),
        ),
      );
      toast.success("Message sent successfully!");
      onClose();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

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
          className="cursor-pointer fixed top-3 right-3 text-bg text-lg hover:opacity-70 z-50 bg-bg-inverted rounded-full w-8 h-8 flex items-center justify-center mt-6 mr-6"
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
              className={`font-bold pb-3 border-b-2 ${
                activeTab === "share"
                  ? "text-bg-inverted border-bg-inverted"
                  : "text-text-secondary border-transparent hover:text-bg-inverted"
              }`}
            >
              Share
            </button>
            <button
              data-test="share-tab-message"
              onClick={() => setActiveTab("message")}
              className={`font-bold pb-3 border-b-2 ${
                activeTab === "message"
                  ? "text-bg-inverted border-bg-inverted"
                  : "text-text-secondary border-transparent hover:text-bg-inverted"
              }`}
            >
              Message
            </button>
          </div>

          {activeTab === "share" ? (
            <>
              <div className="flex gap-3 mb-6">
                {[
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
                ].map((s) => (
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
            <div data-test="message-tab-content" className="flex flex-col h-full">
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-bg-inverted">
                    To <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="flex flex-wrap gap-2 p-2 min-h-[40px] bg-input-bg border border-border rounded focus-within:border-text-hover transition-colors">
                      {selectedRecipients.map((recipient) => (
                        <span
                          key={recipient.id}
                          className="flex items-center gap-1 bg-bg-actionbutton text-bg-inverted text-[11px] px-2 py-0.5 rounded-full"
                        >
                          {recipient.display_name || recipient.username}
                          <button
                            onClick={() =>
                              setSelectedRecipients((prev) =>
                                prev.filter((item) => item.id !== recipient.id),
                              )
                            }
                            className="hover:text-red-400 cursor-pointer"
                          >
                            <i className="fa-solid fa-xmark text-[10px]" />
                          </button>
                        </span>
                      ))}
                      <input
                        data-test="message-recipient-input"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={selectedRecipients.length === 0 ? "Search for users" : ""}
                        className="flex-1 bg-transparent text-bg-inverted text-xs outline-none min-w-[120px] placeholder:text-text-secondary"
                      />
                    </div>
                    {(isSearchingRecipients || query.trim().length > 0) && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-bg border border-border rounded shadow-xl z-50 max-h-48 overflow-y-auto py-1">
                        {isSearchingRecipients ? (
                          <div className="px-3 py-4 text-center text-xs text-text-secondary">
                            Searching...
                          </div>
                        ) : recipients.length > 0 ? (
                          recipients.map((recipient) => (
                            <button
                              data-test={`message-recipient-option-${recipient.id}`}
                              key={recipient.id}
                              onClick={() => {
                                if (!selectedRecipients.find((item) => item.id === recipient.id)) {
                                  setSelectedRecipients([...selectedRecipients, recipient]);
                                }
                                setQuery("");
                                setRecipients([]);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-input-bg transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-input-bg overflow-hidden flex items-center justify-center">
                                {recipient.profile_picture ? (
                                  <img
                                    src={recipient.profile_picture}
                                    alt={recipient.display_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] font-bold text-bg-inverted">
                                    {(recipient.display_name || recipient.username || "U")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="text-left">
                                <p className="text-xs text-bg-inverted font-bold">
                                  {recipient.display_name || recipient.username}
                                </p>
                                <p className="text-[10px] text-text-secondary">
                                  @{recipient.username}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-xs text-text-secondary">
                            No users found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-bg-inverted">
                    Write your message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    data-test="message-body-input"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className="w-full h-32 bg-input-bg border border-border rounded p-3 text-xs text-bg-inverted resize-none outline-none focus:border-text-hover transition-colors placeholder:text-text-secondary"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 mt-6 border-t border-border">
                <div className="text-xs text-text-secondary">
                  {selectedRecipients.length === 0
                    ? "Select a recipient to send."
                    : `${selectedRecipients.length} recipient${selectedRecipients.length > 1 ? "s" : ""} selected`}
                </div>
                <button
                  data-test="message-send-button"
                  onClick={handleSend}
                  disabled={isSending || selectedRecipients.length === 0}
                  className="px-8 py-2 bg-bg-actionbutton text-bg-inverted hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold rounded transition-colors cursor-pointer"
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShareModal;
