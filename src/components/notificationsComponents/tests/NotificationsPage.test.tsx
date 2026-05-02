import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Notification } from "@/services/api/notifications/notificationsAPI";

const mockFetchUnreadCount = vi.hoisted(() => vi.fn());
const mockRefreshUnreadCount = vi.hoisted(() => vi.fn());
type SocketHandler = (...args: unknown[]) => void;

const socketHandlers = vi.hoisted(() => new Map<string, SocketHandler>());
const mockSocket = vi.hoisted(() => ({
  on: vi.fn((event: string, cb: SocketHandler) => socketHandlers.set(event, cb)),
  off: vi.fn((event: string) => socketHandlers.delete(event)),
}));

vi.mock("@/services/api/notifications/notificationsAPI", () => ({
  fetchNotifications: vi.fn(),
  fetchMyFollowing: vi.fn(),
}));

vi.mock("@/stores/notification.store", () => ({
  useNotificationStore: () => ({
    fetchUnreadCount: mockFetchUnreadCount,
    refreshUnreadCount: mockRefreshUnreadCount,
  }),
}));

vi.mock("@/services/api/messaging/socketService", () => ({
  getSocket: vi.fn(() => mockSocket),
}));

vi.mock("@/components/UI/Spinner", () => ({
  default: (props: any) => <div data-test={props["data-test"] ?? "spinner"}>Loading</div>,
}));

vi.mock("@/components/UI/ArtistListSection", () => ({
  default: ({ title, artists, viewAllLink, maxDisplay }: any) => (
    <aside data-test="artist-list" data-count={artists.length} data-link={viewAllLink} data-max={maxDisplay}>
      {title}
    </aside>
  ),
}));

vi.mock("@/components/UI/GoMobile", () => ({
  default: () => <div data-test="go-mobile" />,
}));

vi.mock("@/components/notificationsComponents/notificationCard", () => ({
  default: ({ notification, onMarkRead }: any) => (
    <button data-test={`notification-card-${notification.id}`} onClick={() => onMarkRead(notification.id)}>
      {notification.actor.display_name}:{String(notification.is_read)}
    </button>
  ),
}));

import NotificationsPage from "@/pages/social/notifications/NotificationsPage";
import { fetchNotifications, fetchMyFollowing } from "@/services/api/notifications/notificationsAPI";
import { getSocket } from "@/services/api/messaging/socketService";

const mockFetchNotifications = fetchNotifications as ReturnType<typeof vi.fn>;
const mockFetchMyFollowing = fetchMyFollowing as ReturnType<typeof vi.fn>;
const mockGetSocket = getSocket as ReturnType<typeof vi.fn>;

function notification(id: string, is_read = false): Notification {
  return {
    id,
    type: "like",
    actor: { id: `u-${id}`, username: `user-${id}`, display_name: `User ${id}`, avatar: null },
    resource_type: "track",
    resource_id: `track-${id}`,
    resource_details: { title: `Track ${id}` },
    is_read,
    created_at: new Date().toISOString(),
  };
}

function list(items: Notification[], has_next = false) {
  return {
    success: true,
    data: {
      items,
      pagination: {
        page: 1,
        per_page: 20,
        total_items: items.length,
        total_pages: 1,
        has_next,
        has_prev: false,
      },
    },
  };
}

function following(items = [{ id: "f1", username: "fan", profile_picture: "fan.png", is_verified: true }]) {
  return {
    success: true,
    data: {
      items: items.map((u) => ({ display_name: u.username, ...u })),
      pagination: { page: 1, per_page: 4, total_items: items.length, total_pages: 1, has_next: false, has_prev: false },
    },
  };
}

function installIntersectionObserver() {
  const observers: IntersectionObserverCallback[] = [];
  const disconnect = vi.fn();
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: vi.fn(function (this: IntersectionObserver, cb: IntersectionObserverCallback) {
      return {
        observe: vi.fn(() => observers.push(cb)),
        disconnect,
      };
    }),
  });
  return { observers, disconnect };
}

describe("social NotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socketHandlers.clear();
    installIntersectionObserver();
    mockFetchNotifications.mockResolvedValue(list([notification("n1")]));
    mockFetchMyFollowing.mockResolvedValue(following());
    mockFetchUnreadCount.mockResolvedValue(undefined);
    mockRefreshUnreadCount.mockResolvedValue(undefined);
    mockGetSocket.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads notifications, sidebar followers, unread count, and socket listener", async () => {
    render(<NotificationsPage />);

    expect(screen.getByTestId("notifications-loading")).toBeInTheDocument();
    expect(await screen.findByTestId("notification-card-n1")).toBeInTheDocument();
    expect(screen.getByTestId("artist-list")).toHaveAttribute("data-count", "1");
    expect(screen.getByTestId("go-mobile")).toBeInTheDocument();
    expect(mockFetchNotifications).toHaveBeenCalledWith(1, 20, undefined);
    expect(mockFetchMyFollowing).toHaveBeenCalledWith(undefined, 4, 0);
    expect(mockFetchUnreadCount).toHaveBeenCalled();
    expect(mockSocket.on).toHaveBeenCalledWith("notification:created", expect.any(Function));
  });

  it("renders empty and error states", async () => {
    mockFetchNotifications.mockResolvedValueOnce(list([]));
    const { unmount } = render(<NotificationsPage />);
    expect(await screen.findByTestId("notifications-empty")).toHaveTextContent("You don't have any notifications");
    unmount();

    mockFetchNotifications.mockRejectedValueOnce(new Error("network"));
    render(<NotificationsPage />);
    expect(await screen.findByTestId("notifications-error")).toHaveTextContent("Something went wrong.");
  });

  it("changes filters and ignores selecting the active filter", async () => {
    const user = userEvent.setup();
    render(<NotificationsPage />);

    await screen.findByTestId("notification-card-n1");
    await user.click(screen.getByTestId("notification-filter-btn"));
    await user.click(screen.getByTestId("notification-filter-option-all"));
    expect(mockFetchNotifications).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTestId("notification-filter-btn"));
    await user.click(screen.getByTestId("notification-filter-option-follow"));

    await waitFor(() => expect(mockFetchNotifications).toHaveBeenCalledWith(1, 20, "follow"));
  });

  it("marks a notification as read in local state and refreshes unread count", async () => {
    const user = userEvent.setup();
    render(<NotificationsPage />);

    await user.click(await screen.findByTestId("notification-card-n1"));

    expect(mockFetchUnreadCount).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("notification-card-n1")).toHaveTextContent("true");
  });

  it("loads more notifications when the sentinel intersects", async () => {
    const io = installIntersectionObserver();
    mockFetchNotifications
      .mockResolvedValueOnce(list([notification("n1")], true))
      .mockResolvedValueOnce(list([notification("n2")], false));

    render(<NotificationsPage />);
    await screen.findByTestId("notification-card-n1");

    act(() => {
      io.observers.forEach((cb) =>
        cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
      );
    });

    expect(await screen.findByTestId("notification-card-n2")).toBeInTheDocument();
    expect(mockFetchNotifications).toHaveBeenLastCalledWith(2, 20, undefined);
  });

  it("silently handles sidebar, load-more, and socket edge cases", async () => {
    const io = installIntersectionObserver();
    mockFetchMyFollowing.mockRejectedValueOnce(new Error("sidebar"));
    mockFetchNotifications
      .mockResolvedValueOnce(list([notification("n1")], true))
      .mockRejectedValueOnce(new Error("more failed"))
      .mockResolvedValueOnce(list([notification("fresh")], false));

    const { unmount } = render(<NotificationsPage />);
    await screen.findByTestId("notification-card-n1");

    act(() => {
      io.observers.forEach((cb) =>
        cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
      );
    });
    await waitFor(() => expect(mockFetchNotifications).toHaveBeenCalledTimes(2));
    expect(screen.queryByTestId("notification-card-fresh")).not.toBeInTheDocument();

    await act(async () => {
      socketHandlers.get("notification:created")?.();
    });

    expect(await screen.findByTestId("notification-card-fresh")).toBeInTheDocument();
    expect(mockRefreshUnreadCount).toHaveBeenCalled();

    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith("notification:created", expect.any(Function));
  });

  it("works without a socket", async () => {
    mockGetSocket.mockReturnValueOnce(null);
    render(<NotificationsPage />);

    expect(await screen.findByTestId("notification-card-n1")).toBeInTheDocument();
    expect(mockSocket.on).not.toHaveBeenCalled();
  });
});
