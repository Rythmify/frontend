import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useImperativeHandle } from "react";
import UploadPage from "../UploadPage";
import { type UploadFormHandle } from "../UploadPage";

function createOutletContext() {
  const context = {
    isDetailsMode: false,
    trackName: "",
    uploadProgress: 0,
    uploadSuccess: false,
    setIsDetailsMode: vi.fn((value: boolean) => {
      context.isDetailsMode = value;
    }),
    setTrackName: vi.fn((value: string) => {
      context.trackName = value;
    }),
    setUploadProgress: vi.fn((value: number) => {
      context.uploadProgress = value;
    }),
    setUploadSuccess: vi.fn((value: boolean) => {
      context.uploadSuccess = value;
    }),
  };

  return context;
}

const mocks = vi.hoisted(() => ({
  isAuthenticated: true,
  locationState: {} as { premiumActivated?: boolean } | null,
  outletContext: createOutletContext(),
  quotaPromise: Promise.resolve({
    canUpload: true,
    usedTracks: 0,
    trackLimit: 3,
  }),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({ isAuthenticated: mocks.isAuthenticated }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useLocation: () => ({ state: mocks.locationState }),
    useOutletContext: () => mocks.outletContext,
  };
});

vi.mock("@/services/api/upload/quota.service", () => ({
  getUploadQuota: vi.fn(() => mocks.quotaPromise),
}));

vi.mock("../UploadGuestPage", () => ({
  default: () => <div data-test="upload-guest-page" />,
}));

vi.mock("@/components/Upload/UploadQuotaBar", () => ({
  default: () => <div data-test="upload-quota-bar" />,
}));

vi.mock("../RecordSection", () => ({
  default: ({ onFinish }: { onFinish: (data: File | Blob) => void }) => (
    <button
      type="button"
      data-test="record-section-upload"
      onClick={() => onFinish(new Blob(["recorded"], { type: "audio/wav" }))}
    >
      Record
    </button>
  ),
}));

vi.mock("../../../../components/Upload/DropZone", () => ({
  default: ({ onUpload }: { onUpload: (data: File) => void }) => (
    <button
      type="button"
      data-test="drop-zone-upload"
      onClick={() =>
        onUpload(new File(["audio"], "uploaded-track.wav", { type: "audio/wav" }))
      }
    >
      Upload
    </button>
  ),
}));

vi.mock("../UploadDetailsForm", async () => {
  const React = await import("react");

  return {
    default: React.forwardRef(function MockUploadDetailsForm(
      {
        onCancel,
        onSuccess,
      }: {
        onCancel: () => void;
        onSuccess?: (trackId: string) => void;
      },
      ref: React.ForwardedRef<UploadFormHandle>,
    ) {
      useImperativeHandle(ref, () => ({
        triggerSubmit: () => onSuccess?.("track-123"),
        isUploading: false,
      }));

      return (
        <div data-test="upload-details-form">
          <button type="button" data-test="cancel-details" onClick={onCancel}>
            Cancel
          </button>
        </div>
      );
    }),
  };
});

vi.mock("../UploadSuccessView", () => ({
  default: ({ trackId }: { trackId: string | null }) => (
    <div data-test="upload-success-view" data-track-id={trackId ?? ""} />
  ),
}));

vi.mock("../UploadFooter", () => ({
  default: ({
    isDetailsMode,
    onSave,
  }: {
    isDetailsMode: boolean;
    onSave?: () => void;
    isLoading?: boolean;
  }) =>
    isDetailsMode ? (
      <div data-test="upload-footer">
        <button type="button" data-test="save-upload" onClick={onSave}>
          Save
        </button>
      </div>
    ) : null,
}));

describe("UploadPage", () => {
  beforeEach(() => {
    mocks.isAuthenticated = true;
    mocks.locationState = {};
    mocks.outletContext = createOutletContext();
    mocks.quotaPromise = Promise.resolve({
      canUpload: true,
      usedTracks: 0,
      trackLimit: 3,
    });
    vi.clearAllMocks();
  });

  it("renders the guest upload page when the user is not authenticated", () => {
    mocks.isAuthenticated = false;

    render(<UploadPage />);

    expect(screen.getByTestId("upload-guest-page")).toBeInTheDocument();
  });

  it("renders the home view and premium banner, then dismisses the banner", async () => {
    mocks.locationState = { premiumActivated: true };

    render(<UploadPage />);

    expect(
      screen.getByText(/you're now premium/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("upload-quota-bar")).toBeInTheDocument();
    expect(screen.getByTestId("drop-zone-upload")).toBeInTheDocument();
    expect(screen.getByTestId("record-section-upload")).toBeInTheDocument();

    const dismissButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("×"));
    expect(dismissButton).toBeDefined();

    if (!dismissButton) {
      throw new Error("Expected premium banner dismiss button");
    }

    await userEvent.click(dismissButton);

    expect(
      screen.queryByText(/you're now premium/i),
    ).not.toBeInTheDocument();
  });

  it("switches to details view when an uploaded file is selected", async () => {
    render(<UploadPage />);

    await userEvent.click(screen.getByTestId("drop-zone-upload"));

    expect(await screen.findByTestId("upload-details-form")).toBeInTheDocument();
    expect(mocks.outletContext.setTrackName).toHaveBeenCalledWith(
      "uploaded-track.wav",
    );
    expect(screen.getByTestId("upload-footer")).toBeInTheDocument();
  });

  it("uses the recorded audio fallback name for blob uploads", async () => {
    render(<UploadPage />);

    await userEvent.click(screen.getByTestId("record-section-upload"));

    expect(mocks.outletContext.setTrackName).toHaveBeenCalledWith(
      "Recorded_Audio.wav",
    );
  });

  it("submits the upload form through the footer and shows the success view", async () => {
    render(<UploadPage />);

    await userEvent.click(screen.getByTestId("drop-zone-upload"));
    expect(await screen.findByTestId("upload-footer")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("save-upload"));

    expect(await screen.findByTestId("upload-success-view")).toHaveAttribute(
      "data-track-id",
      "track-123",
    );
    expect(screen.queryByTestId("upload-footer")).not.toBeInTheDocument();
  });

  it("honors the outlet details mode on first render", async () => {
    mocks.outletContext.isDetailsMode = true;

    render(<UploadPage />);

    expect(await screen.findByTestId("upload-details-form")).toBeInTheDocument();
  });
});
