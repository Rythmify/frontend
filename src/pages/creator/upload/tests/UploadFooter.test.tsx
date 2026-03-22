import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadFooter from "../UploadFooter";

describe("UploadFooter", () => {
  // ── No details mode ───────────────────────────────────────────────────────

  it("renders legal links in non-details mode", () => {
    render(<UploadFooter isDetailsMode={false} />);
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
  });

  it("renders all footer links in non-details mode", () => {
    render(<UploadFooter isDetailsMode={false} />);
    [
      "Legal",
      "Privacy",
      "Cookie Policy",
      "Cookie Manager",
      "Imprint",
      "About us",
      "Copyright",
      "Feedback",
    ].forEach((link) => expect(screen.getByText(link)).toBeInTheDocument());
  });

  it("does not render upload button in non-details mode", () => {
    render(<UploadFooter isDetailsMode={false} />);
    expect(screen.queryByTestId("upload-button")).not.toBeInTheDocument();
  });

  // ── Details mode ──────────────────────────────────────────────────────────

  it("renders upload button in details mode", () => {
    render(<UploadFooter isDetailsMode={true} onSave={vi.fn()} />);
    expect(screen.getByTestId("upload-button")).toBeInTheDocument();
  });

  it("shows Upload text when not loading", () => {
    render(
      <UploadFooter isDetailsMode={true} onSave={vi.fn()} isLoading={false} />,
    );
    expect(screen.getByTestId("upload-button")).toHaveTextContent("Upload");
  });

  it("shows Uploading... when loading", () => {
    render(
      <UploadFooter isDetailsMode={true} onSave={vi.fn()} isLoading={true} />,
    );
    expect(screen.getByTestId("upload-button")).toHaveTextContent(
      "Uploading...",
    );
  });

  it("disables upload button when loading", () => {
    render(
      <UploadFooter isDetailsMode={true} onSave={vi.fn()} isLoading={true} />,
    );
    expect(screen.getByTestId("upload-button")).toBeDisabled();
  });

  it("upload button is enabled when not loading", () => {
    render(
      <UploadFooter isDetailsMode={true} onSave={vi.fn()} isLoading={false} />,
    );
    expect(screen.getByTestId("upload-button")).not.toBeDisabled();
  });

  it("calls onSave when upload button is clicked", async () => {
    const onSave = vi.fn();
    render(
      <UploadFooter isDetailsMode={true} onSave={onSave} isLoading={false} />,
    );
    await userEvent.click(screen.getByTestId("upload-button"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("does not call onSave when button is disabled", async () => {
    const onSave = vi.fn();
    render(
      <UploadFooter isDetailsMode={true} onSave={onSave} isLoading={true} />,
    );
    await userEvent.click(screen.getByTestId("upload-button"));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("renders terms of use text in details mode", () => {
    render(<UploadFooter isDetailsMode={true} onSave={vi.fn()} />);
    expect(screen.getByText(/terms of use/i)).toBeInTheDocument();
  });

  it("does not render legal links in details mode", () => {
    render(<UploadFooter isDetailsMode={true} onSave={vi.fn()} />);
    expect(screen.queryByText("Legal")).not.toBeInTheDocument();
  });
});
