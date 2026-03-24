import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VolumeSlider from "../../components/player/VolumeSlider";

describe("VolumeSlider", () => {
  const onVolumeChange = vi.fn();
  const onToggleMute = vi.fn();

  beforeEach(() => {
    onVolumeChange.mockClear();
    onToggleMute.mockClear();
  });

  it("renders the speaker button", () => {
    render(
      <VolumeSlider
        volume={0.8}
        isMuted={false}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
      />
    );
    expect(screen.getByTestId("player-button-mute")).toBeInTheDocument();
  });

  it("calls onToggleMute when speaker button is clicked", () => {
    render(
      <VolumeSlider
        volume={0.8}
        isMuted={false}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
      />
    );
    fireEvent.click(screen.getByTestId("player-button-mute"));
    expect(onToggleMute).toHaveBeenCalledOnce();
  });

  it("does NOT show volume popup by default (no hover)", () => {
    render(
      <VolumeSlider
        volume={0.8}
        isMuted={false}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
      />
    );
    expect(screen.queryByTestId("player-volume-popup")).not.toBeInTheDocument();
  });

  it("shows volume popup on mouse enter", () => {
    render(
      <VolumeSlider
        volume={0.8}
        isMuted={false}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
      />
    );
    fireEvent.mouseEnter(screen.getByTestId("player-volume-wrapper"));
    expect(screen.getByTestId("player-volume-popup")).toBeInTheDocument();
  });

  it("hides volume popup on mouse leave", () => {
    render(
      <VolumeSlider
        volume={0.8}
        isMuted={false}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
      />
    );
    const wrapper = screen.getByTestId("player-volume-wrapper");
    fireEvent.mouseEnter(wrapper);
    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByTestId("player-volume-popup")).not.toBeInTheDocument();
  });

  it("calls onVolumeChange when the volume track is clicked", () => {
    render(
      <VolumeSlider
        volume={0.8}
        isMuted={false}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
      />
    );
    fireEvent.mouseEnter(screen.getByTestId("player-volume-wrapper"));
    const track = screen.getByTestId("player-volume-track");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      top: 0, height: 100, left: 0, width: 8,
      right: 8, bottom: 100, toJSON: () => { },
    } as DOMRect);
    // clicking at clientY=25 on a 100px track → ratio = 1 - 25/100 = 0.75
    fireEvent.click(track, { clientY: 25 });
    expect(onVolumeChange).toHaveBeenCalledWith(0.75);
  });
});
