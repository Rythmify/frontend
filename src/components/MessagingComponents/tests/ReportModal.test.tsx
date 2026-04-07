import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportModal } from "../ReportModal";

// Mock the external handler module
vi.mock("../externalhandler", () => ({
  handleExternalAbuse: vi.fn(),
  handleExternalImpersonation: vi.fn(),
  handleExternalTrademark: vi.fn(),
  handleExternalOther: vi.fn(),
}));

import {
  handleExternalAbuse,
  handleExternalImpersonation,
  handleExternalTrademark,
  handleExternalOther,
} from "../externalhandler";

const renderReport = (
  props: {
    username?: string;
    userId?: string;
    onClose?: () => void;
    onSpamSelected?: () => void;
  } = {}
) =>
  render(
    <ReportModal
      username="Bob"
      userId="user-bob"
      onClose={vi.fn()}
      onSpamSelected={vi.fn()}
      {...props}
    />
  );

describe("ReportModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the modal heading", () => {
    renderReport();
    expect(screen.getByText(/report account for/i)).toBeInTheDocument();
  });

  it("renders all five report options", () => {
    renderReport();
    expect(screen.getByTestId("report-spam-button")).toBeInTheDocument();
    expect(screen.getByTestId("report-impersonation-button")).toBeInTheDocument();
    expect(screen.getByTestId("report-abuse-button")).toBeInTheDocument();
    expect(screen.getByTestId("report-trademark-button")).toBeInTheDocument();
    expect(screen.getByTestId("report-other-button")).toBeInTheDocument();
  });

  it("renders the Disclaimer section", () => {
    renderReport();
    expect(screen.getByText(/disclaimer/i)).toBeInTheDocument();
  });

  it("renders disclaimer text with Guidelines and Terms links", () => {
    renderReport();
    expect(screen.getByRole("link", { name: /guidelines/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /terms/i })).toBeInTheDocument();
  });

  it("renders correct data-test on modal container", () => {
    renderReport();
    expect(screen.getByTestId("report-account-modal")).toBeInTheDocument();
  });

  // ── Spam interaction ───────────────────────────────────────────────────────

  it("calls onClose and onSpamSelected when Spam is clicked", async () => {
    const onClose = vi.fn();
    const onSpamSelected = vi.fn();
    renderReport({ onClose, onSpamSelected });
    await userEvent.click(screen.getByTestId("report-spam-button"));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSpamSelected).toHaveBeenCalledTimes(1);
  });

  it("calls onClose before onSpamSelected", async () => {
    const callOrder: string[] = [];
    const onClose = vi.fn(() => callOrder.push("close"));
    const onSpamSelected = vi.fn(() => callOrder.push("spam"));
    renderReport({ onClose, onSpamSelected });
    await userEvent.click(screen.getByTestId("report-spam-button"));
    expect(callOrder).toEqual(["close", "spam"]);
  });

  // ── External handlers ──────────────────────────────────────────────────────

  it("calls handleExternalImpersonation when Impersonation is clicked", async () => {
    renderReport();
    await userEvent.click(screen.getByTestId("report-impersonation-button"));
    expect(handleExternalImpersonation).toHaveBeenCalledTimes(1);
  });

  it("calls handleExternalAbuse when Abuse is clicked", async () => {
    renderReport();
    await userEvent.click(screen.getByTestId("report-abuse-button"));
    expect(handleExternalAbuse).toHaveBeenCalledTimes(1);
  });

  it("calls handleExternalTrademark when Trademark infringement is clicked", async () => {
    renderReport();
    await userEvent.click(screen.getByTestId("report-trademark-button"));
    expect(handleExternalTrademark).toHaveBeenCalledTimes(1);
  });

  it("calls handleExternalOther when Other is clicked", async () => {
    renderReport();
    await userEvent.click(screen.getByTestId("report-other-button"));
    expect(handleExternalOther).toHaveBeenCalledTimes(1);
  });

  // ── Optional props ─────────────────────────────────────────────────────────

  it("works without onClose and onSpamSelected (no crash)", async () => {
    render(<ReportModal username="Bob" userId="user-bob" />);
    await userEvent.click(screen.getByTestId("report-spam-button"));
    // no error thrown
  });
});
