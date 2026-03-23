import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HandleRecording from "../HandleRecording";

// ── Mock MediaRecorder ─────────────────────────────────────────────────────
globalThis.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null,
  onstop: null,
})) as any;

Object.defineProperty(globalThis.navigator, "mediaDevices", {
  value: { getUserMedia: vi.fn().mockResolvedValue({}) },
  writable: true,
});

// ── Props factory ──────────────────────────────────────────────────────────
const makeProps = (overrides = {}) => ({
  isRecording: false,
  setIsRecording: vi.fn(),
  isPaused: false,
  setIsPaused: vi.fn(),
  isRecordingFinished: false,
  setIsRecordingFinished: vi.fn(),
  seconds: 0,
  setSeconds: vi.fn(),
  formatTime: (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`,
  history: [] as number[],
  setHistory: vi.fn(),
  redoStack: [] as number[],
  setRedoStack: vi.fn(),
  currentSegmentStart: 0,
  setCurrentSegmentStart: vi.fn(),
  onFinish: vi.fn(),
  mediaRecorderRef: { current: null } as any,
  audioSegments: [] as Blob[],
  setAudioSegments: vi.fn(),
  redoAudioStack: [] as Blob[],
  setRedoAudioStack: vi.fn(),
  selectedMicId: "default",
  ...overrides,
});

describe("HandleRecording", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("shows Start recording when not recording", () => {
    render(<HandleRecording {...makeProps()} />);
    expect(screen.getByTestId("record-toggle-button")).toHaveTextContent(/start recording/i);
  });

  it("shows Pause recording when actively recording", () => {
    render(<HandleRecording {...makeProps({ isRecording: true, isPaused: false })} />);
    expect(screen.getByTestId("record-toggle-button")).toHaveTextContent(/pause recording/i);
  });

  it("shows Resume recording when paused", () => {
    render(<HandleRecording {...makeProps({ isRecording: true, isPaused: true })} />);
    expect(screen.getByTestId("record-toggle-button")).toHaveTextContent(/resume recording/i);
  });

  it("displays 0:00 timer at start", () => {
    render(<HandleRecording {...makeProps({ seconds: 0 })} />);
    expect(screen.getByText("0:00")).toBeInTheDocument();
  });

  it("displays correctly formatted timer at 65 seconds", () => {
    render(<HandleRecording {...makeProps({ seconds: 65 })} />);
    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("renders all four action buttons", () => {
    render(<HandleRecording {...makeProps()} />);
    expect(screen.getByTestId("stop-recording-button")).toBeInTheDocument();
    expect(screen.getByTestId("undo-recording-button")).toBeInTheDocument();
    expect(screen.getByTestId("redo-recording-button")).toBeInTheDocument();
    expect(screen.getByTestId("restart-recording-button")).toBeInTheDocument();
  });

  // ── Start recording ────────────────────────────────────────────────────────

  it("calls setIsRecording(true) when start is clicked", async () => {
    const props = makeProps();
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("record-toggle-button"));
    expect(props.setIsRecording).toHaveBeenCalledWith(true);
  });

  it("resets redo stacks when starting new recording", async () => {
    const props = makeProps();
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("record-toggle-button"));
    expect(props.setRedoStack).toHaveBeenCalledWith([]);
    expect(props.setRedoAudioStack).toHaveBeenCalledWith([]);
  });

  it("calls getUserMedia when recording starts", async () => {
    render(<HandleRecording {...makeProps()} />);
    await userEvent.click(screen.getByTestId("record-toggle-button"));
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });

  // ── Pausing ────────────────────────────────────────────────────────────────

  it("calls setIsPaused(true) when pausing active recording", async () => {
    const mockRecorder = { start: vi.fn(), stop: vi.fn(), ondataavailable: null, onstop: null };
    const props = makeProps({
      isRecording: true,
      isPaused: false,
      mediaRecorderRef: { current: mockRecorder },
      seconds: 10,
      currentSegmentStart: 5,
    });
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("record-toggle-button"));
    expect(props.setIsPaused).toHaveBeenCalledWith(true);
  });

  it("saves segment duration to history when pausing", async () => {
    const mockRecorder = { start: vi.fn(), stop: vi.fn(), ondataavailable: null, onstop: null };
    const props = makeProps({
      isRecording: true,
      isPaused: false,
      mediaRecorderRef: { current: mockRecorder },
      seconds: 10,
      currentSegmentStart: 5,
      history: [],
    });
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("record-toggle-button"));
    expect(props.setHistory).toHaveBeenCalledWith([5]);
  });

  // ── Undo ───────────────────────────────────────────────────────────────────

  it("does nothing on undo when history is empty", async () => {
    const props = makeProps({ isPaused: true, history: [], audioSegments: [] });
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("undo-recording-button"));
    expect(props.setHistory).not.toHaveBeenCalled();
  });

  it("removes last segment from history on undo", async () => {
    const blob = new Blob(["audio"]);
    const props = makeProps({
      isPaused: true,
      history: [10, 5],
      audioSegments: [blob, blob],
      seconds: 15,
    });
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("undo-recording-button"));
    expect(props.setHistory).toHaveBeenCalledWith([10]);
    expect(props.setRedoStack).toHaveBeenCalledWith([5]);
  });

  it("subtracts segment duration from seconds on undo", async () => {
    const blob = new Blob(["audio"]);
    const props = makeProps({
      isPaused: true,
      history: [8],
      audioSegments: [blob],
      seconds: 8,
    });
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("undo-recording-button"));
    expect(props.setSeconds).toHaveBeenCalled();
  });

  // ── Redo ───────────────────────────────────────────────────────────────────

  it("does nothing on redo when redo stack is empty", async () => {
    const props = makeProps({ isPaused: true, redoStack: [], redoAudioStack: [] });
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("redo-recording-button"));
    expect(props.setRedoStack).not.toHaveBeenCalled();
  });

  it("restores last segment from redo stack", async () => {
    const blob = new Blob(["audio"]);
    const props = makeProps({
      isPaused: true,
      redoStack: [7],
      redoAudioStack: [blob],
      history: [],
      audioSegments: [],
    });
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("redo-recording-button"));
    expect(props.setHistory).toHaveBeenCalledWith([7]);
    expect(props.setRedoStack).toHaveBeenCalledWith([]);
  });

  // ── Restart ────────────────────────────────────────────────────────────────

  it("restart resets seconds to 0", async () => {
    const props = makeProps({ isPaused: true, seconds: 30 });
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("restart-recording-button"));
    expect(props.setSeconds).toHaveBeenCalledWith(0);
  });

  it("restart clears audio segments", async () => {
    const props = makeProps({ isPaused: true });
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("restart-recording-button"));
    expect(props.setAudioSegments).toHaveBeenCalledWith([]);
  });

  it("restart clears history and redo stack", async () => {
    const props = makeProps({ isPaused: true });
    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("restart-recording-button"));
    expect(props.setHistory).toHaveBeenCalledWith([]);
    expect(props.setRedoStack).toHaveBeenCalledWith([]);
  });

  // ── Auto-stop at 60s ───────────────────────────────────────────────────────

  it("auto-stops when seconds reach 60", () => {
    vi.useFakeTimers();
    const props = makeProps({ isRecording: true, isPaused: false, seconds: 60 });
    render(<HandleRecording {...props} />);
    act(() => { vi.runAllTimers(); });
    expect(props.setIsRecordingFinished).toHaveBeenCalledWith(true);
    expect(props.setIsRecording).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });

  // ── Button states ──────────────────────────────────────────────────────────

  it("action buttons show cursor-pointer when paused", () => {
    render(<HandleRecording {...makeProps({ isPaused: true })} />);
    expect(screen.getByTestId("stop-recording-button").className).toContain("cursor-pointer");
  });

  it("action buttons show cursor-default when not recording or paused", () => {
    render(<HandleRecording {...makeProps()} />);
    expect(screen.getByTestId("stop-recording-button").className).toContain("cursor-default");
  });
});