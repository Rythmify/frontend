import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProgressBar from "../../components/player/ProgressBar";

describe("ProgressBar", () => {
  const onSeek = vi.fn();

  beforeEach(() => {
    onSeek.mockClear();
  });

  it("renders current time and duration", () => {
    render(<ProgressBar currentTime={30} duration={180} onSeek={onSeek} />);
    expect(screen.getByTestId("player-current-time")).toHaveTextContent("0:30");
    expect(screen.getByTestId("player-duration")).toHaveTextContent("3:00");
  });

  it("renders 0:00 when values are 0", () => {
    render(<ProgressBar currentTime={0} duration={0} onSeek={onSeek} />);
    expect(screen.getByTestId("player-current-time")).toHaveTextContent("0:00");
    expect(screen.getByTestId("player-duration")).toHaveTextContent("0:00");
  });

  it("formats minutes and seconds with padding", () => {
    render(<ProgressBar currentTime={65} duration={125} onSeek={onSeek} />);
    expect(screen.getByTestId("player-current-time")).toHaveTextContent("1:05");
    expect(screen.getByTestId("player-duration")).toHaveTextContent("2:05");
  });

  it("calls onSeek when mousedown on the seek track", () => {
    render(<ProgressBar currentTime={0} duration={200} onSeek={onSeek} />);
    const track = screen.getByTestId("player-seek-track");

    // Mock getBoundingClientRect so ratio calculation is deterministic
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      left: 0, width: 200, top: 0, height: 4,
      right: 200, bottom: 4, toJSON: () => { },
    } as DOMRect);

    fireEvent.mouseDown(track, { clientX: 100 });
    expect(onSeek).toHaveBeenCalledWith(100); // ratio=0.5, duration=200 → 100s
  });

  it("renders the seek bar element", () => {
    render(<ProgressBar currentTime={60} duration={180} onSeek={onSeek} />);
    expect(screen.getByTestId("player-seek-track")).toBeInTheDocument();
    expect(screen.getByTestId("player-progress-bar")).toBeInTheDocument();
  });
});
