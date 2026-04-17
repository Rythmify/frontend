import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfileHeader from "@/components/Profile/ProfileHeader/ProfileHeader";

const mockSetUser = vi.fn();
const mockUploadAvatar = vi.fn();
const mockDeleteAvatar = vi.fn();
const mockUploadCover = vi.fn();
const mockDeleteCover = vi.fn();

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  uploadAvatar: (...args: unknown[]) => mockUploadAvatar(...args),
  deleteAvatar: (...args: unknown[]) => mockDeleteAvatar(...args),
  uploadCover: (...args: unknown[]) => mockUploadCover(...args),
  deleteCover: (...args: unknown[]) => mockDeleteCover(...args),
}));

import { useAuthStore } from "@/stores/auth.store";

const mockUser = {
  id: "1",
  username: "testuser",
  displayName: "Test User",
  firstName: "Test",
  lastName: "User",
  bio: "",
  email: "test@test.com",
  role: "listener" as const,
  isPro: false,
  following_ids: [],
  avatar: "",
  coverUrl: "",
  location: "Cairo, Egypt",
};

describe("ProfileHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteAvatar.mockResolvedValue(undefined);
    mockDeleteCover.mockResolvedValue(undefined);
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      setUser: mockSetUser,
    });
  });

  it("renders display name", () => {
    render(<ProfileHeader user={mockUser} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("renders username", () => {
    render(<ProfileHeader user={mockUser} />);
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("renders location when present", () => {
    render(<ProfileHeader user={mockUser} />);
    expect(screen.getByText("Cairo, Egypt")).toBeInTheDocument();
  });

  it("does not render location when empty", () => {
    render(<ProfileHeader user={{ ...mockUser, location: "" }} />);
    expect(screen.queryByText("Cairo, Egypt")).not.toBeInTheDocument();
  });

  it("renders first letter of username when no avatar", () => {
    render(<ProfileHeader user={mockUser} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders avatar image when avatar is provided", () => {
    render(
      <ProfileHeader
        user={{ ...mockUser, avatar: "https://example.com/avatar.jpg" }}
      />,
    );
    expect(screen.getByTestId("avatar-image")).toHaveAttribute(
      "src",
      "https://example.com/avatar.jpg",
    );
  });

  it("does not show cover update button for non-owner", () => {
    render(<ProfileHeader user={mockUser} isOwner={false} />);
    expect(screen.queryByTestId("cover-update-button")).not.toBeInTheDocument();
  });

  it("shows cover upload button for owner with no cover", () => {
    render(<ProfileHeader user={mockUser} isOwner={true} />);
    fireEvent.mouseEnter(
      screen.getByTestId("cover-update-button").closest("div")!,
    );
    expect(screen.getByTestId("cover-update-button")).toHaveTextContent(
      "Upload header image",
    );
  });

  it("shows avatar file input for owner", () => {
    render(<ProfileHeader user={mockUser} isOwner={true} />);
    expect(screen.getByTestId("avatar-file-input")).toBeInTheDocument();
  });

  it("shows cover file input for owner", () => {
    render(<ProfileHeader user={mockUser} isOwner={true} />);
    expect(screen.getByTestId("cover-file-input")).toBeInTheDocument();
  });

  it("does not show avatar update button when not hovering", () => {
    render(<ProfileHeader user={mockUser} isOwner={true} />);
    expect(
      screen.queryByTestId("avatar-update-button"),
    ).not.toBeInTheDocument();
  });

  it("shows avatar update button on hover for owner", () => {
    render(<ProfileHeader user={mockUser} isOwner={true} />);
    const avatarContainer = screen
      .getByTestId("avatar-file-input")
      .closest("div")
      ?.querySelector(".rounded-full") as HTMLElement;
    fireEvent.mouseEnter(avatarContainer!);
    expect(screen.getByTestId("avatar-update-button")).toBeInTheDocument();
  });

  it("shows replace and delete options when avatar update menu is open", () => {
    render(<ProfileHeader user={mockUser} isOwner={true} />);
    const avatarContainer = screen
      .getByTestId("avatar-file-input")
      .closest("div.relative")
      ?.querySelector(".rounded-full") as HTMLElement;
    fireEvent.mouseEnter(avatarContainer!);
    fireEvent.click(screen.getByTestId("avatar-update-button"));
    expect(screen.getByTestId("avatar-replace-button")).toBeInTheDocument();
    expect(screen.getByTestId("avatar-delete-button")).toBeInTheDocument();
  });

  it("calls setUser with undefined avatar on delete", async () => {
    render(
      <ProfileHeader
        user={{ ...mockUser, avatar: "https://example.com/avatar.jpg" }}
        isOwner={true}
      />,
    );
    const avatarContainer = screen
      .getByTestId("avatar-image")
      .closest(".rounded-full") as HTMLElement;
    fireEvent.mouseEnter(avatarContainer!);
    fireEvent.click(screen.getByTestId("avatar-update-button"));
    fireEvent.click(screen.getByTestId("avatar-delete-button"));
    expect(mockSetUser).toHaveBeenCalledWith(
      expect.objectContaining({ avatar: undefined }),
    );
  });

  it("shows cover replace and delete options when cover menu is open", () => {
    render(
      <ProfileHeader
        user={{ ...mockUser, coverUrl: "https://example.com/cover.jpg" }}
        isOwner={true}
      />,
    );
    fireEvent.click(screen.getByTestId("cover-update-button"));
    expect(screen.getByTestId("cover-replace-button")).toBeInTheDocument();
    expect(screen.getByTestId("cover-delete-button")).toBeInTheDocument();
  });

  it("calls setUser with undefined coverUrl on cover delete", async () => {
    render(
      <ProfileHeader
        user={{ ...mockUser, coverUrl: "https://example.com/cover.jpg" }}
        isOwner={true}
      />,
    );
    const coverDiv = document.querySelector(
      "[style*='cover.jpg']",
    ) as HTMLElement;
    fireEvent.mouseEnter(coverDiv);
    fireEvent.click(screen.getByTestId("cover-update-button"));
    fireEvent.click(screen.getByTestId("cover-delete-button"));
    expect(mockSetUser).toHaveBeenCalledWith(
      expect.objectContaining({ coverUrl: undefined }),
    );
  });

  it("uses username as display name fallback when displayName is empty", () => {
    render(<ProfileHeader user={{ ...mockUser, displayName: "" }} />);
    expect(screen.getAllByText("testuser").length).toBeGreaterThan(0);
  });
});
