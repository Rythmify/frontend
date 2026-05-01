import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SubscriptionsPage from "./Subscriptions";
import {
  getMySubscription,
  getMyTransactions,
  cancelSubscription,
} from "@/services/api/upload/subscription.service";

vi.mock("@/services/api/upload/subscription.service", () => ({
  getMySubscription: vi.fn(),
  getMyTransactions: vi.fn(),
  cancelSubscription: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <SubscriptionsPage />
    </MemoryRouter>,
  );

describe("SubscriptionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the premium subscription and purchase history", async () => {
    vi.mocked(getMySubscription).mockResolvedValue({
      data: {
        user_subscription_id: "sub-1",
        user_id: "user-1",
        status: "active",
        start_date: "2026-04-01",
        end_date: "2026-05-01",
        auto_renew: true,
        created_at: "2026-04-01T00:00:00Z",
        plan: {
          subscription_plan_id: "premium-plan",
          name: "premium",
          price: "29.99",
          duration_days: 30,
          track_limit: null,
          playlist_limit: null,
        },
        usage: {
          tracks_uploaded: 0,
          track_limit: null,
          playlists_created: 0,
          playlist_limit: null,
          can_upload_track: true,
          can_create_playlist: true,
          offline_listening_enabled: true,
        },
      },
      message: "ok",
    } as any);
    vi.mocked(getMyTransactions).mockResolvedValue([
      {
        transaction_id: "txn-1",
        user_subscription_id: "sub-1",
        amount: "29.99",
        payment_method: "Card",
        payment_status: "paid",
        paid_at: "2026-04-02T00:00:00Z",
        created_at: "2026-04-01T00:00:00Z",
      },
    ] as any);

    renderPage();

    expect(await screen.findByText("Premium")).toBeInTheDocument();
    expect(screen.getByText(/Renews on/i)).toBeInTheDocument();
    expect(screen.getByText("Premium subscription")).toBeInTheDocument();
    expect(screen.getByText("EGP 29.99")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel plan" })).toBeInTheDocument();
  });

  it("cancels auto-renew for the current plan", async () => {
    vi.mocked(getMySubscription).mockResolvedValue({
      data: {
        user_subscription_id: "sub-1",
        user_id: "user-1",
        status: "active",
        start_date: "2026-04-01",
        end_date: "2026-05-01",
        auto_renew: true,
        created_at: "2026-04-01T00:00:00Z",
        plan: {
          subscription_plan_id: "premium-plan",
          name: "premium",
          price: "29.99",
          duration_days: 30,
          track_limit: null,
          playlist_limit: null,
        },
        usage: {
          tracks_uploaded: 0,
          track_limit: null,
          playlists_created: 0,
          playlist_limit: null,
          can_upload_track: true,
          can_create_playlist: true,
          offline_listening_enabled: true,
        },
      },
      message: "ok",
    } as any);
    vi.mocked(getMyTransactions).mockResolvedValue([] as any);
    vi.mocked(cancelSubscription).mockResolvedValue(undefined);

    renderPage();

    await screen.findByRole("button", { name: "Cancel plan" });
    fireEvent.click(screen.getByRole("button", { name: "Cancel plan" }));
    fireEvent.click(await screen.findByRole("button", { name: "Yes, cancel" }));

    await waitFor(() => {
      expect(cancelSubscription).toHaveBeenCalledTimes(1);
    });
  });

  it("renders the basic plan state when no premium subscription exists", async () => {
    vi.mocked(getMySubscription).mockResolvedValue({
      data: {
        user_subscription_id: "sub-1",
        user_id: "user-1",
        status: "active",
        start_date: "2026-04-01",
        end_date: null,
        auto_renew: false,
        created_at: "2026-04-01T00:00:00Z",
        plan: {
          subscription_plan_id: "free-plan",
          name: "free",
          price: "0.00",
          duration_days: null,
          track_limit: 3,
          playlist_limit: 2,
        },
        usage: {
          tracks_uploaded: 0,
          track_limit: 3,
          playlists_created: 0,
          playlist_limit: 2,
          can_upload_track: true,
          can_create_playlist: true,
          offline_listening_enabled: false,
        },
      },
      message: "ok",
    } as any);
    vi.mocked(getMyTransactions).mockResolvedValue([] as any);

    renderPage();

    expect(await screen.findByText("Basic")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try Premium" })).toHaveAttribute(
      "href",
      "/premium",
    );
    expect(screen.getByText("No purchase history yet.")).toBeInTheDocument();
  });
});
