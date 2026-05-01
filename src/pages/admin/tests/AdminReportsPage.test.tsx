import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminReportsPage from "../reports/AdminReportsPage";
import type { ReportDetailed, ReportAppeal } from "@/services/api/admin.service";

const mockListAdminReports = vi.hoisted(() => vi.fn());
const mockResolveAdminReport = vi.hoisted(() => vi.fn());
const mockListReportAppeals = vi.hoisted(() => vi.fn());
const mockReviewAppeal = vi.hoisted(() => vi.fn());

vi.mock("@/services/api/admin.service", () => ({
  listAdminReports: mockListAdminReports,
  resolveAdminReport: mockResolveAdminReport,
  listReportAppeals: mockListReportAppeals,
  reviewAppeal: mockReviewAppeal,
}));

const makeReport = (overrides: Partial<ReportDetailed> = {}): ReportDetailed => ({
  id: "report-1",
  resource_type: "track",
  resource_id: "track-123",
  reason: "spam",
  status: "pending",
  created_at: "2024-01-10T00:00:00Z",
  description: "This is spam",
  reported_by_name: "John Doe",
  reported_by_email: "john@example.com",
  resource: { id: "track-123", title: "Bad Track" },
  ...overrides,
});

const makeAppeal = (overrides: Partial<ReportAppeal> = {}): ReportAppeal => ({
  id: "appeal-1",
  report_id: "report-1",
  user_id: "user-1",
  appeal_reason: "I did not violate any rules",
  status: "pending",
  original_report: {
    id: "report-1",
    resource_type: "track",
    resource_id: "track-123",
    reason: "spam",
    status: "resolved",
    created_at: "2024-01-10T00:00:00Z",
  },
  ...overrides,
});

beforeEach(() => {
  mockListAdminReports.mockResolvedValue({
    data: [],
    pagination: { limit: 20, offset: 0, total: 0 },
  });
  mockResolveAdminReport.mockResolvedValue(undefined);
  mockListReportAppeals.mockResolvedValue({
    data: [],
    pagination: { limit: 20, offset: 0, total: 0 },
  });
  mockReviewAppeal.mockResolvedValue(undefined);
});

describe("AdminReportsPage", () => {
  it("renders the Reports & Appeals heading", async () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Reports & Appeals")).toBeInTheDocument();
  });

  it("renders the reports and appeals tabs", async () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("tab-reports")).toBeInTheDocument();
    expect(screen.getByTestId("tab-appeals")).toBeInTheDocument();
  });

  it("renders the refresh button", () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("btn-refresh")).toBeInTheDocument();
  });

  it("shows reports filters by default", async () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("select-status-filter")).toBeInTheDocument();
      expect(screen.getByTestId("select-reason-filter")).toBeInTheDocument();
    });
  });

  it("shows empty state when no reports", async () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText("No reports found")).toBeInTheDocument();
    });
  });

  it("renders a report row when reports are returned", async () => {
    mockListAdminReports.mockResolvedValue({
      data: [makeReport()],
      pagination: { limit: 20, offset: 0, total: 1 },
    });
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText("Bad Track")).toBeInTheDocument();
    });
  });

  it("renders resolve button for pending reports", async () => {
    mockListAdminReports.mockResolvedValue({
      data: [makeReport({ id: "r1", status: "pending" })],
      pagination: { limit: 20, offset: 0, total: 1 },
    });
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("btn-resolve-r1")).toBeInTheDocument();
    });
  });

  it("does not render resolve button for resolved reports", async () => {
    mockListAdminReports.mockResolvedValue({
      data: [makeReport({ id: "r2", status: "resolved" })],
      pagination: { limit: 20, offset: 0, total: 1 },
    });
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.queryByTestId("btn-resolve-r2")).not.toBeInTheDocument();
    });
  });

  it("opens resolve modal when resolve button is clicked", async () => {
    mockListAdminReports.mockResolvedValue({
      data: [makeReport({ id: "r1", status: "pending" })],
      pagination: { limit: 20, offset: 0, total: 1 },
    });
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-resolve-r1")));
    expect(screen.getByText("Resolve Report")).toBeInTheDocument();
  });

  it("closes resolve modal when cancel is clicked", async () => {
    mockListAdminReports.mockResolvedValue({
      data: [makeReport({ id: "r1", status: "pending" })],
      pagination: { limit: 20, offset: 0, total: 1 },
    });
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-resolve-r1")));
    fireEvent.click(screen.getByTestId("btn-resolve-cancel"));
    expect(screen.queryByText("Resolve Report")).not.toBeInTheDocument();
  });

  it("switches to appeals tab when clicked", async () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("tab-appeals"));
    await waitFor(() => {
      expect(screen.getByTestId("select-appeal-status-filter")).toBeInTheDocument();
    });
  });

  it("shows empty state for appeals when none returned", async () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("tab-appeals"));
    await waitFor(() => {
      expect(screen.getByText("No appeals found")).toBeInTheDocument();
    });
  });

  it("renders an appeal row when appeals are returned", async () => {
    mockListReportAppeals.mockResolvedValue({
      data: [makeAppeal()],
      pagination: { limit: 20, offset: 0, total: 1 },
    });
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("tab-appeals"));
    await waitFor(() => {
      expect(screen.getByText("I did not violate any rules")).toBeInTheDocument();
    });
  });

  it("opens appeal review modal when review button is clicked", async () => {
    mockListReportAppeals.mockResolvedValue({
      data: [makeAppeal({ id: "a1", status: "pending" })],
      pagination: { limit: 20, offset: 0, total: 1 },
    });
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("tab-appeals"));
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-review-a1")));
    expect(screen.getByText("Review Appeal")).toBeInTheDocument();
  });

  it("cancels appeal review modal when cancel is clicked", async () => {
    mockListReportAppeals.mockResolvedValue({
      data: [makeAppeal({ id: "a1", status: "pending" })],
      pagination: { limit: 20, offset: 0, total: 1 },
    });
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("tab-appeals"));
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-review-a1")));
    fireEvent.click(screen.getByTestId("btn-appeal-cancel"));
    expect(screen.queryByText("Review Appeal")).not.toBeInTheDocument();
  });

  it("confirms resolve action and calls API", async () => {
    mockListAdminReports.mockResolvedValue({
      data: [makeReport({ id: "r1", status: "pending" })],
      pagination: { limit: 20, offset: 0, total: 1 },
    });
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-resolve-r1")));
    fireEvent.click(screen.getByTestId("btn-resolve-confirm"));
    await waitFor(() => {
      expect(mockResolveAdminReport).toHaveBeenCalledWith(
        "r1",
        expect.objectContaining({ status: "resolved" }),
      );
    });
  });

  it("can select 'dismissed' decision in resolve modal", async () => {
    mockListAdminReports.mockResolvedValue({
      data: [makeReport({ id: "r1", status: "pending" })],
      pagination: { limit: 20, offset: 0, total: 1 },
    });
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-resolve-r1")));
    fireEvent.click(screen.getByTestId("btn-decision-dismissed"));
    fireEvent.click(screen.getByTestId("btn-resolve-confirm"));
    await waitFor(() => {
      expect(mockResolveAdminReport).toHaveBeenCalledWith(
        "r1",
        expect.objectContaining({ status: "dismissed" }),
      );
    });
  });

  it("filters reports by status when filter is changed", async () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    );
    await waitFor(() => expect(mockListAdminReports).toHaveBeenCalled());
    mockListAdminReports.mockClear();
    fireEvent.change(screen.getByTestId("select-status-filter"), {
      target: { value: "pending" },
    });
    await waitFor(() => {
      expect(mockListAdminReports).toHaveBeenCalledWith(
        expect.objectContaining({ status: "pending" }),
      );
    });
  });
});
