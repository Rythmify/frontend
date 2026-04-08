import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import UserCard from "./UserCard";

// ─── Mock Setup ───────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const baseUser = {
  // Changed id from number to UUID string
  id: "687293a0-f8d2-4e5a-9c71-2b0d3e1f4a5c",
  username: "travis-scott",
  displayName: "Travis Scott",
  avatar: "https://example.com/avatar.jpg",
  followers: 6234000,
  isVerified: true,
};

// ─── Test Suite ───────────────────────────────────────────
describe("UserCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders display name", () => {
    render(<UserCard user={baseUser} />);
    expect(
      screen.getByTestId(`user-card-name-${baseUser.username}`),
    ).toHaveTextContent(baseUser.displayName);
  });

  it("renders avatar image when avatar url is provided", () => {
    render(<UserCard user={baseUser} />);
    const avatar = screen
      .getByTestId(`user-card-avatar-${baseUser.username}`)
      .querySelector("img");
    expect(avatar).toHaveAttribute("src", baseUser.avatar);
    expect(avatar).toHaveAttribute("alt", baseUser.displayName);
  });

  it("renders initial letter placeholder when no avatar", () => {
    const user = { ...baseUser, avatar: undefined };
    render(<UserCard user={user} />);
    const wrapper = screen.getByTestId(`user-card-avatar-${user.username}`);
    expect(wrapper.querySelector("img")).toBeNull();
    expect(wrapper).toHaveTextContent("T"); // first letter of "Travis Scott"
  });

  it("shows verified badge when isVerified is true", () => {
    render(<UserCard user={baseUser} />);
    expect(
      screen.getByTestId(`user-card-verified-${baseUser.username}`),
    ).toBeInTheDocument();
  });

  it("hides verified badge when isVerified is false", () => {
    const user = { ...baseUser, isVerified: false };
    render(<UserCard user={user} />);
    expect(
      screen.queryByTestId(`user-card-verified-${user.username}`),
    ).not.toBeInTheDocument();
  });

  it("navigates to /{username} on click", async () => {
    render(<UserCard user={baseUser} />);
    await userEvent.click(screen.getByTestId(`user-card-${baseUser.username}`));
    expect(mockNavigate).toHaveBeenCalledWith(`/${baseUser.username}`);
  });

  it("formats followers in millions", () => {
    render(<UserCard user={{ ...baseUser, followers: 6234000 }} />);
    expect(
      screen.getByTestId(`user-card-followers-${baseUser.username}`),
    ).toHaveTextContent("6.2M followers");
  });

  it("formats followers in thousands", () => {
    render(<UserCard user={{ ...baseUser, followers: 4500 }} />);
    expect(
      screen.getByTestId(`user-card-followers-${baseUser.username}`),
    ).toHaveTextContent("4.5K followers");
  });

  it("formats followers as raw number below 1000", () => {
    render(<UserCard user={{ ...baseUser, followers: 850 }} />);
    expect(
      screen.getByTestId(`user-card-followers-${baseUser.username}`),
    ).toHaveTextContent("850 followers");
  });
});
