import React from "react";

interface TabButtonProps {
  children: React.ReactNode;
  onSelect: () => void;
  isSelected: boolean;
}

function TabButton({ children, onSelect, isSelected }: TabButtonProps) {
  return (
    <button
      onClick={onSelect}
      className={`pb-2.5 pt-3 px-1.5 text-sm transition-colors border-b-[2px] ${
        isSelected
          ? "text-black font-extrabold border-black"
          : "font-extrabold border-transparent text-text-secondary hover:text-black"
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
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  isOwner = false,
  onTabChange,
  selectedTab = "All",
}) => {
  return (
    <div className="flex items-center justify-between px-6 ">
      <div className="flex items-center gap-3 ">
        {tabs.map((tab) => (
          <TabButton
            key={tab.label}
            isSelected={selectedTab === tab.label}
            onSelect={() => onTabChange?.(tab.label)}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>

      {isOwner && (
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-black">
            <i className="fa-solid fa-arrow-up-from-bracket text-xs" />
            Share
          </button>
          <button className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-black">
            <i className="fa-solid fa-pen text-xs" />
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileTabs;
