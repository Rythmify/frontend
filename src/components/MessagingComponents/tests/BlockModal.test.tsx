import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockUserModal } from "../BlockModal";

// ✅ Fix 1: Use the same @/ alias the component uses so the mock actually applies
vi.mock("@/services/api/messaging/conversationApi", () => ({
  blockUser: vi.fn(),
  submitReport: vi.fn(),
}));

import {
  blockUser,
  submitReport,
} from "@/services/api/messaging/conversationApi";

const renderBlock = (
  props: {
    username?: string;
    userId?: string;
    onClose?: () => void;
    onBlocked?: (data: {
      blocker_id: string;
      blocked_id: string;
      created_at: string;
    }) => void;
  } = {}
) =>
  render(
    <BlockUserModal
      username="Charlie"
      userId="user-charlie"
      onClose={vi.fn()}
      onBlocked={vi.fn()}
      {...props}
    />
  );

describe("BlockUserModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders with correct data-test attribute", () => {
    renderBlock();
    expect(screen.getByTestId("block-user-modal")).toBeInTheDocument();
  });

  it("renders the heading with username", () => {
    renderBlock({ username: "Charlie" });
    // Both the <h2> and the block button contain "Block Charlie"
    expect(screen.getAllByText(/Block Charlie/i)).toHaveLength(2);
  });

  it("renders all seven consequence list items", () => {
    renderBlock();
    expect(screen.getByText(/follow you/i)).toBeInTheDocument();
    expect(screen.getByText(/like your tracks/i)).toBeInTheDocument();
    expect(screen.getByText(/repost your tracks/i)).toBeInTheDocument();
    expect(screen.getByText(/send you messages/i)).toBeInTheDocument();
    expect(screen.getByText(/share tracks with you/i)).toBeInTheDocument();
    expect(screen.getByText(/post new comments/i)).toBeInTheDocument();
    expect(
      screen.getByText(/send you new stream or email notifications/i)
    ).toBeInTheDocument();
  });

  // ✅ Fix 2: CheckBox renders a custom <div>, not an <input> or <img>.
  //    Query by label text directly — no broken role query needed.
  it("renders two checkboxes", () => {
    renderBlock();
    expect(
      screen.getByText(/also permanently remove this user's comments/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/also report Charlie for spam/i)
    ).toBeInTheDocument();
  });

  it("renders Cancel and Block buttons", () => {
    renderBlock();
    expect(screen.getByTestId("block-cancel-button")).toBeInTheDocument();
    expect(screen.getByTestId("block-user-button")).toBeInTheDocument();
  });

  it("block button label includes username", () => {
    renderBlock({ username: "Charlie" });
    expect(screen.getByTestId("block-user-button")).toHaveTextContent(
      "Block Charlie"
    );
  });

  // ── Cancel ─────────────────────────────────────────────────────────────────

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    renderBlock({ onClose });
    await userEvent.click(screen.getByTestId("block-cancel-button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Block flow (success) ───────────────────────────────────────────────────

  it("calls blockUser with the userId on block", async () => {
    (blockUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { blocker_id: "me", blocked_id: "user-charlie", created_at: "now" },
    });
    renderBlock({ userId: "user-charlie" });
    await userEvent.click(screen.getByTestId("block-user-button"));
    expect(blockUser).toHaveBeenCalledWith("user-charlie");
  });

  it("calls onBlocked with block data on success", async () => {
    const blockData = {
      blocker_id: "me",
      blocked_id: "user-charlie",
      created_at: "now",
    };
    (blockUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: blockData,
    });
    const onBlocked = vi.fn();
    renderBlock({ onBlocked });
    await userEvent.click(screen.getByTestId("block-user-button"));
    expect(onBlocked).toHaveBeenCalledWith(blockData);
  });

  it("calls onClose after block success", async () => {
    (blockUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { blocker_id: "me", blocked_id: "user-charlie", created_at: "now" },
    });
    const onClose = vi.fn();
    renderBlock({ onClose });
    await userEvent.click(screen.getByTestId("block-user-button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Block with spam ────────────────────────────────────────────────────────

  it("calls submitReport for spam when reportSpam checkbox is checked", async () => {
    (blockUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { blocker_id: "me", blocked_id: "user-charlie", created_at: "now" },
    });
    (submitReport as ReturnType<typeof vi.fn>).mockResolvedValue({});
    renderBlock({ userId: "user-charlie" });

    // The spam checkbox is the second label > div[class*='border']
    const spamLabel = screen
      .getByText(/also report charlie for spam/i)
      .closest("label")!;
    const checkbox = spamLabel.querySelector("div[class*='border']")!;
    await userEvent.click(checkbox);
    await userEvent.click(screen.getByTestId("block-user-button"));

    expect(submitReport).toHaveBeenCalledWith({
      resource_type: "user",
      resource_id: "user-charlie",
      reason: "spam",
    });
  });

  it("does not call submitReport when reportSpam is unchecked", async () => {
    (blockUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { blocker_id: "me", blocked_id: "user-charlie", created_at: "now" },
    });
    renderBlock();
    await userEvent.click(screen.getByTestId("block-user-button"));
    expect(submitReport).not.toHaveBeenCalled();
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it("shows 401 error message on auth failure", async () => {
    (blockUser as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 401 },
    });
    renderBlock();
    await userEvent.click(screen.getByTestId("block-user-button"));
    expect(
      screen.getByText(/missing or invalid access token/i)
    ).toBeInTheDocument();
  });

  it("does not show error initially", () => {
    renderBlock();
    expect(
      screen.queryByText(/missing or invalid access token/i)
    ).not.toBeInTheDocument();
  });

  it("does nothing when userId is undefined", async () => {
    render(<BlockUserModal username="Charlie" onClose={vi.fn()} />);
    await userEvent.click(screen.getByTestId("block-user-button"));
    expect(blockUser).not.toHaveBeenCalled();
  });

  it("disables buttons while blocking", async () => {
    let resolve!: (value: unknown) => void;
    (blockUser as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((res) => { resolve = res; })
    );
    renderBlock();
    await userEvent.click(screen.getByTestId("block-user-button"));
    expect(screen.getByTestId("block-user-button")).toBeDisabled();
    expect(screen.getByTestId("block-cancel-button")).toBeDisabled();
    resolve(undefined);
  });
});