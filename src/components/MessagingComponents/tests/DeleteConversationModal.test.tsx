import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteConversationModal from "../DeleteConversationModal";

vi.mock("@/services/api/messaging/conversationApi", () => ({
  deleteConversation: vi.fn(),
  submitReport: vi.fn(),
}));

import {
  deleteConversation,
  submitReport,
} from "@/services/api/messaging/conversationApi";

const renderModal = (
  props: {
    conversationId?: string;
    participantId?: string;
    onClose?: () => void;
    onDeleted?: (id: string) => void;
  } = {}
) =>
  render(
    <DeleteConversationModal
      conversationId="conv-1"
      participantId="user-1"
      onClose={vi.fn()}
      onDeleted={vi.fn()}
      {...props}
    />
  );

describe("DeleteConversationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the confirmation heading", () => {
    renderModal();
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it("renders the description text", () => {
    renderModal();
    expect(screen.getByText(/archiving a conversation removes it/i)).toBeInTheDocument();
  });

  it("renders the spam checkbox", () => {
    renderModal();
    expect(
      screen.getByText(/also report conversation as spam/i)
    ).toBeInTheDocument();
  });

  it("renders Cancel and Archive buttons", () => {
    renderModal();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /archive/i })).toBeInTheDocument();
  });

  // ── Cancel ─────────────────────────────────────────────────────────────────

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    const backdrop = screen.getByRole("dialog");
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when modal content is clicked", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await userEvent.click(screen.getByText(/are you sure/i));
    expect(onClose).not.toHaveBeenCalled();
  });

  // ── Archive flow ───────────────────────────────────────────────────────────

  it("calls deleteConversation with conversationId on archive", async () => {
    (deleteConversation as ReturnType<typeof vi.fn>).mockResolvedValue({});
    renderModal({ conversationId: "conv-1" });
    await userEvent.click(screen.getByRole("button", { name: /archive/i }));
    expect(deleteConversation).toHaveBeenCalledWith("conv-1");
  });

  it("calls onDeleted with conversationId on success", async () => {
    (deleteConversation as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const onDeleted = vi.fn();
    renderModal({ onDeleted, conversationId: "conv-1" });
    await userEvent.click(screen.getByRole("button", { name: /archive/i }));
    expect(onDeleted).toHaveBeenCalledWith("conv-1");
  });

  it("calls onClose after successful delete", async () => {
    (deleteConversation as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const onClose = vi.fn();
    renderModal({ onClose });
    await userEvent.click(screen.getByRole("button", { name: /archive/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── With spam report ───────────────────────────────────────────────────────

  it("calls submitReport before deleteConversation when spam checkbox is checked", async () => {
    const callOrder: string[] = [];
    (submitReport as ReturnType<typeof vi.fn>).mockImplementation(async () =>
      callOrder.push("report")
    );
    (deleteConversation as ReturnType<typeof vi.fn>).mockImplementation(async () =>
      callOrder.push("delete")
    );

    renderModal({ participantId: "user-1" });
    const checkboxContainer = screen
      .getByText(/also report conversation as spam/i)
      .closest("label")!.querySelector("div[class*='border']")!;
    await userEvent.click(checkboxContainer);
    await userEvent.click(screen.getByRole("button", { name: /archive/i }));

    expect(callOrder).toEqual(["report", "delete"]);
    expect(submitReport).toHaveBeenCalledWith({
      resource_type: "user",
      resource_id: "user-1",
      reason: "spam",
    });
  });

  it("does not call submitReport when spam checkbox is unchecked", async () => {
    (deleteConversation as ReturnType<typeof vi.fn>).mockResolvedValue({});
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: /archive/i }));
    expect(submitReport).not.toHaveBeenCalled();
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it("shows error message on failure", async () => {
    (deleteConversation as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Server error")
    );
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: /archive/i }));
    expect(
      screen.getByText(/something went wrong/i)
    ).toBeInTheDocument();
  });

  it("does not show error initially", () => {
    renderModal();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it("disables buttons while deleting", async () => {
    let resolve!: (value: unknown) => void;
    (deleteConversation as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((res) => { resolve = res; })
    );
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: /archive/i }));
    expect(screen.getByRole("button", { name: /archiving/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    resolve(undefined);
  });

  it("shows 'Archiving…' text while in progress", async () => {
    let resolve!: (value: unknown) => void;
    (deleteConversation as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((res) => { resolve = res; })
    );
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: /archive/i }));
    expect(screen.getByText(/archiving…/i)).toBeInTheDocument();
    resolve(undefined);
  });
});