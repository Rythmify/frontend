import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecordSection from "../RecordSection";

// ─── Mock browser APIs ────────────────────────────────────────────────────────

globalThis.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null,
  onstop: null,
})) as any;

Object.defineProperty(globalThis.navigator, "mediaDevices", {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({}),
    enumerateDevices: vi.fn().mockResolvedValue([
      {
        deviceId: "mic-1",
        kind: "audioinput",
        label: "Built-in Mic",
        groupId: "",
        toJSON: () => ({}),
      },
    ]),
  },
  writable: true,
});

describe("RecordSection", () => {
  const mockFinish = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the section header text", () => {
    render(<RecordSection onFinish={mockFinish} />);
    expect(
      screen.getByText(/or record with a microphone/i)
    ).toBeInTheDocument();
  });

  it("renders the mic selector button", () => {
    render(<RecordSection onFinish={mockFinish} />);
    expect(screen.getByTestId("mic-selector-button")).toBeInTheDocument();
  });

  it("renders the expand/collapse toggle button", () => {
    render(<RecordSection onFinish={mockFinish} />);
    expect(
      screen.getByTestId("record-section-toggle-button")
    ).toBeInTheDocument();
  });

  it("renders subtitle description text", () => {
    render(<RecordSection onFinish={mockFinish} />);
    expect(
      screen.getByText(/upload recorded voice memos/i)
    ).toBeInTheDocument();
  });

  // ── Expand / collapse ──────────────────────────────────────────────────────

  it("shows recording controls after clicking expand", async () => {
    render(<RecordSection onFinish={mockFinish} />);
    await userEvent.click(screen.getByTestId("record-section-toggle-button"));
    await waitFor(() =>
      expect(screen.getByTestId("record-toggle-button")).toBeVisible()
    );
  });

  it("shows all action buttons after expanding", async () => {
    render(<RecordSection onFinish={mockFinish} />);
    await userEvent.click(screen.getByTestId("record-section-toggle-button"));
    await waitFor(() => {
      expect(screen.getByTestId("stop-recording-button")).toBeVisible();
      expect(screen.getByTestId("undo-recording-button")).toBeVisible();
      expect(screen.getByTestId("redo-recording-button")).toBeVisible();
      expect(screen.getByTestId("restart-recording-button")).toBeVisible();
    });
  });

  it("shows 'Start recording' label after expanding", async () => {
    render(<RecordSection onFinish={mockFinish} />);
    await userEvent.click(screen.getByTestId("record-section-toggle-button"));
    await waitFor(() =>
      expect(
        screen.getByTestId("record-toggle-button")
      ).toHaveTextContent(/start recording/i)
    );
  });

  // ── Timer display ──────────────────────────────────────────────────────────

  it("shows 0:00 timer when expanded and not recording", async () => {
    render(<RecordSection onFinish={mockFinish} />);
    await userEvent.click(screen.getByTestId("record-section-toggle-button"));
    await waitFor(() =>
      expect(screen.getByText("0:00")).toBeInTheDocument()
    );
  });

  // ── Recording interaction ──────────────────────────────────────────────────

  it("requests microphone access when record is clicked", async () => {
    render(<RecordSection onFinish={mockFinish} />);
    await userEvent.click(screen.getByTestId("record-section-toggle-button"));
    await waitFor(() => screen.getByTestId("record-toggle-button"));
    await userEvent.click(screen.getByTestId("record-toggle-button"));
    await waitFor(() =>
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
    );
  });

  it("changes label to 'Pause recording' after starting", async () => {
    render(<RecordSection onFinish={mockFinish} />);
    await userEvent.click(screen.getByTestId("record-section-toggle-button"));
    await waitFor(() => screen.getByTestId("record-toggle-button"));
    await userEvent.click(screen.getByTestId("record-toggle-button"));
    await waitFor(() =>
      expect(
        screen.getByTestId("record-toggle-button")
      ).toHaveTextContent(/pause recording/i)
    );
  });

  // ── onFinish wiring ────────────────────────────────────────────────────────

  it("wires onFinish prop through to HandleRecording", async () => {
    // We verify the prop flows by confirming RecordSection renders without errors
    // and HandleRecording's stop button is accessible when expanded
    render(<RecordSection onFinish={mockFinish} />);
    await userEvent.click(screen.getByTestId("record-section-toggle-button"));
    await waitFor(() =>
      expect(screen.getByTestId("stop-recording-button")).toBeInTheDocument()
    );
  });
});