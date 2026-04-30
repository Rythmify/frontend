import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PremiumPromoModal from "./PremiumPromoModal";
import { getSubscriptionPlans } from "@/services/api/upload/subscription.service";

const mockNavigate = vi.fn();
const mockOnClose = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/services/api/upload/subscription.service", () => ({
  getSubscriptionPlans: vi.fn(),
}));

describe("PremiumPromoModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the premium price from the plans API", async () => {
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

    render(<PremiumPromoModal onClose={mockOnClose} />);

    expect(await screen.findByText("EGP 29.99")).toBeInTheDocument();
    expect(getSubscriptionPlans).toHaveBeenCalledTimes(1);
  });

  it("falls back to the default price when no premium plan is returned", async () => {
    vi.mocked(getSubscriptionPlans).mockResolvedValue([
      {
        subscription_plan_id: "free-plan",
        name: "free",
        price: "0.00",
        duration_days: null,
        track_limit: 3,
        playlist_limit: 2,
      },
    ] as any);

    render(<PremiumPromoModal onClose={mockOnClose} />);

    expect(await screen.findByText("EGP 29.99")).toBeInTheDocument();
  });

  it("closes from the CTA controls and navigates to the premium page", async () => {
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

    render(<PremiumPromoModal onClose={mockOnClose} />);

    await screen.findByText("EGP 29.99");
    fireEvent.click(screen.getByRole("button", { name: "Get Premium" }));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/premium");
  });

  it("closes from the close button", async () => {
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

    render(<PremiumPromoModal onClose={mockOnClose} />);

    await screen.findByText("EGP 29.99");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
