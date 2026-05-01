import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PaymentPage from "./PaymentPage";
import { getSubscriptionPlans, confirmMockPayment } from "@/services/api/upload/subscription.service";
import { useAuthStore } from "@/stores/auth.store";

const mockNavigate = vi.fn();
const mockSetUser = vi.fn();
let mockLocationState: { transaction_id?: string; isPending?: boolean } | null = {
  transaction_id: "txn-1",
};

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: mockLocationState }),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/services/api/upload/subscription.service", () => ({
  getSubscriptionPlans: vi.fn(),
  confirmMockPayment: vi.fn(),
}));

describe("PaymentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = { transaction_id: "txn-1" };
    vi.mocked(getSubscriptionPlans).mockResolvedValue([
      {
        subscription_plan_id: "premium-plan",
        name: "premium",
        price: "29.99",
        duration_days: 30,
        track_limit: null,
        playlist_limit: null,
      },
    ] as any);
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      setUser: mockSetUser,
    } as any);
  });

  function setAuthUser(user: any) {
    vi.mocked(useAuthStore).mockReturnValue({
      user,
      setUser: mockSetUser,
    } as any);
  }

  it("shows the premium purchase flow and completes payment", async () => {
    setAuthUser({
      id: "user-1",
      username: "mariam",
      displayName: "Mariam",
      isPro: false,
    });
    vi.mocked(confirmMockPayment).mockResolvedValue(undefined);

    render(<PaymentPage />);

    expect(await screen.findByText("Get Premium")).toBeInTheDocument();
    expect(screen.getAllByText(/EGP 29\.99\/month/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Apple Pay" }));

    const submitButton = screen.getByRole("button", { name: /Continue with.*Pay/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(confirmMockPayment).toHaveBeenCalledWith("txn-1");
    });
    expect(mockSetUser).toHaveBeenCalledWith(
      expect.objectContaining({ isPro: true }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/upload", {
      state: { premiumActivated: true },
    });
  });

  it("renders the pending checkout notice when the location state says so", async () => {
    setAuthUser({
      id: "user-1",
      username: "mariam",
      displayName: "Mariam",
      isPro: false,
    });
    mockLocationState = { transaction_id: "txn-1", isPending: true };

    render(<PaymentPage />);

    expect(
      await screen.findByText("You have a pending checkout"),
    ).toBeInTheDocument();
  });

  it("shows the already premium state for active subscribers", () => {
    setAuthUser({
      id: "user-1",
      username: "mariam",
      displayName: "Mariam",
      isPro: true,
    });

    render(<PaymentPage />);

    expect(screen.getByText("You're already on Premium")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Go to Upload" }));
    expect(mockNavigate).toHaveBeenCalledWith("/upload");
  });
});
