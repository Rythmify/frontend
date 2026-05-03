import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PlanPage from "./PlanPage";
import { getSubscriptionPlans, checkoutSubscription, getMyTransactions } from "@/services/api/upload/subscription.service";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/services/api/upload/subscription.service", () => ({
  getSubscriptionPlans: vi.fn(),
  checkoutSubscription: vi.fn(),
  getMyTransactions: vi.fn(),
}));

vi.mock("../../components/Premium/HeroSection", () => ({
  default: ({
    onGetStarted,
    isStarting,
  }: {
    onGetStarted: () => void;
    isStarting: boolean;
  }) => (
    <div data-test="hero-section">
      <button type="button" onClick={onGetStarted} data-test="hero-start">
        {isStarting ? "hero-loading" : "hero-ready"}
      </button>
    </div>
  ),
}));

vi.mock("../../components/Premium/PricingCards", () => ({
  default: ({
    onGetStarted,
    monthlyPrice,
    startError,
  }: {
    onGetStarted: () => void;
    monthlyPrice: number | null;
    startError: string | null;
  }) => (
    <div data-test="pricing-cards">
      <span>{monthlyPrice === null ? "no-price" : `price-${monthlyPrice}`}</span>
      {startError && <span>{startError}</span>}
      <button type="button" onClick={onGetStarted} data-test="pricing-start">
        pricing-start
      </button>
    </div>
  ),
}));

vi.mock("../../components/Premium/CompareTable", () => ({
  default: ({ monthlyPrice }: { monthlyPrice: number | null }) => (
    <div data-test="compare-table">
      {monthlyPrice === null ? "no-price" : `compare-${monthlyPrice}`}
    </div>
  ),
}));

describe("PlanPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSubscriptionPlans).mockResolvedValue([
      {
        subscription_plan_id: "free-plan",
        name: "free",
        price: "0.00",
        duration_days: null,
        track_limit: 3,
        playlist_limit: 2,
      },
      {
        subscription_plan_id: "premium-plan",
        name: "premium",
        price: "29.99",
        duration_days: 30,
        track_limit: null,
        playlist_limit: null,
      },
    ] as any);
  });

  it("loads the premium price and passes it to the page sections", async () => {
    render(<PlanPage />);

    await waitFor(() => {
      expect(screen.getByTestId("pricing-cards")).toHaveTextContent("price-29.99");
      expect(screen.getByTestId("compare-table")).toHaveTextContent("compare-29.99");
    });
    expect(getSubscriptionPlans).toHaveBeenCalled();
  });

  it("starts checkout and navigates to payment on success", async () => {
    vi.mocked(checkoutSubscription).mockResolvedValue({
      transaction_id: "txn-1",
      user_subscription_id: "sub-1",
      payment_url: "https://example.com",
      checkout_status: "pending",
    } as any);

    render(<PlanPage />);
    await screen.findByTestId("pricing-cards");

    fireEvent.click(screen.getByTestId("pricing-start"));

    await waitFor(() => {
      expect(checkoutSubscription).toHaveBeenCalledWith("premium-plan");
    });
    expect(mockNavigate).toHaveBeenCalledWith("/creator/payment", {
      state: { transaction_id: "txn-1" },
    });
  });

  it("reuses a pending checkout when the API reports one", async () => {
    vi.mocked(checkoutSubscription).mockRejectedValue({
      response: {
        data: {
          error: {
            code: "SUBSCRIPTION_CHECKOUT_PENDING",
          },
        },
      },
    });
    vi.mocked(getMyTransactions).mockResolvedValue([
      {
        transaction_id: "txn-pending",
        payment_status: "pending",
      },
    ] as any);

    render(<PlanPage />);
    await screen.findByTestId("pricing-cards");

    fireEvent.click(screen.getByTestId("pricing-start"));

    await waitFor(() => {
      expect(getMyTransactions).toHaveBeenCalled();
    });
    expect(mockNavigate).toHaveBeenCalledWith("/creator/payment", {
      state: { transaction_id: "txn-pending", isPending: true },
    });
  });
});
