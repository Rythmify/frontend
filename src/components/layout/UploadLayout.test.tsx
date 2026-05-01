import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UploadLayout from "./UploadLayout";

const layoutMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  outletContext: null as
    | null
    | {
        isDetailsMode: boolean;
        setIsDetailsMode: (value: boolean) => void;
        setTrackName: (value: string) => void;
        setUploadProgress: (value: number) => void;
        setUploadSuccess: (value: boolean) => void;
      },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => layoutMocks.navigate,
    Outlet: ({ context }: { context: typeof layoutMocks.outletContext }) => {
      layoutMocks.outletContext = context;
      return <div data-test="upload-layout-outlet" />;
    },
  };
});

describe("UploadLayout", () => {
  beforeEach(() => {
    layoutMocks.navigate.mockClear();
    layoutMocks.outletContext = null;
    vi.clearAllMocks();
  });

  const renderLayout = () =>
    render(
      <MemoryRouter>
        <UploadLayout />
      </MemoryRouter>,
    );

  it("renders the default upload header and exits back to artists from the home view", async () => {
    renderLayout();

    expect(screen.getByText(/^Upload$/)).toBeInTheDocument();
    expect(screen.getByTestId("upload-layout-outlet")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("exit-upload-button"));

    expect(layoutMocks.navigate).toHaveBeenCalledWith("/artists");
  });

  it("switches to the details header when the outlet sets details mode", async () => {
    renderLayout();

    await act(async () => {
      layoutMocks.outletContext?.setIsDetailsMode(true);
      layoutMocks.outletContext?.setTrackName("Demo Track");
      layoutMocks.outletContext?.setUploadProgress(45);
    });

    expect(screen.getByText(/track info/i)).toBeInTheDocument();
    expect(screen.getByText("Demo Track")).toBeInTheDocument();
    expect(screen.getByText(/uploading 45%/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /replace track/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /replace track/i }));

    expect(screen.getByText(/^Upload$/)).toBeInTheDocument();
    expect(screen.queryByText("Demo Track")).not.toBeInTheDocument();
  });

  it("opens the quit modal when exiting details mode and confirms navigation", async () => {
    renderLayout();

    await act(async () => {
      layoutMocks.outletContext?.setIsDetailsMode(true);
      layoutMocks.outletContext?.setTrackName("Demo Track");
    });

    await userEvent.click(screen.getByTestId("exit-upload-button"));

    expect(
      screen.getByText(/are you sure you want to quit/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("quit-upload-button"));

    expect(layoutMocks.navigate).toHaveBeenCalledWith("/artists");
  });

  it("closes the quit modal without navigating when the modal close button is used", async () => {
    renderLayout();

    await act(async () => {
      layoutMocks.outletContext?.setIsDetailsMode(true);
      layoutMocks.outletContext?.setTrackName("Demo Track");
    });

    await userEvent.click(screen.getByTestId("exit-upload-button"));
    expect(
      screen.getByText(/are you sure you want to quit/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("close-quit-modal-button"));

    expect(layoutMocks.navigate).not.toHaveBeenCalled();
    expect(
      screen.queryByText(/are you sure you want to quit/i),
    ).not.toBeInTheDocument();
  });

  it("navigates directly to artists after a successful upload", async () => {
    renderLayout();

    await act(async () => {
      layoutMocks.outletContext?.setUploadSuccess(true);
    });

    await userEvent.click(screen.getByTestId("exit-upload-button"));

    expect(layoutMocks.navigate).toHaveBeenCalledWith("/artists");
    expect(screen.queryByText(/^Track Info$/)).not.toBeInTheDocument();
  });
});
