import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MicSelector from "../MicSelector";

const mockMics: MediaDeviceInfo[] = [
  {
    deviceId: "mic-1",
    kind: "audioinput",
    label: "Built-in Mic",
    groupId: "",
    toJSON: () => ({}),
  },
  {
    deviceId: "mic-2",
    kind: "audioinput",
    label: "USB Mic",
    groupId: "",
    toJSON: () => ({}),
  },
];

const setupMediaDevices = (mics = mockMics) => {
  Object.defineProperty(globalThis.navigator, "mediaDevices", {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({}),
      enumerateDevices: vi.fn().mockResolvedValue(mics),
    },
    writable: true,
  });
};

describe("MicSelector", () => {
  beforeEach(() => {
    setupMediaDevices();
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the mic selector button", () => {
    render(<MicSelector selectedMicId="default" onSelectMic={vi.fn()} />);
    expect(screen.getByTestId("mic-selector-button")).toBeInTheDocument();
  });

  it("does not show mic list before clicking", () => {
    render(<MicSelector selectedMicId="default" onSelectMic={vi.fn()} />);
    expect(screen.queryByText("Built-in Mic")).not.toBeInTheDocument();
  });

  // ── Opening menu ───────────────────────────────────────────────────────────

  it("opens mic list on button click", async () => {
    render(<MicSelector selectedMicId="default" onSelectMic={vi.fn()} />);
    await userEvent.click(screen.getByTestId("mic-selector-button"));
    await screen.findByText("Built-in Mic");
    expect(screen.getByText("USB Mic")).toBeInTheDocument();
  });

  it("calls getUserMedia when menu is opened", async () => {
    render(<MicSelector selectedMicId="default" onSelectMic={vi.fn()} />);
    await userEvent.click(screen.getByTestId("mic-selector-button"));
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });
  });

  // ── Selecting mic ──────────────────────────────────────────────────────────

  it("calls onSelectMic with correct deviceId", async () => {
    const onSelectMic = vi.fn();
    render(<MicSelector selectedMicId="default" onSelectMic={onSelectMic} />);
    await userEvent.click(screen.getByTestId("mic-selector-button"));
    await screen.findByText("Built-in Mic");
    await userEvent.click(screen.getByText("Built-in Mic"));
    expect(onSelectMic).toHaveBeenCalledWith("mic-1");
  });

  it("calls onSelectMic with second mic deviceId", async () => {
    const onSelectMic = vi.fn();
    render(<MicSelector selectedMicId="default" onSelectMic={onSelectMic} />);
    await userEvent.click(screen.getByTestId("mic-selector-button"));
    await screen.findByText("USB Mic");
    await userEvent.click(screen.getByText("USB Mic"));
    expect(onSelectMic).toHaveBeenCalledWith("mic-2");
  });

  it("closes menu after selecting a mic", async () => {
    render(<MicSelector selectedMicId="default" onSelectMic={vi.fn()} />);
    await userEvent.click(screen.getByTestId("mic-selector-button"));
    await screen.findByText("Built-in Mic");
    await userEvent.click(screen.getByText("Built-in Mic"));
    expect(screen.queryByText("Built-in Mic")).not.toBeInTheDocument();
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it("shows Microphone fallback label for mic with empty label", async () => {
    setupMediaDevices([
      {
        deviceId: "mic-x",
        kind: "audioinput",
        label: "",
        groupId: "",
        toJSON: () => ({}),
      },
    ]);
    render(<MicSelector selectedMicId="default" onSelectMic={vi.fn()} />);
    await userEvent.click(screen.getByTestId("mic-selector-button"));
    await screen.findByText("Microphone");
  });

  it("closes menu on window click", async () => {
    render(<MicSelector selectedMicId="default" onSelectMic={vi.fn()} />);
    await userEvent.click(screen.getByTestId("mic-selector-button"));
    await screen.findByText("Built-in Mic");
    fireEvent.click(window);
    expect(screen.queryByText("Built-in Mic")).not.toBeInTheDocument();
  });

  it("handles getUserMedia error gracefully without crashing", async () => {
    Object.defineProperty(globalThis.navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error("Permission denied")),
        enumerateDevices: vi.fn().mockResolvedValue([]),
      },
      writable: true,
    });
    render(<MicSelector selectedMicId="default" onSelectMic={vi.fn()} />);
    await userEvent.click(screen.getByTestId("mic-selector-button"));
    expect(screen.getByTestId("mic-selector-button")).toBeInTheDocument();
  });
});
