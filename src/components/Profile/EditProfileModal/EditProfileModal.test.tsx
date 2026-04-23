import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditProfileModal from "@/components/Profile/EditProfileModal/EditProfileModal";

const mockOnClose = vi.fn();
const mockOnSave = vi.fn();
const mockSetUser = vi.fn();
const mockUploadAvatar = vi.fn();

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({
    user: {
      id: "1",
      username: "testuser",
      displayName: "Test User",
      firstName: "Test",
      lastName: "User",
      bio: "My bio",
      email: "test@test.com",
      role: "listener",
      isPro: false,
      following_ids: [],
      avatar: "",
    },
    setUser: mockSetUser,
  }),
}));

vi.mock("@/services/user.service", () => ({
  uploadAvatar: (...args: unknown[]) => mockUploadAvatar(...args),
}));

const defaultUser = {
  username: "testuser",
  displayName: "Test User",
  firstName: "Test",
  lastName: "User",
  bio: "My bio",
  city: "Cairo",
  country: "Egypt",
  avatar: "",
};

describe("EditProfileModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadAvatar.mockResolvedValue({ profile_picture: "https://example.com/new-avatar.jpg" });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test-avatar");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  it("renders the modal", () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    expect(screen.getByText("Edit your Profile")).toBeInTheDocument();
  });

  it("renders all input fields", () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    expect(screen.getByTestId("edit-display-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("edit-first-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("edit-last-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("edit-city-input")).toBeInTheDocument();
    expect(screen.getByTestId("edit-country-input")).toBeInTheDocument();
    expect(screen.getByTestId("edit-bio-input")).toBeInTheDocument();
  });

  it("pre-fills fields with user data", () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    expect(screen.getByTestId("edit-display-name-input")).toHaveValue(
      "Test User",
    );
    expect(screen.getByTestId("edit-first-name-input")).toHaveValue("Test");
    expect(screen.getByTestId("edit-last-name-input")).toHaveValue("User");
    expect(screen.getByTestId("edit-city-input")).toHaveValue("Cairo");
    expect(screen.getByTestId("edit-country-input")).toHaveValue("Egypt");
    expect(screen.getByTestId("edit-bio-input")).toHaveValue("My bio");
  });

  it("shows username in profile URL", () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-cancel-button"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-modal-close-button"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onSave with correct data on Save", () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-save-button"));
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: "Test User",
        firstName: "Test",
        lastName: "User",
        bio: "My bio",
        city: "Cairo",
        country: "Egypt",
        location: "Cairo, Egypt",
        avatarFile: null,
      }),
    );
  });

  it("shows validation error when display name is empty", () => {
    render(
      <EditProfileModal
        user={{ ...defaultUser, displayName: "" }}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-save-button"));
    expect(screen.getByText("Display name is required.")).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("shows validation error when display name is numbers only", () => {
    render(
      <EditProfileModal
        user={{ ...defaultUser, displayName: "12345" }}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-save-button"));
    expect(
      screen.getByText("Display name cannot be numbers only."),
    ).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("shows validation error when first name is numbers only", () => {
    render(
      <EditProfileModal
        user={{ ...defaultUser, firstName: "12345" }}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-save-button"));
    expect(
      screen.getByText("First name cannot be numbers only."),
    ).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("shows validation error when city is numbers only", () => {
    render(
      <EditProfileModal
        user={{ ...defaultUser, city: "12345" }}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-save-button"));
    expect(screen.getByText("City cannot be numbers only.")).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("shows validation error when country is numbers only", () => {
    render(
      <EditProfileModal
        user={{ ...defaultUser, country: "12345" }}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-save-button"));
    expect(
      screen.getByText("Country cannot be numbers only."),
    ).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("clears validation error when display name is typed", () => {
    render(
      <EditProfileModal
        user={{ ...defaultUser, displayName: "" }}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-save-button"));
    expect(screen.getByText("Display name is required.")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("edit-display-name-input"), {
      target: { value: "New Name" },
    });
    expect(
      screen.queryByText("Display name is required."),
    ).not.toBeInTheDocument();
  });

  it("updates display name field on input", () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.change(screen.getByTestId("edit-display-name-input"), {
      target: { value: "New Display Name" },
    });
    expect(screen.getByTestId("edit-display-name-input")).toHaveValue(
      "New Display Name",
    );
  });

  it("updates bio field on input", () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.change(screen.getByTestId("edit-bio-input"), {
      target: { value: "Updated bio" },
    });
    expect(screen.getByTestId("edit-bio-input")).toHaveValue("Updated bio");
  });

  it("renders Add link and Add support link buttons", () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    expect(screen.getByTestId("add-link-button")).toBeInTheDocument();
    expect(screen.getByTestId("add-support-link-button")).toBeInTheDocument();
  });

  it("renders avatar file input", () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    expect(screen.getByTestId("edit-avatar-input")).toBeInTheDocument();
  });

  it("uploads avatar image when a file is selected", async () => {
    render(
      <EditProfileModal
        user={defaultUser}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const input = screen.getByTestId("edit-avatar-input") as HTMLInputElement;
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockUploadAvatar).toHaveBeenCalledWith(file);

    expect(await screen.findByTestId("edit-avatar-preview")).toHaveAttribute(
      "src",
      "https://example.com/new-avatar.jpg",
    );
    expect(mockSetUser).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar: "https://example.com/new-avatar.jpg",
      }),
    );
  });

  it("location is only city when country is empty", () => {
    render(
      <EditProfileModal
        user={{ ...defaultUser, country: "" }}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-save-button"));
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ location: "Cairo" }),
    );
  });

  it("location is only country when city is empty", () => {
    render(
      <EditProfileModal
        user={{ ...defaultUser, city: "" }}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-save-button"));
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ location: "Egypt" }),
    );
  });

  it("location is empty string when both city and country are empty", () => {
    render(
      <EditProfileModal
        user={{ ...defaultUser, city: "", country: "" }}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    fireEvent.click(screen.getByTestId("edit-save-button"));
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ location: "" }),
    );
  });
});
