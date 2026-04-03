import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import DropZone from "../../../../components/Upload/DropZone";

describe("DropZone", () => {
  const mockUpload = vi.fn();

  beforeEach(() => mockUpload.mockClear());

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the main heading", () => {
    render(<DropZone onUpload={mockUpload} />);
    expect(screen.getByText(/upload your audio files/i)).toBeInTheDocument();
  });

  it("renders the choose files button", () => {
    render(<DropZone onUpload={mockUpload} />);
    expect(screen.getByTestId("choose-files-button")).toBeInTheDocument();
  });

  it("renders the drag and drop prompt", () => {
    render(<DropZone onUpload={mockUpload} />);
    expect(screen.getByText(/drag and drop audio files/i)).toBeInTheDocument();
  });

  it("renders the helper text", () => {
    render(<DropZone onUpload={mockUpload} />);
    expect(screen.getByText(/for best quality/i)).toBeInTheDocument();
  });

  // ── Valid file upload ──────────────────────────────────────────────────────

  it("calls onUpload with a valid mp3 file", async () => {
    render(<DropZone onUpload={mockUpload} />);
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    const file = new File(["audio"], "song.mp3", { type: "audio/mpeg" });
    await userEvent.upload(input, file);
    expect(mockUpload).toHaveBeenCalledWith(file);
  });

  it("calls onUpload with a valid wav file", async () => {
    render(<DropZone onUpload={mockUpload} />);
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    const file = new File(["audio"], "song.wav", { type: "audio/wav" });
    await userEvent.upload(input, file);
    expect(mockUpload).toHaveBeenCalledWith(file);
  });

  // ── Invalid file ───────────────────────────────────────────────────────────

  it("does not call onUpload for non-audio file", async () => {
    render(<DropZone onUpload={mockUpload} />);
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    await userEvent.upload(
      input,
      new File(["x"], "img.png", { type: "image/png" }),
    );
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("does not call onUpload when file list is null", () => {
    render(<DropZone onUpload={mockUpload} />);
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: null } });
    expect(mockUpload).not.toHaveBeenCalled();
  });

  // ── Drag and drop ──────────────────────────────────────────────────────────

  it("adds dragging style on dragOver", () => {
    render(<DropZone onUpload={mockUpload} />);
    const zone = screen.getByText(/drag and drop/i).closest("div")!;
    fireEvent.dragOver(zone);
    expect(zone).toHaveClass("bg-accent/5");
  });

  it("removes dragging style on dragLeave", () => {
    render(<DropZone onUpload={mockUpload} />);
    const zone = screen.getByText(/drag and drop/i).closest("div")!;
    fireEvent.dragOver(zone);
    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveClass("bg-accent/5");
  });

  it("calls onUpload when valid audio file is dropped", () => {
    render(<DropZone onUpload={mockUpload} />);
    const zone = screen.getByText(/drag and drop/i).closest("div")!;
    const file = new File(["audio"], "track.wav", { type: "audio/wav" });
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(mockUpload).toHaveBeenCalledWith(file);
  });

  it("does not call onUpload when drop has empty file list", () => {
    render(<DropZone onUpload={mockUpload} />);
    const zone = screen.getByText(/drag and drop/i).closest("div")!;
    fireEvent.drop(zone, { dataTransfer: { files: [] } });
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("shows error when non-audio file is dropped", () => {
    render(<DropZone onUpload={mockUpload} />);
    const zone = screen.getByText(/drag and drop/i).closest("div")!;
    fireEvent.drop(zone, {
      dataTransfer: {
        files: [new File(["x"], "img.png", { type: "image/png" })],
      },
    });
    expect(screen.getByText(/file type is not supported/i)).toBeInTheDocument();
  });
});
