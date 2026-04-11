import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SettingsPage from "@/pages/settings/SettingsPage";

const mockChangeEmail = vi.fn();
const mockDeleteMyAccount = vi.fn();
const mockForgotPassword = vi.fn();
const mockUpdateMeAccount = vi.fn();
const mockDisconnectProvider = vi.fn();
const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockSetUser = vi.fn();

vi.mock("@/services/auth.service", () => ({
  changeEmail: (...args: unknown[]) => mockChangeEmail(...args),
  deleteMyAccount: (...args: unknown[]) => mockDeleteMyAccount(...args),
  forgotPassword: (...args: unknown[]) => mockForgotPassword(...args),
  updateMeAccount: (...args: unknown[]) => mockUpdateMeAccount(...args),
  disconnectProvider: (...args: unknown[]) => mockDisconnectProvider(...args),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      id: "u1",
      username: "me",
      displayName: "Me",
      firstName: "Test",
      lastName: "User",
      bio: "",
      email: "me@example.com",
      role: "listener",
      isPro: false,
      following_ids: [],
      date_of_birth: "2000-01-01",
      gender: "male",
    },
    logout: mockLogout,
    setUser: mockSetUser,
  })),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderSettings(initialPath = "/settings") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/settings" element={<SettingsPage />}>
          <Route
            path="privacy"
            element={<div data-test="mock-nested-settings-page">Nested page</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as typeof window.matchMedia;
  });

  it("renders the account settings page on /settings", () => {
    renderSettings();

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Change theme")).toBeInTheDocument();
    expect(screen.getByText("Email addresses")).toBeInTheDocument();
    expect(screen.getByTestId("settings-show-add-email-button")).toBeInTheDocument();
  });

  it("renders nested settings routes instead of account content", () => {
    renderSettings("/settings/privacy");

    expect(screen.getByTestId("mock-nested-settings-page")).toBeInTheDocument();
    expect(screen.queryByText("Change theme")).not.toBeInTheDocument();
  });

  it("shows and hides the add email input", () => {
    renderSettings();

    fireEvent.click(screen.getByTestId("settings-show-add-email-button"));
    expect(screen.getByTestId("settings-new-email-input")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("settings-cancel-add-email-button"));
    expect(screen.queryByTestId("settings-new-email-input")).not.toBeInTheDocument();
  });

  it("shows an error toast when the new email matches the current email", async () => {
    renderSettings();

    fireEvent.click(screen.getByTestId("settings-show-add-email-button"));
    fireEvent.change(screen.getByTestId("settings-new-email-input"), {
      target: { value: "me@example.com" },
    });
    fireEvent.click(screen.getByTestId("settings-add-email-button"));

    expect(
      await screen.findByText("This email is already your primary email address."),
    ).toBeInTheDocument();
    expect(mockChangeEmail).not.toHaveBeenCalled();
  });

  it("shows an error toast when the new email is invalid", async () => {
    renderSettings();

    fireEvent.click(screen.getByTestId("settings-show-add-email-button"));
    fireEvent.change(screen.getByTestId("settings-new-email-input"), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByTestId("settings-add-email-button"));

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();
    expect(mockChangeEmail).not.toHaveBeenCalled();
  });

  it("shows a success toast when a new email is added", async () => {
    mockChangeEmail.mockResolvedValue({});

    renderSettings();

    fireEvent.click(screen.getByTestId("settings-show-add-email-button"));
    fireEvent.change(screen.getByTestId("settings-new-email-input"), {
      target: { value: "new@example.com" },
    });
    fireEvent.click(screen.getByTestId("settings-add-email-button"));

    expect(mockChangeEmail).toHaveBeenCalledWith("new@example.com");
    expect(
      await screen.findByText("Verification email sent to new@example.com"),
    ).toBeInTheDocument();
  });

  it("deletes the account after confirmation", async () => {
    mockDeleteMyAccount.mockResolvedValue({});

    renderSettings();

    fireEvent.click(screen.getByTestId("settings-delete-account-button"));
    fireEvent.click(screen.getByTestId("settings-delete-account-confirm-input"));
    fireEvent.click(screen.getByTestId("settings-delete-account-confirm-button"));

    await waitFor(() => {
      expect(mockDeleteMyAccount).toHaveBeenCalled();
    });
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
