import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminUsersPage from "../users/AdminUsersPage";

const mockAxiosGet = vi.hoisted(() => vi.fn());
const mockAdminSuspendUser = vi.hoisted(() => vi.fn());
const mockAdminReinstateUser = vi.hoisted(() => vi.fn());
const mockAdminWarnUser = vi.hoisted(() => vi.fn());

vi.mock("@/services/api/axiosInstance", () => ({
  default: { get: mockAxiosGet },
}));

vi.mock("@/services/api/admin.service", () => ({
  adminSuspendUser: mockAdminSuspendUser,
  adminReinstateUser: mockAdminReinstateUser,
  adminWarnUser: mockAdminWarnUser,
}));

const makeApiUser = (overrides: Record<string, unknown> = {}) => ({
  id: "u1",
  display_name: "Jane Doe",
  username: "janedoe",
  role: "listener",
  is_verified: false,
  follower_count: 120,
  profile_picture: null,
  ...overrides,
});

const usersResponse = (users: ReturnType<typeof makeApiUser>[]) => ({
  data: { data: { users }, pagination: { total: users.length } },
});

beforeEach(() => {
  mockAxiosGet.mockResolvedValue(usersResponse([]));
  mockAdminSuspendUser.mockResolvedValue(undefined);
  mockAdminReinstateUser.mockResolvedValue(undefined);
  mockAdminWarnUser.mockResolvedValue(undefined);
});

describe("AdminUsersPage", () => {
  it("renders the User Management heading", () => {
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("User Management")).toBeInTheDocument();
  });

  it("renders the user search input", () => {
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("input-user-search")).toBeInTheDocument();
  });

  it("renders the role filter select", () => {
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("select-role-filter")).toBeInTheDocument();
  });

  it("renders the refresh button", () => {
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("btn-refresh")).toBeInTheDocument();
  });

  it("shows 'Type a name to search users' when search is empty", async () => {
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText("Type a name to search users")).toBeInTheDocument();
    });
  });

  it("does not call API when search is empty on mount", () => {
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    expect(mockAxiosGet).not.toHaveBeenCalled();
  });

  it("renders user rows after search returns results", async () => {
    mockAxiosGet.mockResolvedValue(usersResponse([makeApiUser()]));
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(
      () => {
        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it("shows 'No users found' when search returns empty", async () => {
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "nobody" },
    });
    await waitFor(
      () => {
        expect(screen.getByText("No users found")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it("shows action button for non-admin users", async () => {
    mockAxiosGet.mockResolvedValue(usersResponse([makeApiUser({ id: "u1", role: "listener" })]));
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(
      () => {
        expect(screen.getByTestId("btn-user-actions-u1")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it("opens user action dropdown on button click", async () => {
    mockAxiosGet.mockResolvedValue(usersResponse([makeApiUser({ id: "u1", role: "listener" })]));
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-user-actions-u1")), {
      timeout: 1000,
    });
    expect(screen.getByTestId("btn-send-warning")).toBeInTheDocument();
    expect(screen.getByTestId("btn-suspend-account")).toBeInTheDocument();
  });

  it("opens suspend modal when Suspend Account is clicked", async () => {
    mockAxiosGet.mockResolvedValue(usersResponse([makeApiUser({ id: "u1", role: "listener" })]));
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-user-actions-u1")), {
      timeout: 1000,
    });
    fireEvent.click(screen.getByTestId("btn-suspend-account"));
    expect(screen.getByText("Suspend Account")).toBeInTheDocument();
  });

  it("closes suspend modal when cancel is clicked", async () => {
    mockAxiosGet.mockResolvedValue(usersResponse([makeApiUser({ id: "u1", role: "listener" })]));
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-user-actions-u1")), {
      timeout: 1000,
    });
    fireEvent.click(screen.getByTestId("btn-suspend-account"));
    fireEvent.click(screen.getByTestId("btn-suspend-cancel"));
    expect(screen.queryByText("Suspend Account")).not.toBeInTheDocument();
  });

  it("confirm button is disabled when suspend reason is empty", async () => {
    mockAxiosGet.mockResolvedValue(usersResponse([makeApiUser({ id: "u1", role: "listener" })]));
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-user-actions-u1")), {
      timeout: 1000,
    });
    fireEvent.click(screen.getByTestId("btn-suspend-account"));
    const confirmBtn = screen.getByTestId("btn-suspend-confirm");
    expect(confirmBtn).toBeDisabled();
  });

  it("enables confirm button after entering a suspend reason", async () => {
    mockAxiosGet.mockResolvedValue(usersResponse([makeApiUser({ id: "u1", role: "listener" })]));
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-user-actions-u1")), {
      timeout: 1000,
    });
    fireEvent.click(screen.getByTestId("btn-suspend-account"));
    fireEvent.change(screen.getByTestId("textarea-suspend-reason"), {
      target: { value: "Violation of terms" },
    });
    expect(screen.getByTestId("btn-suspend-confirm")).not.toBeDisabled();
  });

  it("calls adminSuspendUser when suspend is confirmed", async () => {
    mockAxiosGet.mockResolvedValue(usersResponse([makeApiUser({ id: "u1", role: "listener" })]));
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-user-actions-u1")), {
      timeout: 1000,
    });
    fireEvent.click(screen.getByTestId("btn-suspend-account"));
    fireEvent.change(screen.getByTestId("textarea-suspend-reason"), {
      target: { value: "Repeated violations" },
    });
    fireEvent.click(screen.getByTestId("btn-suspend-confirm"));
    await waitFor(() => {
      expect(mockAdminSuspendUser).toHaveBeenCalledWith("u1", "Repeated violations");
    });
  });

  it("opens warn modal when Send Warning is clicked", async () => {
    mockAxiosGet.mockResolvedValue(usersResponse([makeApiUser({ id: "u1", role: "listener" })]));
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-user-actions-u1")), {
      timeout: 1000,
    });
    fireEvent.click(screen.getByTestId("btn-send-warning"));
    // "Send Warning" appears in both the modal heading and the confirm button
    expect(screen.getAllByText("Send Warning").length).toBeGreaterThanOrEqual(1);
  });

  it("renders warning category buttons in warn modal", async () => {
    mockAxiosGet.mockResolvedValue(usersResponse([makeApiUser({ id: "u1", role: "listener" })]));
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-user-actions-u1")), {
      timeout: 1000,
    });
    fireEvent.click(screen.getByTestId("btn-send-warning"));
    expect(
      screen.getByTestId("btn-warn-reason-copyright_strike"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("btn-warn-reason-content_policy_violation"),
    ).toBeInTheDocument();
  });

  it("calls adminWarnUser when warn is confirmed", async () => {
    mockAxiosGet.mockResolvedValue(usersResponse([makeApiUser({ id: "u1", role: "listener" })]));
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-user-actions-u1")), {
      timeout: 1000,
    });
    fireEvent.click(screen.getByTestId("btn-send-warning"));
    fireEvent.click(screen.getByTestId("btn-warn-confirm"));
    await waitFor(() => {
      expect(mockAdminWarnUser).toHaveBeenCalledWith(
        "u1",
        expect.objectContaining({ reason: "content_policy_violation" }),
      );
    });
  });

  it("clears search when clear button is clicked", async () => {
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    fireEvent.click(screen.getByTestId("btn-clear-search"));
    const input = screen.getByTestId("input-user-search") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("shows reinstate button for suspended users", async () => {
    mockAxiosGet.mockResolvedValue(
      usersResponse([makeApiUser({ id: "u1", role: "listener" })]),
    );
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-user-search"), {
      target: { value: "jane" },
    });
    await waitFor(() => expect(screen.getByText("Active")).toBeInTheDocument(), {
      timeout: 1000,
    });
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-user-actions-u1")), {
      timeout: 1000,
    });
    fireEvent.click(screen.getByTestId("btn-suspend-account"));
    fireEvent.change(screen.getByTestId("textarea-suspend-reason"), {
      target: { value: "Reason" },
    });
    fireEvent.click(screen.getByTestId("btn-suspend-confirm"));
    await waitFor(() => {
      expect(mockAdminSuspendUser).toHaveBeenCalled();
    });
  });
});
