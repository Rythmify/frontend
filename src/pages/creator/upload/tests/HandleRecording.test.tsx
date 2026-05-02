import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  act,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HandleRecording from "../HandleRecording";

vi.mock("../../../../services/api/upload/audioTranscoder", () => ({
  default: vi.fn().mockResolvedValue(new Blob(["wav"], { type: "audio/wav" })),
}));

import toWav from "../../../../services/api/upload/audioTranscoder";
const mockToWav = vi.mocked(toWav);

// ── Mock MediaRecorder ─────────────────────────────────────────────────────
class MockMediaRecorder {
  start = vi.fn();
  stop = vi.fn(() => {
    this.onstop?.({} as any);
  });
  ondataavailable: ((event: any) => void) | null = null;
  onstop: ((event: any) => void) | null = null;
  mimeType = "audio/ogg";
}

globalThis.MediaRecorder = MockMediaRecorder as any;
const originalAudioContext = globalThis.AudioContext;

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

const createStatefulSetter = <T,>(initial: T) => {
  let current = initial;
  const setter = vi.fn((next: T | ((prev: T) => T)) => {
    current =
      typeof next === "function" ? (next as (prev: T) => T)(current) : next;
  });
  return { setter, getCurrent: () => current };
};

const createRecorder = () => {
  const recorder: any = {
    start: vi.fn(),
    stop: vi.fn(() => recorder.onstop?.({} as any)),
    ondataavailable: null,
    onstop: null,
    mimeType: "audio/ogg",
  };
  return recorder;
};

describe("HandleRecording", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    vi.useRealTimers();
    globalThis.AudioContext = originalAudioContext;
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("shows Start recording when not recording", () => {
    render(<HandleRecording {...makeProps()} />);
    expect(screen.getByTestId("record-toggle-button")).toHaveTextContent(
      /start recording/i,
    );
  });

  it("shows Pause recording when actively recording", () => {
    render(
      <HandleRecording
        {...makeProps({ isRecording: true, isPaused: false })}
      />,
    );
    expect(screen.getByTestId("record-toggle-button")).toHaveTextContent(
      /pause recording/i,
    );
  });

  it("shows Resume recording when paused", () => {
    render(
      <HandleRecording {...makeProps({ isRecording: true, isPaused: true })} />,
    );
    expect(screen.getByTestId("record-toggle-button")).toHaveTextContent(
      /resume recording/i,
    );
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
    const mockRecorder = {
      start: vi.fn(),
      stop: vi.fn(),
      ondataavailable: null,
      onstop: null,
    };
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
    const mockRecorder = {
      start: vi.fn(),
      stop: vi.fn(),
      ondataavailable: null,
      onstop: null,
    };
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
    const props = makeProps({
      isPaused: true,
      redoStack: [],
      redoAudioStack: [],
    });
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
    const props = makeProps({
      isRecording: true,
      isPaused: false,
      seconds: 60,
    });
    render(<HandleRecording {...props} />);
    act(() => {
      vi.runAllTimers();
    });
    expect(props.setIsRecordingFinished).toHaveBeenCalledWith(true);
    expect(props.setIsRecording).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });

  // ── Button states ──────────────────────────────────────────────────────────

  it("action buttons show cursor-pointer when paused", () => {
    render(<HandleRecording {...makeProps({ isPaused: true })} />);
    expect(screen.getByTestId("stop-recording-button").className).toContain(
      "cursor-pointer",
    );
  });

  it("action buttons show cursor-default when not recording or paused", () => {
    render(<HandleRecording {...makeProps()} />);
    expect(screen.getByTestId("stop-recording-button").className).toContain(
      "cursor-default",
    );
  });

  it("updates the timer while recording", () => {
    vi.useFakeTimers();
    const props = makeProps({ isRecording: true, isPaused: false, seconds: 0 });
    render(<HandleRecording {...props} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(props.setSeconds).toHaveBeenCalled();
  });

  it("resumes recording when paused", async () => {
    const props = makeProps({
      isRecording: true,
      isPaused: true,
      seconds: 12,
      currentSegmentStart: 7,
    });
    render(<HandleRecording {...props} />);

    await userEvent.click(screen.getByTestId("record-toggle-button"));

    expect(props.setCurrentSegmentStart).toHaveBeenCalledWith(12);
    expect(props.setIsPaused).toHaveBeenCalledWith(false);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });

  it("does nothing when stop is clicked while idle", async () => {
    const props = makeProps();
    render(<HandleRecording {...props} />);

    await userEvent.click(screen.getByTestId("stop-recording-button"));

    expect(props.onFinish).not.toHaveBeenCalled();
    expect(props.mediaRecorderRef.current).toBeNull();
  });

  it("stops an active recording and sends the transcoded blob", async () => {
    const recorder = createRecorder();
    const segments = createStatefulSetter([
      new Blob(["part"], { type: "audio/ogg" }),
    ]);
    const onFinish = vi.fn();
    const props = makeProps({
      isRecording: true,
      isPaused: false,
      seconds: 10,
      currentSegmentStart: 5,
      mediaRecorderRef: { current: recorder },
      audioSegments: segments.getCurrent(),
      setAudioSegments: segments.setter,
      onFinish,
    });

    render(<HandleRecording {...props} />);
    fireEvent.click(screen.getByTestId("stop-recording-button"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => expect(mockToWav).toHaveBeenCalled());
    expect(onFinish).toHaveBeenCalledWith(expect.any(Blob));
    expect(props.setIsRecording).toHaveBeenCalledWith(false);
    expect(props.setIsPaused).toHaveBeenCalledWith(false);
    expect(props.setIsRecordingFinished).toHaveBeenCalledWith(true);
  });

  it("falls back to the raw blob when transcoding fails", async () => {
    mockToWav.mockRejectedValueOnce(new Error("transcode failed"));

    const recorder = createRecorder();
    const rawBlob = new Blob(["part"], { type: "audio/ogg" });
    const segments = createStatefulSetter([rawBlob]);
    const onFinish = vi.fn();
    const props = makeProps({
      isRecording: true,
      isPaused: false,
      seconds: 10,
      currentSegmentStart: 5,
      mediaRecorderRef: { current: recorder },
      audioSegments: segments.getCurrent(),
      setAudioSegments: segments.setter,
      onFinish,
    });

    render(<HandleRecording {...props} />);
    fireEvent.click(screen.getByTestId("stop-recording-button"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(onFinish).toHaveBeenCalledWith(rawBlob);
  });

  it("restarts and starts a new recording after finishing", async () => {
    const recorder = createRecorder();
    const props = makeProps({
      isRecordingFinished: true,
      mediaRecorderRef: { current: recorder },
    });

    render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("record-toggle-button"));

    expect(props.setSeconds).toHaveBeenCalledWith(0);
    expect(props.setIsRecording).toHaveBeenCalledWith(true);
    expect(props.setIsRecordingFinished).toHaveBeenCalledWith(false);
    expect(props.setAudioSegments).toHaveBeenCalledWith([]);
    expect(props.setRedoStack).toHaveBeenCalledWith([]);
    expect(props.setRedoAudioStack).toHaveBeenCalledWith([]);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });

  it("finalizes the recording when stop is clicked while paused", async () => {
    const segments = createStatefulSetter([
      new Blob(["part"], { type: "audio/ogg" }),
    ]);
    const onFinish = vi.fn();
    const props = makeProps({
      isRecording: false,
      isPaused: true,
      audioSegments: segments.getCurrent(),
      setAudioSegments: segments.setter,
      onFinish,
    });

    render(<HandleRecording {...props} />);
    fireEvent.click(screen.getByTestId("stop-recording-button"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => expect(mockToWav).toHaveBeenCalled());
    expect(onFinish).toHaveBeenCalledWith(expect.any(Blob));
    expect(props.setIsRecording).toHaveBeenCalledWith(false);
    expect(props.setIsPaused).toHaveBeenCalledWith(false);
    expect(props.setIsRecordingFinished).toHaveBeenCalledWith(true);
  });

  it("collects recorded chunks before finalizing a started recording", async () => {
    const segments = createStatefulSetter([] as Blob[]);
    const onFinish = vi.fn();
    const props = makeProps({
      audioSegments: segments.getCurrent(),
      setAudioSegments: segments.setter,
      onFinish,
    });

    const view = render(<HandleRecording {...props} />);
    await userEvent.click(screen.getByTestId("record-toggle-button"));
    expect(props.setIsRecording).toHaveBeenCalledWith(true);
    view.rerender(
      <HandleRecording
        {...props}
        isRecording={true}
        isRecordingFinished={false}
      />,
    );

    await waitFor(() => expect(props.mediaRecorderRef.current).not.toBeNull());
    const recorder = props.mediaRecorderRef.current as any;
    recorder.ondataavailable?.({
      data: new Blob(["chunk"], { type: "audio/ogg" }),
    } as any);

    fireEvent.click(screen.getByTestId("stop-recording-button"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => expect(mockToWav).toHaveBeenCalled());
    expect(segments.setter).toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalledWith(expect.any(Blob));
  });

  it("merges multiple recorded segments into a wav blob", async () => {
    const recorder = createRecorder();
    const segments = createStatefulSetter([
      new Blob(["part-1"], { type: "audio/ogg" }),
      new Blob(["part-2"], { type: "audio/ogg" }),
    ]);
    const onFinish = vi.fn();

    const decodeAudioData = vi
      .fn()
      .mockResolvedValueOnce({
        numberOfChannels: 1,
        sampleRate: 22050,
        length: 2,
        getChannelData: () => Float32Array.from([0.25, -0.25]),
      })
      .mockResolvedValueOnce({
        numberOfChannels: 1,
        sampleRate: 22050,
        length: 2,
        getChannelData: () => Float32Array.from([0.5, 0.75]),
      });

    const createBuffer = vi.fn((channels: number, length: number) => {
      const channelData = Array.from(
        { length: channels },
        () => new Float32Array(length),
      );
      return {
        numberOfChannels: channels,
        length,
        sampleRate: 22050,
        getChannelData: (channel: number) => channelData[channel],
      };
    });

    const close = vi.fn().mockResolvedValue(undefined);

    class MockAudioContextWithMerging {
      sampleRate = 22050;
      decodeAudioData = decodeAudioData;
      createBuffer = createBuffer;
      close = close;
    }

    globalThis.AudioContext = MockAudioContextWithMerging as any;

    const props = makeProps({
      isRecording: true,
      isPaused: false,
      seconds: 10,
      currentSegmentStart: 5,
      mediaRecorderRef: { current: recorder },
      audioSegments: segments.getCurrent(),
      setAudioSegments: segments.setter,
      onFinish,
    });

    render(<HandleRecording {...props} />);
    fireEvent.click(screen.getByTestId("stop-recording-button"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => expect(mockToWav).toHaveBeenCalled());
    expect(onFinish).toHaveBeenCalledWith(expect.any(Blob));
    expect(close).toHaveBeenCalled();
  });

  it("falls back to the raw blob when merging recorded segments fails", async () => {
    const recorder = createRecorder();
    const segments = createStatefulSetter([
      new Blob(["part-1"], { type: "audio/ogg" }),
      new Blob(["part-2"], { type: "audio/ogg" }),
    ]);
    const onFinish = vi.fn();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const decodeAudioData = vi.fn().mockRejectedValue(new Error("decode failed"));
    const close = vi.fn().mockResolvedValue(undefined);

    class MockAudioContextWithFailure {
      sampleRate = 22050;
      decodeAudioData = decodeAudioData;
      createBuffer = vi.fn();
      close = close;
    }

    globalThis.AudioContext = MockAudioContextWithFailure as any;

    const props = makeProps({
      isRecording: true,
      isPaused: false,
      seconds: 10,
      currentSegmentStart: 5,
      mediaRecorderRef: { current: recorder },
      audioSegments: segments.getCurrent(),
      setAudioSegments: segments.setter,
      onFinish,
    });

    render(<HandleRecording {...props} />);
    fireEvent.click(screen.getByTestId("stop-recording-button"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => expect(mockToWav).toHaveBeenCalled());
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to merge recorded segments, using fallback blob:",
      expect.any(Error),
    );
    expect(close).toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalledWith(expect.any(Blob));
    consoleSpy.mockRestore();
  });
});
