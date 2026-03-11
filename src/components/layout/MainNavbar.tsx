import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

const MainNavbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Dropdown states
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Refs for click outside
  const avatarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close all dropdowns
  const closeAll = () => {
    setShowAvatarMenu(false);
    setShowNotifications(false);
    setShowMessages(false);
    setShowMoreMenu(false);
  };

  // Toggle a specific dropdown, close others
  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    closeAll();
    setter((prev) => !prev);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        avatarRef.current && !avatarRef.current.contains(target) &&
        notifRef.current && !notifRef.current.contains(target) &&
        msgRef.current && !msgRef.current.contains(target) &&
        moreRef.current && !moreRef.current.contains(target)
      ) {
        closeAll();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate("/logout");
  };

  // Nav link style helper
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-1 py-1 border-b-2 transition-colors ${
      isActive
        ? "text-text border-text"
        : "text-text-secondary border-transparent hover:text-text"
    }`;

  return (
   <nav className="sticky top-0 z-50 bg-bg border-b border-border">
     <div className="w-full px-8 flex items-center justify-between h-[46px]">


        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/discover" className="flex items-center gap-1">
            <i className="fa-solid fa-wave-square text-accent text-xl" />
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            <NavLink to="/discover" className={navLinkClass}>Home</NavLink>
            <NavLink to="/feed" className={navLinkClass}>Feed</NavLink>
            <NavLink to="/you/library" className={navLinkClass}>Library</NavLink>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-[560px] mx-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-input-bg text-text text-sm rounded-sm px-3 py-[6px] pr-9 border border-transparent focus:border-border outline-none placeholder:text-text-muted"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
              <i className="fa-solid fa-magnifying-glass text-sm" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Try Artist Pro */}
          <Link
            to="/creator/checkout"
            className="text-accent text-sm font-medium hover:text-accent-hover transition-colors"
          >
            Try Artist Pro
          </Link>

          {/* For Artists */}
          <Link
            to="/artists"
            className="text-text-secondary text-sm font-medium hover:text-text transition-colors"
          >
            For Artists
          </Link>

          {/* Upload */}
          <Link
            to="/upload"
            className="text-text-secondary text-sm font-medium hover:text-text transition-colors"
          >
            Upload
          </Link>

          {/* Avatar + Dropdown */}
          <div ref={avatarRef} className="relative">
            <button
              onClick={() => toggle(setShowAvatarMenu)}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-[26px] h-[26px] rounded-full object-cover" />
              ) : (
                <div className="w-[26px] h-[26px] rounded-full bg-text-muted" />
              )}
              <i className={`fa-solid fa-chevron-down text-[10px] text-text-secondary transition-transform ${showAvatarMenu ? "rotate-180" : ""}`} />
            </button>

            {showAvatarMenu && (
              <div className="absolute right-0 top-full mt-2 w-[200px] bg-bg border border-border rounded-sm shadow-md py-1 z-50">
                <DropdownLink icon="fa-solid fa-user" label="Profile" to={`/${user?.username}`} onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-heart" label="Likes" to="/you/likes" onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-list" label="Playlists" to="/you/sets" onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-tower-broadcast" label="Stations" to="/you/stations" onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-user-plus" label="Following" to="/you/following" onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-users" label="Who to follow" to="/people" onClick={closeAll} />

                <div className="border-t border-border my-1" />

                <DropdownLink icon="fa-solid fa-circle-plus" label="Try Artist Pro" to="/creator/checkout" onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-chart-simple" label="Tracks" to={`/${user?.username}/tracks`} onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-chart-line" label="Insights" to="/you/insights" onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-arrow-up-from-bracket" label="Distribute" to="/artists/distribution" onClick={closeAll} />
              </div>
            )}
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => toggle(setShowNotifications)}
              className="text-text-secondary hover:text-text transition-colors relative"
            >
              <i className="fa-solid fa-bell text-lg" />
              {/* Notification badge - uncomment when notification count is available */}
              {/* <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full text-[8px] text-white flex items-center justify-center">3</span> */}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-[360px] bg-bg border border-border rounded-sm shadow-md z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-bold text-text">Notifications</h3>
                  <Link
                    to="/settings/notifications"
                    className="text-xs text-text-secondary hover:text-text"
                    onClick={closeAll}
                  >
                    Settings
                  </Link>
                </div>

                {/* Notification items - placeholder */}
                <div className="py-2 max-h-[300px] overflow-y-auto">
                  <div className="px-4 py-3 text-sm text-text-muted text-center">
                    No new notifications
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border px-4 py-2">
                  <Link
                    to="/notifications"
                    className="text-xs font-bold text-text hover:text-text-secondary block text-center"
                    onClick={closeAll}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={msgRef} className="relative">
            <button
              onClick={() => toggle(setShowMessages)}
              className="text-text-secondary hover:text-text transition-colors"
            >
              <i className="fa-solid fa-envelope text-lg" />
            </button>

            {showMessages && (
              <div className="absolute right-0 top-full mt-2 w-[360px] bg-bg border border-border rounded-sm shadow-md z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-bold text-text">Messages</h3>
                </div>

                {/* Message items - placeholder */}
                <div className="py-2 max-h-[300px] overflow-y-auto">
                  <div className="px-4 py-3 text-sm text-text-muted text-center">
                    No new messages
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border px-4 py-2">
                  <Link
                    to="/messages"
                    className="text-xs font-bold text-text hover:text-text-secondary block text-center"
                    onClick={closeAll}
                  >
                    View all messages
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* More Menu (three dots) */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => toggle(setShowMoreMenu)}
              className="text-text-secondary hover:text-text transition-colors"
            >
              <i className="fa-solid fa-ellipsis text-lg" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-[200px] bg-bg border border-border rounded-sm shadow-md py-1 z-50 max-h-[400px] overflow-y-auto">
                <DropdownLink label="About us" to="/pages/contact" onClick={closeAll} />
                <DropdownLink label="Legal" to="/terms-of-use" onClick={closeAll} />
                <DropdownLink label="Copyright" to="/pages/copyright" onClick={closeAll} />
                <DropdownLink label="Mobile apps" to="/download" onClick={closeAll} />
                <DropdownLink label="Artist Membership" to="/creator/checkout" onClick={closeAll} />

                <div className="border-t border-border my-1" />

                <DropdownLink label="Keyboard shortcuts" to="#" onClick={closeAll} />
                <DropdownLink label="Subscription" to="/settings" onClick={closeAll} />
                <DropdownLink label="Settings" to="/settings" onClick={closeAll} />

                <div className="border-t border-border my-1" />

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-input-bg hover:text-text transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Reusable dropdown link component
const DropdownLink = ({
  icon,
  label,
  to,
  onClick,
}: {
  icon?: string;
  label: string;
  to: string;
  onClick: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-input-bg hover:text-text transition-colors"
  >
    {icon && <i className={`${icon} w-4 text-center text-xs`} />}
    <span>{label}</span>
  </Link>
);

export default MainNavbar;
