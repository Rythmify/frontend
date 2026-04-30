import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DiscoverPage from "./DiscoverPage";
import { useAuthStore } from "@/stores/auth.store";

// ─── Mock Setup ───────────────────────────────────────────

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("./DiscoverPageAuth", () => ({
  default: () => <div data-test="mock-discover-auth" />,
}));

vi.mock("./DiscoverPageGuest", () => ({
  default: () => <div data-test="mock-discover-guest" />,
}));

// ─── Test Suite ───────────────────────────────────────────

describe("DiscoverPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders DiscoverPageAuth when authenticated", () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true } as any);
    render(<DiscoverPage />);
    expect(screen.getByTestId("mock-discover-auth")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-discover-guest")).not.toBeInTheDocument();
  });

  it("renders DiscoverPageGuest when not authenticated", () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false } as any);
    render(<DiscoverPage />);
    expect(screen.getByTestId("mock-discover-guest")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-discover-auth")).not.toBeInTheDocument();
  });
});
