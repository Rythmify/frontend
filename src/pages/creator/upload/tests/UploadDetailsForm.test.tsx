import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { createRef } from "react";
import UploadDetailsForm, { type UploadFormHandle } from "../UploadDetailsForm";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({ user: { username: "testuser" } }),
}));

vi.mock("@/services/api/upload/track.service", () => ({
  uploadTrack: vi.fn(),
  getGenres: vi.fn().mockResolvedValue(["Electronic", "Hip-Hop"]),
}));

import { uploadTrack } from "@/services/api/upload/track.service";
const mockUploadTrack = uploadTrack as ReturnType<typeof vi.fn>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fakeAudioFile = new File(["audio"], "my-track.wav", {
  type: "audio/wav",
});

const defaultProps = {
  audioData: fakeAudioFile,
  onCancel: vi.fn(),
  onSuccess: vi.fn(),
  setIsLoadingParent: vi.fn(),
};

const renderForm = (props = {}) => {
  const ref = createRef<UploadFormHandle>();
  const utils = render(
    <MemoryRouter>
      <UploadDetailsForm ref={ref} {...defaultProps} {...props} />
    </MemoryRouter>
  );
  return { ref, ...utils };
};

const mockSuccessResponse = {
  data: { id: "new-track-id-123" },
  message: "Track uploaded successfully.",
};

describe("UploadDetailsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadTrack.mockResolvedValue(mockSuccessResponse);
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the form container", () => {
    renderForm();
    expect(screen.getByTestId("upload-details-form")).toBeInTheDocument();
  });

  it("auto-populates title from the audio file name", () => {
    renderForm();
    const titleInput = screen.getByTestId("upload-title-input") as HTMLInputElement;
    expect(titleInput.value).toBe("my-track");
  });

  it("sets title to 'Recorded Audio' when audioData is a Blob", () => {
    const blob = new Blob(["audio"], { type: "audio/wav" });
    renderForm({ audioData: blob });
    const titleInput = screen.getByTestId("upload-title-input") as HTMLInputElement;
    expect(titleInput.value).toBe("Recorded Audio");
  });

  it("auto-populates track link slug from the file name", () => {
    renderForm();
    const linkInput = screen.getByTestId("upload-track-link-input") as HTMLInputElement;
    expect(linkInput.value).toBe("my-track");
  });

  it("auto-populates artist field with the logged-in username", () => {
    renderForm();
    const artistInput = screen.getByTestId("upload-artists-input") as HTMLInputElement;
    expect(artistInput.value).toBe("testuser");
  });

  it("renders the genre dropdown input", () => {
    renderForm();
    expect(screen.getByTestId("genre-dropdown")).toBeInTheDocument();
  });

  it("renders the tags input", () => {
    renderForm();
    expect(screen.getByTestId("upload-tags-input")).toBeInTheDocument();
  });

  it("renders the description input", () => {
    renderForm();
    expect(screen.getByTestId("upload-description-input")).toBeInTheDocument();
  });

  it("renders public privacy option selected by default", () => {
    renderForm();
    const publicRadio = screen.getByTestId("upload-privacy-public-radio") as HTMLInputElement;
    expect(publicRadio.checked).toBe(true);
  });

  it("renders private privacy option unselected by default", () => {
    renderForm();
    const privateRadio = screen.getByTestId("upload-privacy-private-radio") as HTMLInputElement;
    expect(privateRadio.checked).toBe(false);
  });

  it("renders the cover image upload button", () => {
    renderForm();
    expect(screen.getByTestId("cover-image-input")).toBeInTheDocument();
  });

  it("shows the username as part of the track link prefix", () => {
    renderForm();
    expect(screen.getByText(/soundcloud\.com\/testuser\//)).toBeInTheDocument();
  });

  // ── Title → slug sync ──────────────────────────────────────────────────────

  it("updates track link slug as title is typed", async () => {
    renderForm();
    const titleInput = screen.getByTestId("upload-title-input");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Hello World");
    const linkInput = screen.getByTestId("upload-track-link-input") as HTMLInputElement;
    expect(linkInput.value).toBe("hello-world");
  });

  it("converts spaces to hyphens in the track link", async () => {
    renderForm();
    const titleInput = screen.getByTestId("upload-title-input");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "My New Song");
    const linkInput = screen.getByTestId("upload-track-link-input") as HTMLInputElement;
    expect(linkInput.value).toBe("my-new-song");
  });

  it("lowercases the track link slug", async () => {
    renderForm();
    const titleInput = screen.getByTestId("upload-title-input");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "UPPERCASE");
    const linkInput = screen.getByTestId("upload-track-link-input") as HTMLInputElement;
    expect(linkInput.value).toBe("uppercase");
  });

  // ── Privacy toggle ─────────────────────────────────────────────────────────

  it("switches to private when private radio is clicked", async () => {
    renderForm();
    const privateRadio = screen.getByTestId("upload-privacy-private-radio") as HTMLInputElement;
    await userEvent.click(privateRadio);
    expect(privateRadio.checked).toBe(true);
  });

  it("deselects public when private is chosen", async () => {
    renderForm();
    await userEvent.click(screen.getByTestId("upload-privacy-private-radio"));
    const publicRadio = screen.getByTestId("upload-privacy-public-radio") as HTMLInputElement;
    expect(publicRadio.checked).toBe(false);
  });

  it("can switch back to public after choosing private", async () => {
    renderForm();
    await userEvent.click(screen.getByTestId("upload-privacy-private-radio"));
    await userEvent.click(screen.getByTestId("upload-privacy-public-radio"));
    const publicRadio = screen.getByTestId("upload-privacy-public-radio") as HTMLInputElement;
    expect(publicRadio.checked).toBe(true);
  });

  // ── Imperative ref ─────────────────────────────────────────────────────────

  it("exposes triggerSubmit via ref", () => {
    const { ref } = renderForm();
    expect(typeof ref.current?.triggerSubmit).toBe("function");
  });

  it("exposes isUploading=false initially via ref", () => {
    const { ref } = renderForm();
    expect(ref.current?.isUploading).toBe(false);
  });

  // ── Successful submission ──────────────────────────────────────────────────

  it("calls uploadTrack with the audio file on submit", async () => {
    const { ref } = renderForm();
    await ref.current!.triggerSubmit();
    await waitFor(() => expect(mockUploadTrack).toHaveBeenCalledTimes(1));
    const [payload] = mockUploadTrack.mock.calls[0];
    expect(payload.audio_file).toBe(fakeAudioFile);
  });

  it("calls uploadTrack with the correct title on submit", async () => {
    const { ref } = renderForm();
    await ref.current!.triggerSubmit();
    await waitFor(() => expect(mockUploadTrack).toHaveBeenCalledTimes(1));
    const [payload] = mockUploadTrack.mock.calls[0];
    expect(payload.title).toBe("my-track");
  });

  it("calls onSuccess with the returned track id", async () => {
    const onSuccess = vi.fn();
    const { ref } = renderForm({ onSuccess });
    await ref.current!.triggerSubmit();
    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith("new-track-id-123")
    );
  });

  it("calls setIsLoadingParent(true) when upload starts", async () => {
    const setIsLoadingParent = vi.fn();
    const { ref } = renderForm({ setIsLoadingParent });
    await ref.current!.triggerSubmit();
    expect(setIsLoadingParent).toHaveBeenCalledWith(true);
  });

  // ── Validation errors ──────────────────────────────────────────────────────

  it("shows error when title is empty on submit", async () => {
    const { ref } = renderForm();
    const titleInput = screen.getByTestId("upload-title-input");
    await userEvent.clear(titleInput);
    await ref.current!.triggerSubmit();
    await waitFor(() =>
      expect(screen.getByTestId("upload-error-message")).toBeInTheDocument()
    );
    expect(screen.getByTestId("upload-error-message")).toHaveTextContent(
      /track title is required/i
    );
  });

  it("does not call uploadTrack when title is empty", async () => {
    const { ref } = renderForm();
    await userEvent.clear(screen.getByTestId("upload-title-input"));
    await act(() => ref.current!.triggerSubmit());
    expect(mockUploadTrack).not.toHaveBeenCalled();
  });
 
  it("shows error when audioData is null", async () => {
    const { ref } = renderForm({ audioData: null });
    await ref.current!.triggerSubmit();
    await waitFor(() =>
      expect(screen.getByTestId("upload-error-message")).toBeInTheDocument()
    );
    expect(screen.getByTestId("upload-error-message")).toHaveTextContent(
      /missing audio data/i
    );
  });

  it("does not call uploadTrack when audioData is null", async () => {
    const { ref } = renderForm({ audioData: null });
    await ref.current!.triggerSubmit();
    expect(mockUploadTrack).not.toHaveBeenCalled();
  });

  // ── Upload failure ─────────────────────────────────────────────────────────

  it("shows server error message when uploadTrack rejects", async () => {
    mockUploadTrack.mockRejectedValue({
      response: { data: { message: "Upload limit reached." } },
      message: "Request failed",
    });
    const { ref } = renderForm();
    await ref.current!.triggerSubmit();
    await waitFor(() =>
      expect(screen.getByTestId("upload-error-message")).toBeInTheDocument()
    );
    expect(screen.getByTestId("upload-error-message")).toHaveTextContent(
      /upload limit reached/i
    );
  });

  it("calls setIsLoadingParent(false) after upload failure", async () => {
    mockUploadTrack.mockRejectedValue(new Error("Network error"));
    const setIsLoadingParent = vi.fn();
    const { ref } = renderForm({ setIsLoadingParent });
    await ref.current!.triggerSubmit();
    await waitFor(() =>
      expect(setIsLoadingParent).toHaveBeenCalledWith(false)
    );
  });

  it("does not call onSuccess when upload fails", async () => {
    mockUploadTrack.mockRejectedValue(new Error("Network error"));
    const onSuccess = vi.fn();
    const { ref } = renderForm({ onSuccess });
    await ref.current!.triggerSubmit();
    await waitFor(() => expect(mockUploadTrack).toHaveBeenCalled());
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("submits optional metadata fields and cover image", async () => {
    const user = userEvent.setup();
    const onProgress = vi.fn();
    const { ref } = renderForm({ onProgress });

    const descriptionInput = screen.getByTestId("upload-description-input");
    const artistsInput = screen.getByTestId("upload-artists-input");
    const tagsInput = screen.getByTestId("upload-tags-input");
    const coverInput = screen.getByTestId("cover-image-input") as HTMLInputElement;
    const genreInput = screen.getByTestId("dropdown-input");
    const coverFile = new File(["cover"], "cover.png", { type: "image/png" });

    await user.clear(descriptionInput);
    await user.type(descriptionInput, "  A detailed description  ");
    await user.clear(artistsInput);
    await user.type(artistsInput, "Artist One, Artist Two");
    await user.clear(tagsInput);
    await user.type(tagsInput, "tag-1, tag-2");
    await user.click(screen.getByTestId("upload-privacy-private-radio"));
    await user.upload(coverInput, coverFile);
    await user.click(genreInput);
    await user.click(await screen.findByText("Electronic"));

    await ref.current!.triggerSubmit();
    await waitFor(() => expect(mockUploadTrack).toHaveBeenCalledTimes(1));

    const [payload, progressCallback] = mockUploadTrack.mock.calls[0];
    expect(payload.description).toBe("A detailed description");
    expect(payload.genre).toBe("Electronic");
    expect(payload.artists).toBe("Artist One, Artist Two");
    expect(payload.is_public).toBe(false);
    expect(payload.cover_image).toBe(coverFile);
    expect(payload.tags).toEqual(["tag-1", "tag-2"]);
    expect(typeof progressCallback).toBe("function");
    expect(onProgress).not.toHaveBeenCalled();
  });

  it("forwards upload progress updates from the service", async () => {
    const progress = vi.fn();
    mockUploadTrack.mockImplementationOnce(async (_payload, onProgress) => {
      onProgress?.(25);
      onProgress?.(100);
      return mockSuccessResponse;
    });

    const { ref } = renderForm({ onProgress: progress });
    await ref.current!.triggerSubmit();

    await waitFor(() => expect(progress).toHaveBeenCalledWith(25));
    expect(progress).toHaveBeenCalledWith(100);
  });
});
