import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ReplaceAudioModal from "../ReplaceAudioModal";

vi.mock("@/services/api/upload/track.service", () => ({
  replaceTrackAudio: vi.fn((_id, _file, setProgress) => {
    setProgress(50);
    return Promise.resolve();
  }),
}));

describe("ReplaceAudioModal", () => {
  it("renders correctly", () => {
    const onClose = vi.fn();
    render(
      <ReplaceAudioModal
        trackId="track-1"
        trackTitle="Test Track"
        onClose={onClose}
      />
    );

    expect(screen.getByText("Replace audio file")).toBeInTheDocument();
    expect(screen.getByText("Test Track")).toBeInTheDocument();
  });

  it("handles file selection and upload", async () => {
    const { replaceTrackAudio } = await import("@/services/api/upload/track.service");
    const onClose = vi.fn();
    const onReplaced = vi.fn();
    render(
      <ReplaceAudioModal
        trackId="track-1"
        trackTitle="Test Track"
        onClose={onClose}
        onReplaced={onReplaced}
      />
    );

    const file = new File(["dummy content"], "test.mp3", { type: "audio/mp3" });
    const input = document.querySelector("input[type='file']") as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText("test.mp3")).toBeInTheDocument();
    
    const uploadBtn = screen.getByTestId("button-confirm-replace-audio");
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(replaceTrackAudio).toHaveBeenCalled();
      expect(onReplaced).toHaveBeenCalled();
      expect(screen.getByText("Upload complete — track is processing")).toBeInTheDocument();
    });
  });
});
