import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConversationHeader from "@/components/MessagingComponents/ConversationHeader";
import {
  fetchFollowStatus,
  markMessageReadState,
  unblockUser,
} from "@/services/api/messaging/conversationApi";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/services/api/messaging/conversationApi", () => ({
  fetchFollowStatus: vi.fn(),
  markMessageReadState: vi.fn(),
  unblockUser: vi.fn(),
}));

vi.mock("@/components/MessagingComponents/DeleteConversationButton", () => ({
  default: ({ conversationId, participantId, onDeleted }: any) => (
    <button data-test="delete-conversation-button" data-participant={participantId} onClick={() => onDeleted?.(conversationId)}>
      Delete
    </button>
  ),
}));

vi.mock("@/components/MessagingComponents/Modal", () => ({
  Modal: ({ isOpen, onClose, children }: any) =>
    isOpen ? (
      <div data-test="conversation-modal">
        <button data-test="conversation-modal-close" onClick={onClose}>close</button>
        {children}
      </div>
    ) : null,
}));

vi.mock("@/components/UI/BlockModal", () => ({
  BlockUserModal: ({ userId, username, onClose, onBlocked }: any) => (
    <div data-test="block-modal" data-userid={userId} data-username={username}>
      <button data-test="block-modal-close" onClick={onClose}>close block</button>
      <button data-test="block-modal-block" onClick={onBlocked}>block</button>
    </div>
  ),
}));

vi.mock("@/components/UI/ReportModal", () => ({
  ReportModal: ({ userId, username, onClose, onSpamSelected }: any) => (
    <div data-test="report-modal" data-userid={userId} data-username={username}>
      <button data-test="report-modal-close" onClick={onClose}>close report</button>
      <button data-test="report-modal-spam" onClick={onSpamSelected}>spam</button>
    </div>
  ),
}));

vi.mock("@/components/UI/SpamModal", () => ({
  SpamModal: ({ userId, username, onClose }: any) => (
    <div data-test="spam-modal" data-userid={userId} data-username={username}>
      <button data-test="spam-modal-close" onClick={onClose}>close spam</button>
    </div>
  ),
}));

vi.mock("@/components/UI/Tooltip", () => ({
  default: ({ children, text }: any) => <div data-test="tooltip" data-tooltip={text}>{children}</div>,
}));

const mockFetchFollowStatus = fetchFollowStatus as ReturnType<typeof vi.fn>;
const mockMarkMessageReadState = markMessageReadState as ReturnType<typeof vi.fn>;
const mockUnblockUser = unblockUser as ReturnType<typeof vi.fn>;

function renderHeader(overrides: Partial<React.ComponentProps<typeof ConversationHeader>> = {}) {
  const props = {
    reciepiantId: "user-1",
    conversationId: "conv-1",
    recipientName: "alice",
    lastMessageId: "msg-1",
    onReadStateChange: vi.fn(),
    onDeleted: vi.fn(),
    onBack: vi.fn(),
    ...overrides,
  };
  render(<ConversationHeader {...props} />);
  return props;
}

describe("ConversationHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchFollowStatus.mockResolvedValue({ data: { is_blocking: false } });
    mockMarkMessageReadState.mockResolvedValue({});
    mockUnblockUser.mockResolvedValue({});
  });

  it("renders core actions and navigates to the recipient profile", async () => {
    const user = userEvent.setup();
    const props = renderHeader();

    expect(screen.getByTestId("conversation-header")).toBeInTheDocument();
    expect(screen.getByTestId("conversation-profile-button")).toHaveTextContent("alice");
    expect(screen.getByTestId("delete-conversation-button")).toHaveAttribute("data-participant", "user-1");
    expect(await screen.findByTestId("conversation-block-button")).toHaveTextContent("Block");

    await user.click(screen.getByTestId("conversation-profile-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/alice");

    await user.click(screen.getByTestId("conversation-back-button"));
    expect(props.onBack).toHaveBeenCalled();

    await user.click(screen.getByTestId("delete-conversation-button"));
    expect(props.onDeleted).toHaveBeenCalledWith("conv-1");
  });

  it("toggles read state and disables the button when there is no last message", async () => {
    const user = userEvent.setup();
    const props = renderHeader();

    await user.click(screen.getByTestId("conversation-toggle-read-button"));
    expect(mockMarkMessageReadState).toHaveBeenCalledWith("conv-1", "msg-1", false);
    expect(props.onReadStateChange).toHaveBeenCalledWith(true);
    expect(screen.getByTestId("conversation-toggle-read-button")).toHaveTextContent("Mark as read");

    renderHeader({ lastMessageId: null });
    expect(screen.getAllByTestId("conversation-toggle-read-button").at(-1)).toBeDisabled();
  });

  it("opens block, report, spam, and shared modal close flows", async () => {
    const user = userEvent.setup();
    renderHeader();
    await waitFor(() => expect(screen.getByTestId("conversation-block-button")).not.toBeDisabled());

    await user.click(screen.getByTestId("conversation-block-button"));
    expect(screen.getByTestId("block-modal")).toBeInTheDocument();
    await user.click(screen.getByTestId("conversation-modal-close"));
    expect(screen.queryByTestId("block-modal")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("conversation-block-button"));
    await user.click(screen.getByTestId("block-modal-block"));
    expect(screen.getByTestId("conversation-block-button")).toHaveTextContent("Unblock");

    await user.click(screen.getByTestId("conversation-report-button"));
    expect(screen.getByTestId("report-modal")).toBeInTheDocument();
    await user.click(screen.getByTestId("report-modal-spam"));
    expect(screen.queryByTestId("report-modal")).not.toBeInTheDocument();
    expect(screen.getByTestId("spam-modal")).toBeInTheDocument();
    await user.click(screen.getByTestId("spam-modal-close"));
    expect(screen.queryByTestId("spam-modal")).not.toBeInTheDocument();
  });

  it("unblocks blocked users and falls back when follow status fails", async () => {
    const user = userEvent.setup();
    mockFetchFollowStatus.mockResolvedValueOnce({ data: { is_blocking: true } });
    renderHeader();

    expect(await screen.findByText("Unblock")).toBeInTheDocument();
    await user.click(screen.getByTestId("conversation-block-button"));
    expect(mockUnblockUser).toHaveBeenCalledWith("user-1");
    await waitFor(() => expect(screen.getByTestId("conversation-block-button")).toHaveTextContent("Block"));

    mockFetchFollowStatus.mockRejectedValueOnce(new Error("nope"));
    renderHeader({ reciepiantId: "user-2" });
    expect(await screen.findAllByText("Block")).not.toHaveLength(0);
  });

  it("supports the mobile menu actions", async () => {
    const user = userEvent.setup();
    const props = renderHeader();
    await waitFor(() => expect(screen.getByTestId("conversation-mobile-menu-btn")).toBeInTheDocument());

    await user.click(screen.getByTestId("conversation-mobile-menu-btn"));
    expect(screen.getByTestId("conversation-block-button-mobile")).toHaveTextContent("Block alice");
    await user.click(screen.getByTestId("conversation-report-button-mobile"));
    expect(screen.getByTestId("report-modal")).toBeInTheDocument();

    await user.click(screen.getByTestId("report-modal-close"));
    await user.click(screen.getByTestId("conversation-mobile-menu-btn"));
    await user.click(screen.getByTestId("conversation-toggle-read-button-mobile"));
    expect(props.onReadStateChange).toHaveBeenCalledWith(true);
  });
});
