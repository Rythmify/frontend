import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminLayout from "../AdminLayout";

const mockNavigate = vi.hoisted(() => vi.fn());
const mockLogout = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Outlet: () => <div data-test="mock-outlet">Page Content</div>,
  };
});

const mockAuthState = {
  user: { displayName: "Admin User", email: "admin@test.com", role: "admin" as const },
  logout: mockLogout,
};

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => mockAuthState,
}));

beforeEach(() => {
  mockNavigate.mockClear();
  mockLogout.mockClear();
  mockAuthState.user = {
    displayName: "Admin User",
    email: "admin@test.com",
    role: "admin" as const,
  };
});

describe("AdminLayout", () => {
  it("renders the sidebar", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    expect(screen.getByText("Rythmify")).toBeInTheDocument();
    // "Admin" appears in both sidebar badge and header badge
    expect(screen.getAllByText("Admin").length).toBeGreaterThanOrEqual(2);
  });

  it("renders all nav items", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-reports")).toBeInTheDocument();
    expect(screen.getByTestId("nav-users")).toBeInTheDocument();
    expect(screen.getByTestId("nav-tracks")).toBeInTheDocument();
  });

  it("renders nav item labels", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Reports & Appeals")).toBeInTheDocument();
    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(screen.getByText("Track Moderation")).toBeInTheDocument();
  });

  it("displays the admin user display name", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    expect(screen.getByText("Admin User")).toBeInTheDocument();
  });

  it("displays the admin user email", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    expect(screen.getByText("admin@test.com")).toBeInTheDocument();
  });

  it("renders the logout button", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("btn-logout")).toBeInTheDocument();
  });

  it("calls logout and navigates to /signin on logout click", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("btn-logout"));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/signin", { replace: true });
  });

  it("renders the Admin Control Panel header", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    expect(screen.getByText("Admin Control Panel")).toBeInTheDocument();
  });

  it("renders the outlet content area", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
  });

  it("redirects non-admin user to home", () => {
    mockAuthState.user = {
      displayName: "Regular User",
      email: "user@test.com",
      role: "listener" as any,
    };
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("redirects artist role user to home", () => {
    mockAuthState.user = {
      displayName: "Artist User",
      email: "artist@test.com",
      role: "artist" as any,
    };
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("does not redirect admin role user", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayout />
      </MemoryRouter>,
    );
    expect(mockNavigate).not.toHaveBeenCalledWith("/", { replace: true });
  });
});
