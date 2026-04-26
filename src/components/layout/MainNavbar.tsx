import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { getMySubscription } from "@/services/api/upload/subscription.service";
import { useNotificationStore } from "@/stores/notification.store";
import {
  Bell,
  Mail,
  ChevronDown,
  MoreHorizontal,
  Menu,
  X,
  Search,
} from "lucide-react";
import { disconnectSocket } from "@/services/api/messaging/socketService";
import { usePlayerStore } from "@/stores/player.store";
import { audio } from "@/services/audioService";
import NotificationCard from "@/components/notificationsComponents/notificationCard";
import {
  fetchNotifications,
  type Notification,
} from "@/services/api/notifications/notificationsAPI";
import {
  fetchConversations,
  type Conversation,
} from "@/services/api/messaging/conversationApi";
import { ChatProfile } from "@/components/MessagingComponents/ChatProfile";
import { useMessagingStore } from "@/stores/messaging.store";
import UserAvatar from "@/components/UI/UserAvatar";
import SearchBar from "@/components/UI/SearchBar";

const MainNavbar = () => {
  const { user, logout, setUser } = useAuthStore();
  const resetPlayer = usePlayerStore((s) => s.reset);
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const {
    unreadCount: unreadMessages,
    fetchUnreadCount: fetchUnreadMessages,
    refreshUnreadCount: refreshUnreadMessages,
    setupSocketListeners,
  } = useMessagingStore();
  const navigate = useNavigate();

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const notifListRef = useRef<HTMLDivElement>(null);

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

  // ── Fetch last 9 notifications ───────────────────────────────────────────
  const handleNotificationsToggle = async () => {
    const willOpen = !showNotifications;
    closeAll();
    setShowNotifications(willOpen);

    if (!willOpen) return;

    setNotifications([]);
    setNotificationsLoading(true);

    try {
      const res = await fetchNotifications(1, 9);
      setNotifications(res.data.items ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMessagesToggle = async () => {
    const willOpen = !showMessages;
    closeAll();
    setShowMessages(willOpen);

    if (!willOpen) return;

    setConversationsLoading(true);
    try {
      const res = await fetchConversations(1, 6);
      setConversations((res.data.items ?? []).slice(0, 6));
    } catch {
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    getMySubscription()
      .then(({ data }) => {
        const isPro = data.user_subscription_id !== null;
        if (user.isPro !== isPro) setUser({ ...user, isPro });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadMessages();
  }, [fetchUnreadCount, fetchUnreadMessages]);

  // ── Set up the global unread-badge socket listener once on mount ─────────
  //
  // We intentionally do NOT tear it down on Navbar unmount — this listener
  // is global app-level state that must survive route changes.  Calling
  // teardownSocketListeners here would kill the listener for the lifetime
  // of the session whenever the user navigates away and back.
  useEffect(() => {
    setupSocketListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Poll every 30s + refresh on tab focus as fallback ───────────────────
  useEffect(() => {
    const poll = () => refreshUnreadMessages();
    const interval = setInterval(poll, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshUnreadMessages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        avatarRef.current &&
        !avatarRef.current.contains(target) &&
        notifRef.current &&
        !notifRef.current.contains(target) &&
        msgRef.current &&
        !msgRef.current.contains(target) &&
        moreRef.current &&
        !moreRef.current.contains(target)
      ) {
        closeAll();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    disconnectSocket();
    audio.pause();
    audio.src = "";
    resetPlayer();
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
    <nav className="sticky top-0 z-100 flex h-[50px] w-full items-center bg-bg">
      {/* Main navbar row */}
      <div className="container px-4 md:px-8 lg:px-12 xl:px-20 grid grid-cols-[auto_1fr_auto] items-center h-13">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            data-test="link-logo"
            to="/discover"
            className="flex items-center gap-1 text-4xl"
          >
            <i className="fa-brands fa-soundcloud text-text-hover" />
          </Link>

          {/* Nav links — tablet+ */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-6">
            <NavLink to="/discover" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/feed" className={navLinkClass}>
              Feed
            </NavLink>
            <NavLink to="/you/library" className={navLinkClass}>
              Library
            </NavLink>
          </div>
        </div>

        {/* Center: Search Bar — tablet+ */}
        <div className="hidden md:flex flex-1 justify-center">
          <SearchBar className="w-full max-w-[500px]" />
        </div>

        {/* Spacer — mobile only */}
        <div className="flex-1 md:hidden" />

        {/* Right: Actions — tablet+ */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4 shrink-0">
          {/* Text links — desktop only */}
          <Link
            to={user?.isPro ? "/subscriptions" : "/premium"}
            className="hidden lg:block text-accent text-md font-bold hover:text-text-hover transition-colors"
          >
            {user?.isPro ? "Manage Premium" : "Try Artist Pro"}
          </Link>
          <Link
            to="/artists"
            className="hidden lg:block text-text-secondary text-md mx-4 font-bold hover:text-text-hover transition-colors"
          >
            For Artists
          </Link>
          <Link
            data-test="link-upload"
            to="/upload"
            className="hidden lg:block text-text-secondary text-md me-4 font-bold hover:text-text-hover transition-colors"
          >
            Upload
          </Link>

          {/* Avatar + Dropdown */}
          <div ref={avatarRef} className="relative">
            <button
              data-test="btn-avatar-menu"
              onClick={() => toggle(setShowAvatarMenu)}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <UserAvatar
                src={user?.avatar}
                name={user?.displayName ?? user?.username ?? ""}
                alt={user?.displayName ?? user?.username ?? "User"}
                wrapperClassName="w-[30px] h-[30px] rounded-full overflow-hidden"
                initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-sm font-bold"
              />
              <ChevronDown
                size={25}
                className="mx-2 text-text-secondary hover:text-text-hover"
              />
            </button>

            {showAvatarMenu && (
              <div className="absolute right-0 top-full mt-2 w-[200px] bg-bg border border-border rounded-sm shadow-md py-1 z-50">
                <DropdownLink
                  icon="fa-solid fa-user"
                  label="Profile"
                  to={`/${user?.username}`}
                  onClick={closeAll}
                />
                <DropdownLink
                  icon="fa-solid fa-heart"
                  label="Likes"
                  to="/you/likes"
                  onClick={closeAll}
                />
                <DropdownLink
                  icon="fa-solid fa-list"
                  label="Playlists"
                  to="/you/sets"
                  onClick={closeAll}
                />
                <DropdownLink
                  icon="fa-solid fa-tower-broadcast"
                  label="Stations"
                  to="/you/stations"
                  onClick={closeAll}
                />
                <DropdownLink
                  icon="fa-solid fa-user-plus"
                  label="Following"
                  to="/you/following"
                  onClick={closeAll}
                />
                <DropdownLink
                  icon="fa-solid fa-users"
                  label="Who to follow"
                  to="/people"
                  onClick={closeAll}
                />
                <DropdownLink
                  icon="fa-solid fa-circle-plus"
                  label={user?.isPro ? "Manage Premium" : "Try Artist Pro"}
                  to={user?.isPro ? "/subscriptions" : "/premium"}
                  onClick={closeAll}
                  iconClassName="text-accent"
                />
                <DropdownLink
                  icon="fa-solid fa-chart-simple"
                  label="Tracks"
                  to={`/${user?.username}/tracks`}
                  onClick={closeAll}
                />
                <DropdownLink
                  icon="fa-solid fa-chart-line"
                  label="Insights"
                  to="/you/insights"
                  onClick={closeAll}
                />
                <DropdownLink
                  icon="fa-solid fa-arrow-up-from-bracket"
                  label="Distribute"
                  to="/artists/distribution"
                  onClick={closeAll}
                />
              </div>
            )}
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              data-test="btn-notifications"
              onClick={handleNotificationsToggle}
              className="relative text-text-secondary hover:text-text transition-colors"
            >
              <Bell size={22} className="hover:text-text-hover mt-2" />
              {unreadCount > 0 && (
                <span
                  data-test="notification-unread-badge"
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                data-test="notifications-dropdown"
                className="absolute right-0 top-full mt-2 w-[360px] bg-bg border border-border rounded-sm shadow-md z-50"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3
                    data-test="notifications-dropdown-title"
                    className="text-md font-medium text-text"
                  >
                    Notifications
                  </h3>
                  <Link
                    data-test="notifications-settings-link"
                    to="/settings/notifications"
                    className="text-xs text-text-secondary hover:text-text"
                    onClick={closeAll}
                  >
                    Settings
                  </Link>
                </div>

                {/* Scrollable list */}
                <div
                  data-test="notifications-dropdown-content"
                  ref={notifListRef}
                  className="py-2 max-h-[400px] overflow-y-auto"
                >
                  {notificationsLoading ? (
                    <div
                      data-test="notifications-dropdown-loading"
                      className="px-4 py-3 text-md text-text-muted text-center"
                    >
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div
                      data-test="notifications-dropdown-empty"
                      className="px-4 py-3 text-md text-text-muted text-center"
                    >
                      No new notifications
                    </div>
                  ) : (
                    <div
                      data-test="notifications-dropdown-list"
                      className="flex flex-col"
                    >
                      {notifications.map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          showActions={false as unknown as undefined}
                          data-test={`navbar-notification-card-${notification.id}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-border px-4 py-2">
                  <Link
                    data-test="notifications-view-all-link"
                    to="/notifications"
                    className="text-xs font-medium text-text hover:text-text-secondary block text-center"
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
            {/* FIX: added `relative` on the button itself so the badge is
                positioned relative to the button, not the outer div */}
            <button
              data-test="btn-messages"
              onClick={handleMessagesToggle}
              className="relative text-text-secondary hover:text-text transition-colors"
            >
              <Mail size={22} className="mt-2 hover:text-text-hover" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </button>

            {showMessages && (
              <div className="absolute right-0 top-full mt-2 w-[360px] bg-bg border border-border rounded-sm shadow-md z-50">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-md font-medium text-text">Messages</h3>
                </div>
                <div className="py-2 max-h-[300px] overflow-y-auto">
                  {conversationsLoading ? (
                    <div className="px-4 py-3 text-md text-text-muted text-center">
                      Loading messages...
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="px-4 py-3 text-md text-text-muted text-center">
                      No new messages
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {conversations.map((conversation) => (
                        <ChatProfile
                          key={conversation.id}
                          conversation={conversation}
                          onClick={() => {
                            navigate(`/messages/${conversation.id}`);
                            closeAll();
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-border px-4 py-2">
                  <Link
                    to="/messages"
                    className="text-xs font-medium text-text hover:text-text-secondary block text-center"
                    onClick={closeAll}
                  >
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
              <MoreHorizontal
                size={22}
                className="mt-2 hover:text-text-hover"
              />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-[200px] bg-bg border border-border rounded-sm shadow-md py-1 z-50 max-h-[400px] overflow-y-auto">
                <div className="lg:hidden">
                  <DropdownLink
                    label="Upload"
                    to="/upload"
                    onClick={closeAll}
                  />
                  <div className="border-t border-border my-1" />
                </div>
                <DropdownLink
                  label="About us"
                  to="/pages/contact"
                  onClick={closeAll}
                />
                <DropdownLink
                  label="Legal"
                  to="/terms-of-use"
                  onClick={closeAll}
                />
                <DropdownLink
                  label="Copyright"
                  to="/pages/copyright"
                  onClick={closeAll}
                />
                <DropdownLink
                  label="Mobile apps"
                  to="/download"
                  onClick={closeAll}
                />
                <DropdownLink
                  label="Artist Membership"
                  to="/premium"
                  onClick={closeAll}
                />
                <div className="border-t border-border my-1" />
                <DropdownLink
                  label="Keyboard shortcuts"
                  to="#"
                  onClick={closeAll}
                />
                <DropdownLink
                  label="Subscriptions"
                  to="/subscriptions"
                  onClick={closeAll}
                />
                <DropdownLink
                  label="Settings"
                  to="/settings"
                  onClick={closeAll}
                />
                <div className="border-t border-border my-1" />
                <button
                  data-test="btn-signout"
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
            data-test="btn-search-toggle"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            className="text-text-secondary hover:text-text transition-colors"
          >
            <Search size={22} />
          </button>
          <button
            data-test="btn-menu-toggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="text-text-secondary hover:text-text transition-colors"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile search row */}
      {isMobileSearchOpen && (
        <div className="flex md:hidden items-center px-4 py-2 border-t border-border">
          <SearchBar
            className="flex-1"
            autoFocus
            showClose
            onClose={() => setIsMobileSearchOpen(false)}
          />
        </div>
      )}

      {/* Mobile menu drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-bg border-t border-border">
          <NavLink
            to="/discover"
            className={mobileNavLinkClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/feed"
            className={mobileNavLinkClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Feed
          </NavLink>
          <NavLink
            to="/you/library"
            className={mobileNavLinkClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Library
          </NavLink>
          <div className="border-t border-border my-1" />
          <Link
            to={user?.isPro ? "/subscriptions" : "/premium"}
            className="block px-4 py-3 text-md font-medium text-accent hover:text-accent-hover transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {user?.isPro ? "Manage Premium" : "Try Artist Pro"}
          </Link>
          <Link
            to="/artists"
            className="block px-4 py-3 text-md font-medium text-text-secondary hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            For Artists
          </Link>
          <Link
            to="/upload"
            className="block px-4 py-3 text-md font-medium text-text-secondary hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Upload
          </Link>
          <div className="border-t border-border my-1" />
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-3 text-md font-medium text-text-secondary hover:text-white transition-colors"
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
    {icon && (
      <i
        className={`${icon} w-4 text-center text-base ${iconClassName ?? ""}`}
      />
    )}
    <span>{label}</span>
  </Link>
);

export default MainNavbar;