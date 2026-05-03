import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { Notification } from "@/services/api/notifications/notificationsAPI";

const mockNavigate = vi.hoisted(() => vi.fn());
const mockMarkOneAsRead = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/services/api/notifications/notificationsAPI", () => ({
  fetchFollowStatus: vi.fn(),
  markNotificationRead: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({ user: { id: "me" } }),
}));

vi.mock("@/stores/notification.store", () => ({
  useNotificationStore: () => ({ markOneAsRead: mockMarkOneAsRead }),
}));

vi.mock("@/components/UI/FollowButton", () => ({
  default: ({ username, userId, initialIsFollowing }: any) => (
    <button
      data-test="follow-button"
      data-username={username}
      data-userid={userId}
      data-following={String(initialIsFollowing)}
    >
      Follow
    </button>
  ),
}));

vi.mock("@/components/UI/UserAvatar", () => ({
  default: ({ src, name, alt, imageDataTest, fallbackDataTest }: any) => (
    <div
      data-test="user-avatar"
      data-src={src ?? ""}
      data-name={name}
      data-alt={alt}
      data-image-test={imageDataTest}
      data-fallback-test={fallbackDataTest}
    />
  ),
}));

vi.mock("@/components/UI/Modal", () => ({
  Modal: ({ isOpen, onClose, children }: any) => (
    isOpen ? (
      <div data-test="modal">
        <button data-test="modal-close" onClick={onClose}>modal close</button>
        {children}
      </div>
    ) : null
  ),
}));

vi.mock("@/components/UI/BlockModal", () => ({
  BlockUserModal: ({ userId, username, onClose, onBlocked }: any) => (
    <div data-test="block-modal" data-userid={userId} data-username={username}>
      <button data-test="block-close" onClick={onClose}>close</button>
      <button data-test="block-confirm" onClick={onBlocked}>block</button>
    </div>
  ),
}));

vi.mock("@/components/UI/ReportModal", () => ({
  ReportModal: ({ userId, username, onClose, onSpamSelected }: any) => (
    <div data-test="report-modal" data-userid={userId} data-username={username}>
      <button data-test="report-close" onClick={onClose}>close</button>
      <button data-test="report-spam" onClick={onSpamSelected}>spam</button>
    </div>
  ),
}));

vi.mock("@/components/UI/SpamModal", () => ({
  SpamModal: ({ userId, username, onClose }: any) => (
    <div data-test="spam-modal" data-userid={userId} data-username={username}>
      <button data-test="spam-close" onClick={onClose}>close</button>
    </div>
  ),
}));

import NotificationCard from "@/components/notificationsComponents/notificationCard";
import { fetchFollowStatus } from "@/services/api/notifications/notificationsAPI";

const mockFetchFollowStatus = fetchFollowStatus as ReturnType<typeof vi.fn>;

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "n1",
    type: "follow",
    actor: {
      id: "u1",
      username: "alice",
      display_name: "Alice",
      avatar: "avatar.png",
    },
    resource_type: "track",
    resource_id: "track-1",
    resource_details: { title: "Blue Song", content: "Nice!" },
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60_000).toISOString(),
    ...overrides,
  };
}

function renderCard(n = notification(), props: Partial<React.ComponentProps<typeof NotificationCard>> = {}) {
  return render(
    <MemoryRouter>
      <NotificationCard notification={n} {...props} />
    </MemoryRouter>,
  );
}

describe("NotificationCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-05-01T12:00:00.000Z").getTime());
    mockFetchFollowStatus.mockResolvedValue({
      data: {
        is_following: true,
        is_followed_by: false,
        is_blocking: false,
        is_blocked_by: false,
      },
    });
    mockMarkOneAsRead.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders actor avatar, name, unread marker, action text, and relative time", async () => {
    renderCard(notification({ created_at: new Date(Date.now() - 5 * 60_000).toISOString() }));

    expect(screen.getByTestId("notification-card-n1")).toBeInTheDocument();
    expect(screen.getByTestId("notification-username-n1")).toHaveTextContent("Alice");
    expect(screen.getByTestId("notification-action-text-n1")).toHaveTextContent("started following you");
    expect(screen.getByTestId("notification-time-n1")).toHaveTextContent("5 minutes ago");
    expect(screen.getByTestId("user-avatar")).toHaveAttribute("data-src", "avatar.png");
    expect(await screen.findByTestId("follow-button")).toHaveAttribute("data-following", "true");
  });

  it.each([
    ["like", "liked your track \"Blue Song\""],
    ["repost", "reposted your track \"Blue Song\""],
    ["comment", "commented \"Nice!\" on your track"],
    ["new_post_by_followed", "posted a new track"],
  ] as Array<[Notification["type"], string]>)("renders %s notification text", (type, text) => {
    renderCard(notification({ type }));
    expect(screen.getByTestId("notification-action-text-n1")).toHaveTextContent(text);
  });

  it.each([
    [30_000, "just now"],
    [2 * 60 * 60_000, "2 hours ago"],
    [2 * 24 * 60 * 60_000, "2 days ago"],
  ])("formats a %s ms old notification as %s", (age, text) => {
    renderCard(notification({ created_at: new Date(Date.now() - age).toISOString() }));
    expect(screen.getByTestId("notification-time-n1")).toHaveTextContent(text);
  });

  it("marks unread notifications as read and navigates to a follower profile", async () => {
    const onMarkRead = vi.fn();
    const user = userEvent.setup();
    renderCard(notification(), { onMarkRead });

    await user.click(screen.getByTestId("notification-card-n1"));

    expect(mockMarkOneAsRead).toHaveBeenCalledWith("n1");
    expect(onMarkRead).toHaveBeenCalledWith("n1");
    expect(mockNavigate).toHaveBeenCalledWith("/alice");
  });

  it("still navigates if marking as read fails", async () => {
    const user = userEvent.setup();
    mockMarkOneAsRead.mockRejectedValueOnce(new Error("nope"));
    renderCard(notification({ type: "like", resource_type: "track", resource_id: "t99" }));

    await user.click(screen.getByTestId("notification-card-n1"));

    expect(mockNavigate).toHaveBeenCalledWith("/track/t99");
  });

  it("navigates playlist notifications to the actor sets page and skips read calls when already read", async () => {
    const user = userEvent.setup();
    renderCard(notification({ is_read: true, type: "like", resource_type: "playlist", resource_id: "p1" }));

    await user.click(screen.getByTestId("notification-card-n1"));

    expect(mockMarkOneAsRead).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/alice/sets/p1");
  });

  it("opens block, report, spam, and close flows from the menu", async () => {
    const user = userEvent.setup();
    renderCard(notification());

    await user.click(screen.getByTestId("notification-menu-btn-n1"));
    await waitFor(() => expect(screen.getByTestId("notification-block-btn-n1")).not.toBeDisabled());
    await user.click(screen.getByTestId("notification-block-btn-n1"));
    expect(screen.getByTestId("block-modal")).toBeInTheDocument();

    await user.click(screen.getByTestId("block-confirm"));
    expect(screen.queryByTestId("block-modal")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("notification-menu-btn-n1"));
    await user.click(screen.getByTestId("notification-report-btn-n1"));
    expect(screen.getByTestId("report-modal")).toBeInTheDocument();

    await user.click(screen.getByTestId("report-spam"));
    expect(screen.queryByTestId("report-modal")).not.toBeInTheDocument();
    expect(screen.getByTestId("spam-modal")).toBeInTheDocument();
  });

  it("closes each modal from its own close callback", async () => {
    const user = userEvent.setup();
    renderCard(notification());

    await user.click(screen.getByTestId("notification-menu-btn-n1"));
    await waitFor(() => expect(screen.getByTestId("notification-block-btn-n1")).not.toBeDisabled());
    await user.click(screen.getByTestId("notification-block-btn-n1"));
    expect(screen.getByTestId("block-modal")).toBeInTheDocument();
    await user.click(screen.getByTestId("block-close"));
    expect(screen.queryByTestId("block-modal")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("notification-menu-btn-n1"));
    await user.click(screen.getByTestId("notification-report-btn-n1"));
    expect(screen.getByTestId("report-modal")).toBeInTheDocument();
    await user.click(screen.getByTestId("report-close"));
    expect(screen.queryByTestId("report-modal")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("notification-menu-btn-n1"));
    await user.click(screen.getByTestId("notification-report-btn-n1"));
    await user.click(screen.getByTestId("report-spam"));
    expect(screen.getByTestId("spam-modal")).toBeInTheDocument();
    await user.click(screen.getByTestId("spam-close"));
    expect(screen.queryByTestId("spam-modal")).not.toBeInTheDocument();
  });

  it("closes each modal from the shared modal onClose callback", async () => {
    const user = userEvent.setup();
    renderCard(notification());

    await user.click(screen.getByTestId("notification-menu-btn-n1"));
    await waitFor(() => expect(screen.getByTestId("notification-block-btn-n1")).not.toBeDisabled());
    await user.click(screen.getByTestId("notification-block-btn-n1"));
    await user.click(screen.getByTestId("modal-close"));
    expect(screen.queryByTestId("block-modal")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("notification-menu-btn-n1"));
    await user.click(screen.getByTestId("notification-report-btn-n1"));
    await user.click(screen.getByTestId("modal-close"));
    expect(screen.queryByTestId("report-modal")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("notification-menu-btn-n1"));
    await user.click(screen.getByTestId("notification-report-btn-n1"));
    await user.click(screen.getByTestId("report-spam"));
    await user.click(screen.getByTestId("modal-close"));
    expect(screen.queryByTestId("spam-modal")).not.toBeInTheDocument();
  });

  it("uses fallback resource text when title and content are missing", () => {
    renderCard(notification({
      type: "comment",
      resource_type: null,
      resource_id: "fallback-id",
      resource_details: null,
    }));

    expect(screen.getByTestId("notification-action-text-n1")).toHaveTextContent('commented "" on your track');
  });

  it("renders empty action text for unknown notification types", () => {
    renderCard(notification({ type: "mystery" as Notification["type"] }));
    expect(screen.getByTestId("notification-action-text-n1")).toHaveTextContent("");
  });

  it("unblocks directly when the actor is already blocked", async () => {
    const user = userEvent.setup();
    mockFetchFollowStatus.mockResolvedValueOnce({
      data: {
        is_following: false,
        is_followed_by: false,
        is_blocking: true,
        is_blocked_by: false,
      },
    });

    renderCard(notification());

    await user.click(screen.getByTestId("notification-menu-btn-n1"));
    await waitFor(() => expect(screen.getByTestId("notification-block-btn-n1")).toHaveTextContent("Unblock Alice"));
    await user.click(screen.getByTestId("notification-block-btn-n1"));

    await user.click(screen.getByTestId("notification-menu-btn-n1"));
    expect(screen.getByTestId("notification-block-btn-n1")).toHaveTextContent("Block Alice");
  });

  it("hides actions when showActions is false and handles follow-status failure", async () => {
    mockFetchFollowStatus.mockRejectedValueOnce(new Error("nope"));
    renderCard(notification(), { showActions: false });

    expect(screen.queryByTestId("notification-menu-btn-n1")).not.toBeInTheDocument();
    expect(await screen.findByTestId("follow-button")).toHaveAttribute("data-following", "false");
  });

  it("does not fetch follow status when the actor has no id", () => {
    renderCard(notification({ actor: { id: "", username: "ghost", display_name: "Ghost", avatar: null } }));
    expect(mockFetchFollowStatus).not.toHaveBeenCalled();
  });
});
