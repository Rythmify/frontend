import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Bell, Mail, ChevronDown, MoreHorizontal, Menu, X, Search } from "lucide-react";

const MainNavbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const closeAll = () => {
    setShowAvatarMenu(false);
    setShowNotifications(false);
    setShowMessages(false);
    setShowMoreMenu(false);
  };

  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    closeAll();
    setter((prev) => !prev);
  };

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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-md font-bold px-1 py-1 border-b-2 transition-colors hover:text-text-hover ${
      isActive
        ? "text-text-hover border-text-hover"
        : "text-text-secondary border-transparent"
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 text-md font-bold transition-colors ${
      isActive ? "text-tex-hover" : "text-text-secondary hover:text-white"
    }`;

  return (
    <nav className="sticky top-1 z-50 flex h-[46px] w-full items-center bg-bg">

      {/* Main navbar row */}
      <div className="container grid grid-cols-[auto_1fr_auto] items-center h-13">

        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-6 shrink-0">
          <Link to="/discover" className="flex items-center gap-1 text-4xl">
            <i className="fa-brands fa-soundcloud text-text-hover" />
          </Link>

          {/* Nav links — tablet+ */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/discover" className={navLinkClass}>Home</NavLink>
            <NavLink to="/feed" className={navLinkClass}>Feed</NavLink>
            <NavLink to="/you/library" className={navLinkClass}>Library</NavLink>
          </div>
        </div>

        {/* Center: Search Bar — tablet+ */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="w-full max-w-[500px] relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-input-bg text-text text-md rounded-sm px-3 py-[6px] pr-9 border border-transparent focus:border-text-secondary outline-none placeholder:text-text-muted"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
              <i className="fa-solid fa-magnifying-glass text-base  font-bold" />

            </button>
          </div>
        </div>

        {/* Spacer — mobile only */}
        <div className="flex-1 md:hidden" />

        {/* Right: Actions — tablet+ */}
        <div className="hidden md:flex items-center gap-4 shrink-0">

          {/* Text links — desktop only */}
          <Link to="/creator/checkout" className="hidden lg:block text-accent text-md font-bold hover:text-accent-hover transition-colors">
            Try Artist Pro
          </Link>
          <Link to="/artists" className="hidden lg:block text-text-secondary text-md mx-4 font-bold hover:text-text transition-colors">
            For Artists
          </Link>
          <Link to="/upload" className="hidden lg:block text-text-secondary text-md me-4 font-bold hover:text-text transition-colors">
            Upload
          </Link>

          {/* Avatar + Dropdown */}
          <div ref={avatarRef} className="relative">
            <button
              onClick={() => toggle(setShowAvatarMenu)}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-[30px] h-[30px] rounded-full object-cover" />
              ) : (
                <div className="w-[30px] h-[30px] rounded-full bg-text-muted" />
              )}
              <ChevronDown
                size={25}
                className={`mx-2 text-text-secondary transition-transform ${showAvatarMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showAvatarMenu && (
              <div className="absolute right-0 top-full mt-2 w-[200px] bg-bg border border-border rounded-sm shadow-md py-1 z-50">
                <DropdownLink icon="fa-solid fa-user" label="Profile" to={`/${user?.username}`} onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-heart" label="Likes" to="/you/likes" onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-list" label="Playlists" to="/you/sets" onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-tower-broadcast" label="Stations" to="/you/stations" onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-user-plus" label="Following" to="/you/following" onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-users" label="Who to follow" to="/people" onClick={closeAll} />
                <DropdownLink icon="fa-solid fa-circle-plus" label="Try Artist Pro" to="/creator/checkout" onClick={closeAll} iconClassName="text-accent" />
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
              className="text-text-secondary hover:text-text transition-colors"
            >
              <Bell size={22} className="hover:text-text-hover mt-2" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-[360px] bg-bg border border-border rounded-sm shadow-md z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-md font-bold text-text">Notifications</h3>
                  <Link to="/settings/notifications" className="text-xs text-text-secondary hover:text-text" onClick={closeAll}>
                    Settings
                  </Link>
                </div>
                <div className="py-2 max-h-[300px] overflow-y-auto">
                  <div className="px-4 py-3 text-md text-text-muted text-center">No new notifications</div>
                </div>
                <div className="border-t border-border px-4 py-2">
                  <Link to="/notifications" className="text-xs font-bold text-text hover:text-text-secondary block text-center" onClick={closeAll}>
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
              <Mail size={22} className="mt-2" />
            </button>

            {showMessages && (
              <div className="absolute right-0 top-full mt-2 w-[360px] bg-bg border border-border rounded-sm shadow-md z-50">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-md font-bold text-text">Messages</h3>
                </div>
                <div className="py-2 max-h-[300px] overflow-y-auto">
                  <div className="px-4 py-3 text-md text-text-muted text-center">No new messages</div>
                </div>
                <div className="border-t border-border px-4 py-2">
                  <Link to="/messages" className="text-xs font-bold text-text hover:text-text-secondary block text-center" onClick={closeAll}>
                    View all messages
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* More Menu */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => toggle(setShowMoreMenu)}
              className="text-text-secondary hover:text-text transition-colors"
            >
              <MoreHorizontal size={22} className="mt-2" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-[200px] bg-bg border border-border rounded-sm shadow-md py-1 z-50 max-h-[400px] overflow-y-auto">
                <div className="lg:hidden">
                  <DropdownLink label="Upload" to="/upload" onClick={closeAll} />
                  <div className="border-t border-border my-1" />
                </div>
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
                  className="w-full text-left px-4 py-2 text-md text-text-hover hover:text-text-secondary transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: search icon + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            className="text-text-secondary hover:text-text transition-colors"
          >
            <Search size={22} />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="text-text-secondary hover:text-text transition-colors"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile search row */}
      {isMobileSearchOpen && (
        <div className="flex md:hidden items-center gap-2 px-4 py-2 border-t border-border">
          <div className="flex-1 relative">
            <input
              autoFocus
              type="text"
              placeholder="Search"
              className="w-full bg-input-bg text-text text-md rounded-sm px-3 py-[6px] pr-9 border border-transparent focus:border-text-secondary outline-none placeholder:text-text-muted"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
              <Search size={16} />
            </button>
          </div>
          <button onClick={() => setIsMobileSearchOpen(false)} className="text-text-secondary hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Mobile menu drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-bg border-t border-border">
          <NavLink to="/discover" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/feed" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Feed</NavLink>
          <NavLink to="/you/library" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Library</NavLink>
          <div className="border-t border-border my-1" />
          <Link to="/creator/checkout" className="block px-4 py-3 text-md font-bold text-accent hover:text-accent-hover transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            Try Artist Pro
          </Link>
          <Link to="/artists" className="block px-4 py-3 text-md font-bold text-text-secondary hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            For Artists
          </Link>
          <Link to="/upload" className="block px-4 py-3 text-md font-bold text-text-secondary hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            Upload
          </Link>
          <div className="border-t border-border my-1" />
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-3 text-md font-bold text-text-secondary hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      )}

    </nav>
  );
};

const DropdownLink = ({
  icon,
  iconClassName,
  label,
  to,
  onClick,
}: {
  icon?: string;
  iconClassName?: string;
  label: string;
  to: string;
  onClick: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2 text-md text-text-hover hover:text-text-secondary transition-colors"
  >
    {icon && <i className={`${icon} w-4 text-center text-base ${iconClassName ?? ""}`} />}
    <span>{label}</span>
  </Link>
);

export default MainNavbar;
