import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CompareTable from "./CompareTable";
import { useAuthStore } from "@/stores/auth.store";

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

describe("CompareTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: { displayName: "Mariam", username: "mariam", isPro: false },
      logout: mockLogout,
    });
  });

  it("renders the feature comparison and premium CTA for basic users", () => {
    const onGetStarted = vi.fn();

    render(
      <CompareTable
        onGetStarted={onGetStarted}
        isStarting={false}
        disabled={false}
        monthlyPrice={29.99}
      />,
    );

    expect(screen.getByRole("heading", { name: "Compare features." })).toBeInTheDocument();
    expect(screen.getByText("Unlimited uploads")).toBeInTheDocument();
    expect(screen.getAllByText("Not Available").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Available").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
    expect(screen.getByText("EGP 29.99")).toBeInTheDocument();
    expect(screen.getByText(/billed yearly for EGP 359\.88/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Get started" }));
    expect(onGetStarted).toHaveBeenCalledTimes(1);
  });

  it("shows current plan actions for premium users and supports sign out", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { displayName: "Mariam", username: "mariam", isPro: true },
      logout: mockLogout,
    });

    render(
      <CompareTable
        onGetStarted={vi.fn()}
        isStarting={false}
        disabled={false}
        monthlyPrice={29.99}
      />,
    );

    expect(screen.getByText("Current plan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to Basic" })).toBeInTheDocument();
    expect(screen.getByText(/Signed in as Mariam/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back to Basic" }));
    expect(mockNavigate).toHaveBeenCalledWith("/subscriptions");

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/logout");
  });
});
