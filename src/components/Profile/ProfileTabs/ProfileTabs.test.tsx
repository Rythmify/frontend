import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfileTabs from "@/components/Profile/ProfileTabs/ProfileTabs";

const mockNavigate = vi.fn();
const mockToggleFollow = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/components/UI/FollowButton", () => ({
  default: ({ username }: { username: string }) => (
    <button data-test={`follow-button-${username}`}>Follow</button>
  ),
}));

import { useAuthStore } from "@/stores/auth.store";

const defaultOwnerProps = {
  isOwner: true,
  selectedTab: "All",
  onTabChange: vi.fn(),
  onShare: vi.fn(),
  onEdit: vi.fn(),
  username: "me",
  displayName: "Me",
  tracks: 0,
};

const defaultVisitorProps = {
  isOwner: false,
  selectedTab: "All",
  onTabChange: vi.fn(),
  onShare: vi.fn(),
  username: "travis-scott",
  displayName: "Travis Scott",
  tracks: 174,
};

describe("ProfileTabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: [] },
      toggleFollow: mockToggleFollow,
    });
  });

  it("renders all tab labels", () => {
    render(<ProfileTabs {...defaultOwnerProps} />);
    [
      "All",
      "Popular tracks",
      "Tracks",
      "Albums",
      "Playlists",
      "Reposts",
    ].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
  });

  it("highlights the selected tab", () => {
    render(<ProfileTabs {...defaultOwnerProps} selectedTab="Tracks" />);
    const tracksTab = screen.getByTestId("tab-tracks");
    expect(tracksTab).toHaveClass("text-white");
  });

  it("calls onTabChange when a tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<ProfileTabs {...defaultOwnerProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByTestId("tab-tracks"));
    expect(onTabChange).toHaveBeenCalledWith("Tracks");
  });

  it("shows Share and Edit buttons for owner", () => {
    render(<ProfileTabs {...defaultOwnerProps} />);
    expect(screen.getByTestId("share-button")).toBeInTheDocument();
    expect(screen.getByTestId("edit-button")).toBeInTheDocument();
  });

  it("calls onShare when Share is clicked (owner)", () => {
    const onShare = vi.fn();
    render(<ProfileTabs {...defaultOwnerProps} onShare={onShare} />);
    fireEvent.click(screen.getByTestId("share-button"));
    expect(onShare).toHaveBeenCalled();
  });

  it("calls onEdit when Edit is clicked (owner)", () => {
    const onEdit = vi.fn();
    render(<ProfileTabs {...defaultOwnerProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByTestId("edit-button"));
    expect(onEdit).toHaveBeenCalled();
  });

  it("does not show Share/Edit for non-owner", () => {
    render(<ProfileTabs {...defaultVisitorProps} />);
    expect(screen.queryByTestId("edit-button")).not.toBeInTheDocument();
  });

  it("shows Station button when tracks > 0 for non-owner", () => {
    render(<ProfileTabs {...defaultVisitorProps} tracks={5} />);
    expect(screen.getByTestId("station-button")).toBeInTheDocument();
  });

  it("hides Station button when tracks === 0 for non-owner", () => {
    render(<ProfileTabs {...defaultVisitorProps} tracks={0} />);
    expect(screen.queryByTestId("station-button")).not.toBeInTheDocument();
  });

  it("shows FollowButton for non-owner", () => {
    render(<ProfileTabs {...defaultVisitorProps} />);
    expect(
      screen.getByTestId("follow-button-travis-scott"),
    ).toBeInTheDocument();
  });

  it("shows Share button for non-owner", () => {
    render(<ProfileTabs {...defaultVisitorProps} />);
    expect(screen.getByTestId("share-button")).toBeInTheDocument();
  });

  it("calls onShare when Share is clicked (visitor)", () => {
    const onShare = vi.fn();
    render(<ProfileTabs {...defaultVisitorProps} onShare={onShare} />);
    fireEvent.click(screen.getByTestId("share-button"));
    expect(onShare).toHaveBeenCalled();
  });

  it("shows more menu with Block and Report on ellipsis click", () => {
    render(<ProfileTabs {...defaultVisitorProps} />);
    fireEvent.click(screen.getByTestId("more-button"));
    expect(screen.getByTestId("block-button")).toBeInTheDocument();
    expect(screen.getByTestId("report-button")).toBeInTheDocument();
  });

  it("shows correct name in Block/Report", () => {
    render(<ProfileTabs {...defaultVisitorProps} />);
    fireEvent.click(screen.getByTestId("more-button"));
    expect(screen.getByTestId("block-button")).toHaveTextContent(
      "Block Travis Scott",
    );
    expect(screen.getByTestId("report-button")).toHaveTextContent(
      "Report Travis Scott",
    );
  });
});
