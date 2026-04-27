import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import ConversationHeader from "../ConversationHeader";

vi.mock("@/services/api/messaging/conversationApi", () => ({
  markMessageReadState: vi.fn(),
  unblockUser: vi.fn(),
}));

vi.mock("../Modal", () => ({
  Modal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => 
    isOpen ? <div data-test="modal">{children}</div> : null,
}));

vi.mock("@/components/MessagingComponents/DeleteConversationButton", () => ({
  default: ({ onDeleted, conversationId }: any) => (
    <button data-test="delete-button" onClick={() => onDeleted?.(conversationId)}>
      Delete
    </button>
  ),
}));

vi.mock("../UI/BlockModal", () => ({
  BlockUserModal: ({ onBlocked }: { onBlocked: () => void }) => (
    <div data-test="block-modal">
      <button onClick={onBlocked}>Confirm block</button>
    </div>
  ),
}));

vi.mock("../UI/ReportModal", () => ({
  ReportModal: ({ onSpamSelected }: { onSpamSelected: () => void }) => (
    <div data-test="report-modal">
      <button onClick={onSpamSelected}>Select spam</button>
    </div>
  ),
}));

vi.mock("../UI/SpamModal", () => ({
  SpamModal: () => <div data-test="spam-modal" />,
}));

vi.mock("@/components/UI/Tooltip", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { markMessageReadState, unblockUser } from "@/services/api/messaging/conversationApi";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const defaultProps = {
  reciepiantId: "user-1",
  conversationId: "conv-1",
  recipientName: "Alice",
  lastMessageId: "msg-1",
  onReadStateChange: vi.fn(),
  onDeleted: vi.fn(),
};

const renderHeader = (props = {}) =>
  render(
    <MemoryRouter>
      <ConversationHeader {...defaultProps} {...props} />
    </MemoryRouter>
  );

describe("ConversationHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders recipient name and buttons", () => {
    renderHeader();
    expect(screen.getByTestId("conversation-profile-button")).toHaveTextContent("Alice");
    expect(screen.getByTestId("conversation-block-button")).toBeInTheDocument();
  });

  it("navigates to user profile using recipient name", async () => {
    renderHeader();
    await userEvent.click(screen.getByTestId("conversation-profile-button"));
    // Aligned with ConversationHeader.tsx: navigate(`/${recipientName}`)
    expect(mockNavigate).toHaveBeenCalledWith("/Alice");
  });

  it("calls markMessageReadState and toggles state", async () => {
    vi.mocked(markMessageReadState).mockResolvedValue({} as any);
    renderHeader();
    
    const markBtn = screen.getByText(/mark as unread/i);
    await userEvent.click(markBtn);
    
    expect(markMessageReadState).toHaveBeenCalledWith("conv-1", "msg-1", false);
    await waitFor(() => expect(screen.getByText(/mark as read/i)).toBeInTheDocument());
  });

  it("disables mark button when no lastMessageId", () => {
    renderHeader({ lastMessageId: null });
    expect(screen.getByText(/mark as unread/i).closest("button")).toBeDisabled();
  });

  it("opens block modal and handles unblock", async () => {
    vi.mocked(unblockUser).mockResolvedValue({} as any);
    renderHeader();
    
    await userEvent.click(screen.getByTestId("conversation-block-button"));
    expect(screen.getByTestId("block-modal")).toBeInTheDocument();
    
    await userEvent.click(screen.getByText("Confirm block"));
    await waitFor(() => expect(screen.getByText("Unblock")).toBeInTheDocument());
    
    await userEvent.click(screen.getByText("Unblock"));
    expect(unblockUser).toHaveBeenCalledWith("user-1");
  });

  it("opens report and spam modals", async () => {
    renderHeader();
    await userEvent.click(screen.getByTestId("conversation-report-button"));
    expect(screen.getByTestId("report-modal")).toBeInTheDocument();
    
    await userEvent.click(screen.getByText("Select spam"));
    await waitFor(() => expect(screen.getByTestId("spam-modal")).toBeInTheDocument());
  });
});