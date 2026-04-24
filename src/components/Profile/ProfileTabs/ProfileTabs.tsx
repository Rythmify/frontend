import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalNewMessageBody from "@/pages/social/messages/ModalNewMessageBody";
import { Modal } from "@/components/MessagingComponents/Modal";
import type { RecipientResult } from "@/components/MessagingComponents/RecipientInputBox";
import FollowButton from "@/components/UI/FollowButton";

interface TabButtonProps {
  children: React.ReactNode;
  onSelect: () => void;
  isSelected: boolean;
  "data-test"?: string;
}

function TabButton({
  children,
  onSelect,
  isSelected,
  "data-test": dataTest,
}: TabButtonProps) {
  return (
    <button
      data-test={dataTest}
      onClick={onSelect}
      className={`cursor-pointer pb-2.5 pt-3 px-1.5 text-sm transition-colors border-b-[2px] ${
        isSelected
          ? "text-white font-bold border-white"
          : "font-semibold border-transparent text-[#858687] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

const tabs = [
  { label: "All" },
  { label: "Popular tracks" },
  { label: "Tracks" },
  { label: "Albums" },
  { label: "Playlists" },
  { label: "Reposts" },
];

interface ProfileTabsProps {
  isOwner?: boolean;
  onTabChange?: (tab: string) => void;
  selectedTab?: string;
  onShare?: () => void;
  onEdit?: () => void;
  onBlock?: () => void;
  blockDisabled?: boolean;
  username?: string;
  displayName?: string;
  userId?: string;
  profilePicture?: string | null;
  tracks?: number;
  extraActions?: React.ReactNode;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  isOwner = false,
  onTabChange,
  selectedTab = "All",
  onShare,
  onEdit,
  onBlock,
  blockDisabled = false,
  username = "",
  displayName = "",
  userId = "",
  profilePicture = null,
  tracks = 0,
  extraActions,
}) => {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Build the prefilled recipient from profile data
  const prefilledRecipient: RecipientResult = {
    id: userId,
    username,
    display_name: displayName,
    profile_picture: profilePicture,
  };

  return (
    <div className="flex justify-between px-0.5 relative">
      <div className="flex items-center gap-3">
        {tabs.map((tab) => (
          <TabButton
            key={tab.label}
            isSelected={selectedTab === tab.label}
            onSelect={() => onTabChange?.(tab.label)}
            data-test={`tab-${tab.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>

      {isOwner ? (
        <div className="flex items-center gap-3">
          <button
            data-test="share-button"
            onClick={onShare}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.25 bg-[#313030] rounded text-sm font-bold text-white hover:text-[#737272] transition-colors"
          >
            <i className="fa-solid fa-arrow-up-from-bracket" />
            Share
          </button>
          <button
            data-test="edit-button"
            onClick={onEdit}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.25 bg-[#313030] rounded text-sm font-bold text-white hover:text-[#737272] transition-colors"
          >
            <i className="fa-solid fa-pencil" />
            Edit
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {tracks > 0 && (
            <button
              data-test="station-button"
              onClick={() => {
                const stationSlug = (displayName || username)
                  .toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/-+/g, "-");
                navigate(`/discover/stations/${stationSlug}:${userId}`);
              }}
              className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-[#313030] rounded text-sm font-bold text-white hover:text-[#737272] transition-colors"
            >
              <i className="fa-solid fa-tower-broadcast" />
              Station
            </button>
          )}

          <FollowButton username={username} userId={userId} />

          <button
            data-test="share-button"
            onClick={onShare}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-[#313030] rounded text-sm font-bold text-white hover:text-[#737272] transition-colors"
          >
            <i className="fa-solid fa-arrow-up-from-bracket" />
            Share
          </button>

          <button
            data-test="message-button"
            className="cursor-pointer flex items-center justify-center w-9 h-9 bg-[#313030] rounded text-white hover:text-[#737272] transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <i className="fa-solid fa-envelope" />
          </button>

          {/* Modal with prefilled recipient */}
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalNewMessageBody
              onClose={() => setIsOpen(false)}
              prefilledRecipient={prefilledRecipient}
            />
          </Modal>

          <div className="relative">
            <button
              data-test="more-button"
              onClick={() => setShowMore((p) => !p)}
              className="cursor-pointer flex items-center justify-center w-9 h-9 bg-[#313030] rounded text-white hover:text-[#737272] transition-colors"
            >
              <i className="fa-solid fa-ellipsis" />
            </button>

            {showMore && (
              <div className="absolute right-0 top-11 z-50 bg-[#1a1a1a] border border-border rounded shadow-lg w-52 py-1">
                {extraActions ? (
                  <div className="px-2 py-1">{extraActions}</div>
                ) : (
                  <button
                    data-test="block-button"
                    onClick={onBlock}
                    disabled={blockDisabled}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    <i className="fa-solid fa-ban text-xs w-4" />
                    Block {displayName || username}
                  </button>
                )}
                <button
                  data-test="report-button"
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <i className="fa-solid fa-circle-exclamation text-xs w-4" />
                  Report {displayName || username}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTabs;
