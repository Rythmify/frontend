import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AuthMainLayout from "@/components/layout/AuthMainLayout";

const mockSetUser = vi.fn();
const mockHydrateFromApi = vi.fn();
const mockGetMe = vi.fn();
const mockGetMySubscription = vi.fn();

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: (state: { isAuthenticated: boolean; setUser: typeof mockSetUser }) => unknown) =>
    selector({ isAuthenticated: true, setUser: mockSetUser }),
}));

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: (selector: (state: { hydrateFromApi: typeof mockHydrateFromApi }) => unknown) =>
    selector({ hydrateFromApi: mockHydrateFromApi }),
}));

vi.mock("@/services/auth.service", () => ({
  getMe: () => mockGetMe(),
  normalizeDateOfBirth: (value: string | null | undefined) => value ?? null,
}));

vi.mock("@/services/api/upload/subscription.service", () => ({
  getMySubscription: () => mockGetMySubscription(),
}));

vi.mock("@/components/layout/MainNavbar", () => ({
  default: () => <div data-test="mock-main-navbar" />,
}));

vi.mock("@/components/player/StickyPlayer", () => ({
  default: () => <div data-test="mock-sticky-player" />,
}));

describe("AuthMainLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMe.mockResolvedValue({
      data: {
        id: "u1",
        username: "me",
        display_name: "Me",
        first_name: "Test",
        last_name: "User",
        bio: "",
        email: "me@example.com",
        role: "listener",
        profile_picture: null,
        cover_photo: null,
        city: null,
        country: null,
        following_ids: [],
        followers_ids: [],
        date_of_birth: "2001-02-02",
        gender: "female",
      },
    });
    mockGetMySubscription.mockResolvedValue({
      data: { user_subscription_id: null },
    });
  });

  it("hydrates auth store with basic profile fields from the backend", async () => {
    render(
      <MemoryRouter>
        <AuthMainLayout />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          date_of_birth: "2001-02-02",
          gender: "female",
        }),
      );
    });

    expect(mockHydrateFromApi).toHaveBeenCalled();
  });
});
