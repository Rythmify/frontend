import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpamModal } from "../SpamModal";

vi.mock("../../services/api/messaging/conversationApi", () => ({
  submitReport: vi.fn(),
}));

import { submitReport } from "@/services/api/messaging/conversationApi";

const renderSpam = (
  props: {
    username?: string;
    userId?: string;
    onClose?: () => void;
    onReported?: () => void;
  } = {}
) =>
  render(
    <SpamModal
      username="Bob"
      userId="user-bob"
      onClose={vi.fn()}
      onReported={vi.fn()}
      {...props}
    />
  );

describe("SpamModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the modal container with correct data-test", () => {
    renderSpam();
    expect(screen.getByTestId("spam-report-modal")).toBeInTheDocument();
  });

  it("renders the title", () => {
    renderSpam();
    expect(screen.getByTestId("spam-report-title")).toBeInTheDocument();
    expect(screen.getByText(/report spam/i)).toBeInTheDocument();
  });

  it("renders the username in the description", () => {
    renderSpam({ username: "Alice" });
    expect(screen.getByText(/reporting Alice for spam/i)).toBeInTheDocument();
  });

  it("renders all three consequence bullets", () => {
    renderSpam();
    expect(
      screen.getByText(/removes their comments, reposts and likes/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/blocks them from interacting with you/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/sends soundcloud a spam report/i)
    ).toBeInTheDocument();
  });

  it("renders the Cancel button", () => {
    renderSpam();
    expect(screen.getByTestId("spam-cancel-button")).toBeInTheDocument();
  });

  it("renders the Report spam button", () => {
    renderSpam();
    expect(screen.getByTestId("spam-report-button")).toBeInTheDocument();
  });

  // ── Cancel ─────────────────────────────────────────────────────────────────

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    renderSpam({ onClose });
    await userEvent.click(screen.getByTestId("spam-cancel-button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Report flow ────────────────────────────────────────────────────────────

  it("calls submitReport with correct payload when Report spam is clicked", async () => {
    (submitReport as ReturnType<typeof vi.fn>).mockResolvedValue({});
    renderSpam({ userId: "user-bob" });
    await userEvent.click(screen.getByTestId("spam-report-button"));
    expect(submitReport).toHaveBeenCalledWith({
      resource_type: "user",
      resource_id: "user-bob",
      reason: "spam",
    });
  });

  it("calls onReported and onClose on successful report", async () => {
    (submitReport as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const onReported = vi.fn();
    const onClose = vi.fn();
    renderSpam({ onReported, onClose });
    await userEvent.click(screen.getByTestId("spam-report-button"));
    expect(onReported).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows 401 error message on auth failure", async () => {
    (submitReport as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 401 },
    });
    renderSpam();
    await userEvent.click(screen.getByTestId("spam-report-button"));
    expect(
      screen.getByText(/missing or invalid access token/i)
    ).toBeInTheDocument();
  });

  it("does not show error message initially", () => {
    renderSpam();
    expect(
      screen.queryByText(/missing or invalid access token/i)
    ).not.toBeInTheDocument();
  });

  it("does not call submitReport when userId is undefined", async () => {
    render(<SpamModal username="Bob" onClose={vi.fn()} />);
    await userEvent.click(screen.getByTestId("spam-report-button"));
    expect(submitReport).not.toHaveBeenCalled();
  });

  it("disables buttons while submitting", async () => {
    let resolve!: (value: unknown) => void;
    (submitReport as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((res) => { resolve = res; })
    );
    renderSpam();
    await userEvent.click(screen.getByTestId("spam-report-button"));
    expect(screen.getByTestId("spam-report-button")).toBeDisabled();
    expect(screen.getByTestId("spam-cancel-button")).toBeDisabled();
    resolve(undefined);
  });
});