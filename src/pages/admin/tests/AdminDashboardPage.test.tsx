import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboardPage from "../dashboard/AdminDashboardPage";

const mockGetAdminAnalytics = vi.hoisted(() => vi.fn());

vi.mock("@/services/api/admin.service", () => ({
  getAdminAnalytics: mockGetAdminAnalytics,
}));

const analyticsData = {
  period: "month",
  active_users: 1250,
  new_registrations: 87,
  total_tracks: 3400,
  total_plays: 52000,
  play_through_rate: 73.5,
  storage_used_gb: 45.2,
  storage_limit_gb: 100,
  pending_reports: 5,
  suspended_accounts: 12,
};

beforeEach(() => {
  mockGetAdminAnalytics.mockResolvedValue(analyticsData);
});

describe("AdminDashboardPage", () => {
  it("renders the Platform Analytics heading", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Platform Analytics")).toBeInTheDocument();
  });

  it("renders the period toggle buttons", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("period-btn-day")).toBeInTheDocument();
    expect(screen.getByTestId("period-btn-week")).toBeInTheDocument();
    expect(screen.getByTestId("period-btn-month")).toBeInTheDocument();
  });

  it("renders the refresh button", () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("btn-refresh")).toBeInTheDocument();
  });

  it("calls getAdminAnalytics on mount with default period 'month'", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(mockGetAdminAnalytics).toHaveBeenCalledWith("month");
    });
  });

  it("displays active users count after data loads", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText("1,250")).toBeInTheDocument();
    });
  });

  it("displays total tracks count after data loads", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText("3,400")).toBeInTheDocument();
    });
  });

  it("displays total plays count after data loads", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText("52,000")).toBeInTheDocument();
    });
  });

  it("fetches data with 'day' period when Today button is clicked", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    await waitFor(() => expect(mockGetAdminAnalytics).toHaveBeenCalled());
    mockGetAdminAnalytics.mockClear();
    fireEvent.click(screen.getByTestId("period-btn-day"));
    await waitFor(() => {
      expect(mockGetAdminAnalytics).toHaveBeenCalledWith("day");
    });
  });

  it("fetches data with 'week' period when This Week button is clicked", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    await waitFor(() => expect(mockGetAdminAnalytics).toHaveBeenCalled());
    mockGetAdminAnalytics.mockClear();
    fireEvent.click(screen.getByTestId("period-btn-week"));
    await waitFor(() => {
      expect(mockGetAdminAnalytics).toHaveBeenCalledWith("week");
    });
  });

  it("calls getAdminAnalytics again when refresh button is clicked", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    await waitFor(() => expect(mockGetAdminAnalytics).toHaveBeenCalled());
    const callCount = mockGetAdminAnalytics.mock.calls.length;
    fireEvent.click(screen.getByTestId("btn-refresh"));
    await waitFor(() => {
      expect(mockGetAdminAnalytics.mock.calls.length).toBeGreaterThan(callCount);
    });
  });

  it("renders quick action links", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("quick-action-reports")).toBeInTheDocument();
    expect(screen.getByTestId("quick-action-users")).toBeInTheDocument();
    expect(screen.getByTestId("quick-action-tracks")).toBeInTheDocument();
  });

  it("shows Play-Through Rate Formula card", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Play-Through Rate Formula")).toBeInTheDocument();
  });

  it("shows storage usage card", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Storage Usage")).toBeInTheDocument();
  });

  it("displays storage GB info after data loads", async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText(/45\.2 GB \/ 100\.0 GB/)).toBeInTheDocument();
    });
  });
});
