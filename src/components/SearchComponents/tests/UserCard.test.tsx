import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/components/UI/FollowButton", () => ({
  default: ({ username, userId }: { username: string; userId: string }) => (
    <button data-test="follow-button" data-username={username} data-userid={userId}>
      Follow
    </button>
  ),
}));

vi.mock("@/components/UI/UserAvatar", () => ({
  default: ({
    src,
    name,
    alt,
    wrapperClassName,
    imageClassName,
    initialsClassName,
  }: any) => (
    <div
      data-test="user-avatar"
      data-src={src ?? "null"}
      data-name={name}
      data-alt={alt}
      data-wrapper-class={wrapperClassName}
      data-image-class={imageClassName}
      data-initials-class={initialsClassName}
    />
  ),
}));

// ─── Import after mocks ───────────────────────────────────────────────────────

import UserCard from "@/components/SearchComponents/UserCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderUserCard(props: Partial<React.ComponentProps<typeof UserCard>> = {}) {
  const defaults = {
    id: "user-1",
    username: "johndoe",
    displayName: "John Doe",
    avatarUrl: "https://example.com/avatar.jpg",
    location: "Cairo, EG",
    followersCount: 1234,
  };
  return render(
    <MemoryRouter>
      <UserCard {...defaults} {...props} />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("UserCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the card container with correct data-test attribute", () => {
      renderUserCard({ id: "abc-123" });
      expect(document.querySelector('[data-test="user-card-abc-123"]')).toBeInTheDocument();
    });

    it("renders the display name", () => {
      renderUserCard({ displayName: "Jane Smith" });
      expect(screen.getByTestId("user-card-name")).toHaveTextContent("Jane Smith");
    });

    it("renders the location when provided", () => {
      renderUserCard({ location: "Cairo, EG" });
      expect(screen.getByText("Cairo, EG")).toBeInTheDocument();
    });

    it("does not render location when null", () => {
      renderUserCard({ location: null });
      expect(screen.queryByText("Cairo, EG")).not.toBeInTheDocument();
    });

    it("does not render location when undefined", () => {
      renderUserCard({ location: undefined });
      // No location span rendered
      expect(document.querySelector(".text-text-secondary.truncate")).not.toBeInTheDocument();
    });

    it("renders followers count when provided", () => {
      renderUserCard({ followersCount: 5000 });
      expect(screen.getByTestId("user-card-followers")).toHaveTextContent("5,000 followers");
    });

    it("formats large follower counts with locale separator", () => {
      renderUserCard({ followersCount: 1000000 });
      expect(screen.getByTestId("user-card-followers")).toHaveTextContent("1,000,000 followers");
    });

    it("renders 0 followers correctly", () => {
      renderUserCard({ followersCount: 0 });
      expect(screen.getByTestId("user-card-followers")).toHaveTextContent("0 followers");
    });

    it("does not render followers section when followersCount is undefined", () => {
      renderUserCard({ followersCount: undefined });
      expect(screen.queryByTestId("user-card-followers")).not.toBeInTheDocument();
    });

    it("renders the UserAvatar component", () => {
      renderUserCard({ avatarUrl: "https://img.example.com/pic.jpg", displayName: "John Doe" });
      const avatar = screen.getByTestId("user-avatar");
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute("data-src", "https://img.example.com/pic.jpg");
      expect(avatar).toHaveAttribute("data-name", "John Doe");
      expect(avatar).toHaveAttribute("data-alt", "John Doe");
    });

    it("passes null avatarUrl to UserAvatar as 'null' string", () => {
      renderUserCard({ avatarUrl: null });
      expect(screen.getByTestId("user-avatar")).toHaveAttribute("data-src", "null");
    });

    it("passes correct className props to UserAvatar", () => {
      renderUserCard();
      const avatar = screen.getByTestId("user-avatar");
      expect(avatar).toHaveAttribute("data-wrapper-class", expect.stringContaining("rounded-full"));
      expect(avatar).toHaveAttribute("data-image-class", expect.stringContaining("object-cover"));
      expect(avatar).toHaveAttribute("data-initials-class", expect.stringContaining("font-bold"));
    });

    it("renders the FollowButton with correct username and userId", () => {
      renderUserCard({ username: "janedoe", id: "user-99" });
      const btn = screen.getByTestId("follow-button");
      expect(btn).toHaveAttribute("data-username", "janedoe");
      expect(btn).toHaveAttribute("data-userid", "user-99");
    });

    it("renders a user icon inside the followers section", () => {
      renderUserCard({ followersCount: 10 });
      const followersEl = screen.getByTestId("user-card-followers");
      expect(followersEl.querySelector(".fa-user")).toBeInTheDocument();
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  describe("navigation", () => {
    it("navigates to user profile on avatar click", async () => {
      const user = userEvent.setup();
      renderUserCard({ username: "johndoe" });

      await user.click(screen.getByTestId("user-card-avatar").closest("div")!);
      expect(mockNavigate).toHaveBeenCalledWith("/johndoe");
    });

    it("navigates to user profile on display name click", async () => {
      const user = userEvent.setup();
      renderUserCard({ username: "johndoe" });

      await user.click(screen.getByTestId("user-card-name"));
      expect(mockNavigate).toHaveBeenCalledWith("/johndoe");
    });

    it("navigates to followers page on followers click", async () => {
      const user = userEvent.setup();
      renderUserCard({ username: "johndoe", followersCount: 42 });

      await user.click(screen.getByTestId("user-card-followers"));
      expect(mockNavigate).toHaveBeenCalledWith("/johndoe/follower");
    });

    it("navigates with correct username when username differs from id", async () => {
      const user = userEvent.setup();
      renderUserCard({ id: "42", username: "special_user" });

      await user.click(screen.getByTestId("user-card-name"));
      expect(mockNavigate).toHaveBeenCalledWith("/special_user");
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("renders without crashing when all optional props are omitted", () => {
      render(
        <MemoryRouter>
          <UserCard id="u1" username="user1" displayName="User One" />
        </MemoryRouter>,
      );
      expect(screen.getByTestId("user-card-name")).toBeInTheDocument();
    });

    it("handles special characters in display name", () => {
      renderUserCard({ displayName: "Ö'Neil & Co." });
      expect(screen.getByTestId("user-card-name")).toHaveTextContent("Ö'Neil & Co.");
    });

    it("handles very long display name without crashing", () => {
      const longName = "A".repeat(200);
      renderUserCard({ displayName: longName });
      expect(screen.getByTestId("user-card-name")).toHaveTextContent(longName);
    });

    it("handles username with special URL-safe characters", async () => {
      const user = userEvent.setup();
      renderUserCard({ username: "user.name_123" });
      await user.click(screen.getByTestId("user-card-name"));
      expect(mockNavigate).toHaveBeenCalledWith("/user.name_123");
    });

    it("calls navigate only once per click on display name", async () => {
      const user = userEvent.setup();
      renderUserCard();
      await user.click(screen.getByTestId("user-card-name"));
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it("calls navigate only once per click on followers", async () => {
      const user = userEvent.setup();
      renderUserCard({ followersCount: 5 });
      await user.click(screen.getByTestId("user-card-followers"));
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
