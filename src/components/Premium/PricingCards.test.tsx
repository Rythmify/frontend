import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PricingCards from "./PricingCards";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

describe("PricingCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: { isPro: false },
    });
  });

  it("renders the premium plan with the fetched price", () => {
    render(
      <PricingCards
        onGetStarted={vi.fn()}
        isStarting={false}
        startError={null}
        disabled={false}
        monthlyPrice={29.99}
      />,
    );

    expect(screen.getByRole("heading", { name: "Available plan." })).toBeInTheDocument();
    expect(screen.getByText("Premium")).toBeInTheDocument();
    expect(screen.getByText("EGP 29.99")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
    expect(screen.getByText("Unlimited uploads")).toBeInTheDocument();
    expect(screen.getByText("Offline listening downloads")).toBeInTheDocument();
    expect(screen.getByText("Ad-free listening")).toBeInTheDocument();
  });

  it("calls the provided starter handler", () => {
    const onGetStarted = vi.fn();

    render(
      <PricingCards
        onGetStarted={onGetStarted}
        isStarting={false}
        startError={null}
        disabled={false}
        monthlyPrice={29.99}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Get started" }));
    expect(onGetStarted).toHaveBeenCalledTimes(1);
  });

  it("shows the current plan state for pro users", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { isPro: true },
    });

    render(
      <PricingCards
        onGetStarted={vi.fn()}
        isStarting={false}
        startError="Something went wrong."
        disabled={false}
        monthlyPrice={29.99}
      />,
    );

    expect(screen.getByText("Current plan")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Get started" })).not.toBeInTheDocument();
  });

  it("shows the start error for non-pro users", () => {
    render(
      <PricingCards
        onGetStarted={vi.fn()}
        isStarting={false}
        startError="Something went wrong."
        disabled={false}
        monthlyPrice={29.99}
      />,
    );

    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });
});
