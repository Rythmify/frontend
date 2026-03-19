import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { trackHandlers } from "../mocks/handlers/trackHandlers";
import { getMySubscription } from "../api/upload/subscription.service";

// ─── MSW Node Server ──────────────────────────────────────────────────────────

const server = setupServer(...trackHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// getMySubscription()

describe("getMySubscription()", () => {
  // free plan (default mock) 

  it("returns a subscription object with a plan", async () => {
    const result = await getMySubscription();
    expect(result.data).toBeDefined();
    expect(result.data.plan).toBeDefined();
  });

  it("returns a valid subscription status", async () => {
    const result = await getMySubscription();
    const validStatuses = ["pending", "active", "canceled", "expired"];
    expect(validStatuses).toContain(result.data.status);
  });

  it("returns plan name 'free' from the default mock", async () => {
    const result = await getMySubscription();
    expect(result.data.plan.name).toBe("free");
  });

  it("returns track_limit of 3 from the default mock", async () => {
    const result = await getMySubscription();
    expect(result.data.plan.track_limit).toBe(3);
  });

  it("returns a numeric user_subscription_id", async () => {
    const result = await getMySubscription();
    expect(typeof result.data.user_subscription_id).toBe("number");
  });

  it("returns a non-empty user_id string", async () => {
    const result = await getMySubscription();
    expect(typeof result.data.user_id).toBe("string");
    expect(result.data.user_id.length).toBeGreaterThan(0);
  });

  it("returns a non-empty start_date string", async () => {
    const result = await getMySubscription();
    expect(typeof result.data.start_date).toBe("string");
    expect(result.data.start_date.length).toBeGreaterThan(0);
  });

  it("returns a non-empty response message", async () => {
    const result = await getMySubscription();
    expect(typeof result.message).toBe("string");
    expect(result.message.length).toBeGreaterThan(0);
  });

  // Premium

  it("returns null track_limit for a premium plan", async () => {
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json({
          data: {
            user_subscription_id: 2,
            user_id: "premium-user-id",
            status: "active",
            start_date: "2026-01-01",
            end_date: null,
            auto_renew: true,
            created_at: "2026-01-01T00:00:00Z",
            plan: {
              subscription_plan_id: 2,
              name: "premium",
              price: "9.99",
              duration_days: 30,
              track_limit: null,
              playlist_limit: null,
            },
          },
          message: "Current subscription fetched successfully.",
        }),
      ),
    );

    const result = await getMySubscription();
    expect(result.data.plan.name).toBe("premium");
    expect(result.data.plan.track_limit).toBeNull();
  });

  it("returns null playlist_limit for a premium plan", async () => {
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json({
          data: {
            user_subscription_id: 2,
            user_id: "premium-user-id",
            status: "active",
            start_date: "2026-01-01",
            end_date: null,
            auto_renew: true,
            created_at: "2026-01-01T00:00:00Z",
            plan: {
              subscription_plan_id: 2,
              name: "premium",
              price: "9.99",
              duration_days: 30,
              track_limit: null,
              playlist_limit: null,
            },
          },
          message: "Current subscription fetched successfully.",
        }),
      ),
    );

    const result = await getMySubscription();
    expect(result.data.plan.playlist_limit).toBeNull();
  });

  it("returns auto_renew=true for a premium plan", async () => {
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json({
          data: {
            user_subscription_id: 2,
            user_id: "premium-user-id",
            status: "active",
            start_date: "2026-01-01",
            end_date: null,
            auto_renew: true,
            created_at: "2026-01-01T00:00:00Z",
            plan: {
              subscription_plan_id: 2,
              name: "premium",
              price: "9.99",
              duration_days: 30,
              track_limit: null,
              playlist_limit: null,
            },
          },
          message: "Current subscription fetched successfully.",
        }),
      ),
    );

    const result = await getMySubscription();
    expect(result.data.auto_renew).toBe(true);
  });

  // ── Expired / canceled subscriptions ──────────────────────────────────────

  it("returns status=expired when subscription has expired", async () => {
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json({
          data: {
            user_subscription_id: 3,
            user_id: "expired-user-id",
            status: "expired",
            start_date: "2025-01-01",
            end_date: "2025-12-31",
            auto_renew: false,
            created_at: "2025-01-01T00:00:00Z",
            plan: {
              subscription_plan_id: 1,
              name: "free",
              price: "0.00",
              duration_days: null,
              track_limit: 3,
              playlist_limit: 2,
            },
          },
          message: "Current subscription fetched successfully.",
        }),
      ),
    );

    const result = await getMySubscription();
    expect(result.data.status).toBe("expired");
  });

  it("returns status=canceled when subscription is canceled", async () => {
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json({
          data: {
            user_subscription_id: 4,
            user_id: "canceled-user-id",
            status: "canceled",
            start_date: "2025-06-01",
            end_date: "2025-09-01",
            auto_renew: false,
            created_at: "2025-06-01T00:00:00Z",
            plan: {
              subscription_plan_id: 1,
              name: "free",
              price: "0.00",
              duration_days: null,
              track_limit: 3,
              playlist_limit: 2,
            },
          },
          message: "Current subscription fetched successfully.",
        }),
      ),
    );

    const result = await getMySubscription();
    expect(result.data.status).toBe("canceled");
  });

  it("returns status=pending for a newly created subscription", async () => {
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json({
          data: {
            user_subscription_id: 5,
            user_id: "new-user-id",
            status: "pending",
            start_date: "2026-03-19",
            end_date: null,
            auto_renew: false,
            created_at: "2026-03-19T00:00:00Z",
            plan: {
              subscription_plan_id: 1,
              name: "free",
              price: "0.00",
              duration_days: null,
              track_limit: 3,
              playlist_limit: 2,
            },
          },
          message: "Current subscription fetched successfully.",
        }),
      ),
    );

    const result = await getMySubscription();
    expect(result.data.status).toBe("pending");
  });

  // Error 

  it("throws on 401 — unauthenticated", async () => {
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json(
          {
            error: {
              code: "AUTH_TOKEN_MISSING",
              message: "Authorization header missing",
            },
          },
          { status: 401 },
        ),
      ),
    );
    await expect(getMySubscription()).rejects.toThrow();
  });

  it("throws on 403 — forbidden", async () => {
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json(
          { error: { code: "PERMISSION_DENIED", message: "Access denied." } },
          { status: 403 },
        ),
      ),
    );
    await expect(getMySubscription()).rejects.toThrow();
  });

  it("throws on 404 — subscription not found", async () => {
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json(
          {
            error: {
              code: "RESOURCE_NOT_FOUND",
              message: "No active subscription found.",
            },
          },
          { status: 404 },
        ),
      ),
    );
    await expect(getMySubscription()).rejects.toThrow();
  });

  it("throws on 500 — internal server error", async () => {
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json(
          {
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "An unexpected error occurred.",
            },
          },
          { status: 500 },
        ),
      ),
    );
    await expect(getMySubscription()).rejects.toThrow();
  });
});
