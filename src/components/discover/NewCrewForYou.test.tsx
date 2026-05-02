import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NewCrewForYou from "./NewCrewForYou";

// ─── Mocks ────────────────────────────────────────────────

vi.mock("@/services/api/discover.service", () => ({
  getSuggestedUsers: vi.fn(),
}));

vi.mock("@/services/api/discover.mapper", () => ({
  mapSuggestedUserToUser: (u: any) => ({
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    followers: u.followers_count ?? 0,
  }),
}));

vi.mock("@/components/discover/HorizontalCarousel", () => ({
  default: ({ title, children }: any) => (
    <div data-test="carousel-wrapper">
      <h2 data-test="carousel-title">{title}</h2>
      <div data-test="carousel-scroll-container">{children}</div>
    </div>
  ),
}));

vi.mock("@/components/UI/UserCard/UserCard", () => ({
  default: ({ user }: any) => <div data-test={`user-card-${user.id}`} />,
}));

import { getSuggestedUsers } from "@/services/api/discover.service";

// ─── Fixtures ─────────────────────────────────────────────

const makeSuggestedUser = (id: string) => ({
  id,
  username: `user_${id}`,
  display_name: `User ${id}`,
  followers_count: 100,
});

// ─── Test Suite ───────────────────────────────────────────

describe("NewCrewForYou", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the section container", async () => {
    vi.mocked(getSuggestedUsers).mockResolvedValue({ data: [] } as any);
    render(<NewCrewForYou />);
    expect(screen.getByTestId("section-new-crew-for-you")).toBeInTheDocument();
  });

  it("renders the correct carousel title", async () => {
    vi.mocked(getSuggestedUsers).mockResolvedValue({
      data: [makeSuggestedUser("u1")],
    } as any);
    render(<NewCrewForYou />);
    await waitFor(() =>
      expect(screen.getByTestId("user-card-u1")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("carousel-title")).toHaveTextContent(
      "New crew, suggested for you",
    );
  });

  it("renders a UserCard for each suggested user", async () => {
    vi.mocked(getSuggestedUsers).mockResolvedValue({
      data: [makeSuggestedUser("u1"), makeSuggestedUser("u2")],
    } as any);
    render(<NewCrewForYou />);
    await waitFor(() => {
      expect(screen.getByTestId("user-card-u1")).toBeInTheDocument();
      expect(screen.getByTestId("user-card-u2")).toBeInTheDocument();
    });
  });

  it("renders the correct number of user cards", async () => {
    vi.mocked(getSuggestedUsers).mockResolvedValue({
      data: [makeSuggestedUser("u1"), makeSuggestedUser("u2"), makeSuggestedUser("u3")],
    } as any);
    render(<NewCrewForYou />);
    await waitFor(() =>
      expect(screen.getAllByTestId(/^user-card-/)).toHaveLength(3),
    );
  });

  it("renders no cards when API returns empty array", async () => {
    vi.mocked(getSuggestedUsers).mockResolvedValue({ data: [] } as any);
    render(<NewCrewForYou />);
    await waitFor(() => {
      expect(screen.queryAllByTestId(/^user-card-/)).toHaveLength(0);
    });
  });

  it("does not crash when getSuggestedUsers rejects", async () => {
    vi.mocked(getSuggestedUsers).mockRejectedValue(new Error("Network error"));
    render(<NewCrewForYou />);
    await waitFor(() =>
      expect(screen.getByTestId("section-new-crew-for-you")).toBeInTheDocument(),
    );
  });
});
