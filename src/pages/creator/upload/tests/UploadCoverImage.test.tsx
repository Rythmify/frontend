import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadCoverImage from "../../../../components/Upload/UploadCoverImage";

globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-url");

describe("UploadCoverImage", () => {
  const mockSelect = vi.fn();

  beforeEach(() => mockSelect.mockClear());

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders add new artwork text initially", () => {
    render(<UploadCoverImage onImageSelect={mockSelect} />);
    expect(screen.getByText(/add new artwork/i)).toBeInTheDocument();
  });

  it("renders the upload button", () => {
    render(<UploadCoverImage onImageSelect={mockSelect} />);
    expect(screen.getByTestId("cover-image-upload-button")).toBeInTheDocument();
  });

  it("does not show preview before upload", () => {
    render(<UploadCoverImage onImageSelect={mockSelect} />);
    expect(screen.queryByAltText(/artwork preview/i)).not.toBeInTheDocument();
  });

  it("file input accepts jpeg, png, gif", () => {
    render(<UploadCoverImage onImageSelect={mockSelect} />);
    const input = screen.getByTestId("cover-image-input") as HTMLInputElement;
    expect(input.accept).toContain("image/jpeg");
    expect(input.accept).toContain("image/png");
    expect(input.accept).toContain("image/gif");
  });

  // ── Upload behavior ────────────────────────────────────────────────────────

  it("calls onImageSelect with the selected file", async () => {
    render(<UploadCoverImage onImageSelect={mockSelect} />);
    const input = screen.getByTestId("cover-image-input") as HTMLInputElement;
    const file = new File(["img"], "cover.jpg", { type: "image/jpeg" });
    await userEvent.upload(input, file);
    expect(mockSelect).toHaveBeenCalledWith(file);
  });

  it("shows image preview after upload", async () => {
    render(<UploadCoverImage onImageSelect={mockSelect} />);
    const input = screen.getByTestId("cover-image-input") as HTMLInputElement;
    await userEvent.upload(
      input,
      new File(["img"], "cover.jpg", { type: "image/jpeg" }),
    );
    expect(screen.getByAltText(/artwork preview/i)).toBeInTheDocument();
  });

  it("shows replace image text after upload", async () => {
    render(<UploadCoverImage onImageSelect={mockSelect} />);
    const input = screen.getByTestId("cover-image-input") as HTMLInputElement;
    await userEvent.upload(
      input,
      new File(["img"], "cover.jpg", { type: "image/jpeg" }),
    );
    expect(screen.getByText(/replace image/i)).toBeInTheDocument();
  });

  it("hides add new artwork text after upload", async () => {
    render(<UploadCoverImage onImageSelect={mockSelect} />);
    const input = screen.getByTestId("cover-image-input") as HTMLInputElement;
    await userEvent.upload(
      input,
      new File(["img"], "cover.jpg", { type: "image/jpeg" }),
    );
    expect(screen.queryByText(/add new artwork/i)).not.toBeInTheDocument();
  });

  it("calls URL.createObjectURL with the selected file", async () => {
    render(<UploadCoverImage onImageSelect={mockSelect} />);
    const input = screen.getByTestId("cover-image-input") as HTMLInputElement;
    const file = new File(["img"], "cover.jpg", { type: "image/jpeg" });
    await userEvent.upload(input, file);
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it("does not call onImageSelect when no file is chosen", () => {
    render(<UploadCoverImage onImageSelect={mockSelect} />);
    const input = screen.getByTestId("cover-image-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: null } });
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("clicking the button triggers the file input", async () => {
    render(<UploadCoverImage onImageSelect={mockSelect} />);
    const input = screen.getByTestId("cover-image-input") as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");
    await userEvent.click(screen.getByTestId("cover-image-upload-button"));
    expect(clickSpy).toHaveBeenCalled();
  });
});
