import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { trackHandlers } from "../mocks/handlers/trackHandlers";
import { getUploadQuota } from "../api/upload/quota.service";

// ─── MSW Node Server ──────────────────────────────────────────────────────────
// quota.service internally calls getMyTracks() + getMySubscription(),
// so we intercept those HTTP endpoints directly via MSW.

const server = setupServer(...trackHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockTracksEndpoint = (count: number) => {
  server.use(
    http.get("*/tracks/me", () =>
      HttpResponse.json({
        data: Array.from({ length: count }, (_, i) => ({
          id: `track-${i}`,
          title: `Track ${i}`,
          genre: null,
          duration: null,
          user_id: "user-1",
        })),
        pagination: { page: 1, limit: 1, total: count },
      }),
    ),
  );
};

const mockSubscriptionEndpoint = (trackLimit: number | null) => {
  server.use(
    http.get("*/subscriptions/me", () =>
      HttpResponse.json({
        data: {
          user_subscription_id: 1,
          user_id: "user-1",
          status: "active",
          start_date: "2026-01-01",
          end_date: null,
          auto_renew: false,
          created_at: "2026-01-01T00:00:00Z",
          plan: {
            subscription_plan_id: 1,
            name: trackLimit === null ? "premium" : "free",
            price: "0.00",
            duration_days: null,
            track_limit: trackLimit,
            playlist_limit: 2,
          },
        },
        message: "Current subscription fetched successfully.",
      }),
    ),
  );
};

// ─── getUploadQuota() ─────────────────────────────────────────────────────────

describe("getUploadQuota()", () => {

  // ── Happy path — free plan ────────────────────────────────────────────────

  it("returns correct usedTracks count matching the tracks list length", async () => {
    mockTracksEndpoint(2);
    mockSubscriptionEndpoint(3);

    const result = await getUploadQuota();
    expect(result.usedTracks).toBe(2);
  });

  it("returns correct trackLimit from the subscription plan", async () => {
    mockTracksEndpoint(1);
    mockSubscriptionEndpoint(3);

    const result = await getUploadQuota();
    expect(result.trackLimit).toBe(3);
  });

  it("returns usedTracks=0 when the user has uploaded no tracks", async () => {
    mockTracksEndpoint(0);
    mockSubscriptionEndpoint(3);

    const result = await getUploadQuota();
    expect(result.usedTracks).toBe(0);
  });

  it("returns usedTracks=1 when only one track exists", async () => {
    mockTracksEndpoint(1);
    mockSubscriptionEndpoint(3);

    const result = await getUploadQuota();
    expect(result.usedTracks).toBe(1);
  });

  it("returns a QuotaData object with both required keys", async () => {
    mockTracksEndpoint(1);
    mockSubscriptionEndpoint(3);

    const result = await getUploadQuota();
    expect(result).toHaveProperty("usedTracks");
    expect(result).toHaveProperty("trackLimit");
  });

  // ── Unlimited / premium plan ───────────────────────────────────────────────

  it("returns null trackLimit for a premium/unlimited plan", async () => {
    mockTracksEndpoint(5);
    mockSubscriptionEndpoint(null);

    const result = await getUploadQuota();
    expect(result.trackLimit).toBeNull();
  });

  it("still returns correct usedTracks when plan is unlimited", async () => {
    mockTracksEndpoint(5);
    mockSubscriptionEndpoint(null);

    const result = await getUploadQuota();
    expect(result.usedTracks).toBe(5);
  });

  it("returns usedTracks=0 with unlimited plan when no tracks uploaded", async () => {
    mockTracksEndpoint(0);
    mockSubscriptionEndpoint(null);

    const result = await getUploadQuota();
    expect(result.usedTracks).toBe(0);
    expect(result.trackLimit).toBeNull();
  });

  // ── Uses default mock (trackHandlers already handles both endpoints) ───────

  it("works with the default trackHandlers mock without overrides", async () => {
    // trackHandlers returns 1 track and free plan with limit 3
    const result = await getUploadQuota();
    expect(result.usedTracks).toBe(1);
    expect(result.trackLimit).toBe(3);
  });

  // ── Error cases ────────────────────────────────────────────────────────────

  it("throws when the tracks endpoint returns 401", async () => {
    server.use(
      http.get("*/tracks/me", () =>
        HttpResponse.json(
          { error: { code: "AUTH_TOKEN_MISSING", message: "Authorization header missing" } },
          { status: 401 },
        ),
      ),
    );
    mockSubscriptionEndpoint(3);

    await expect(getUploadQuota()).rejects.toThrow();
  });

  it("throws when the subscription endpoint returns 401", async () => {
    mockTracksEndpoint(1);
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json(
          { error: { code: "AUTH_TOKEN_MISSING", message: "Authorization header missing" } },
          { status: 401 },
        ),
      ),
    );

    await expect(getUploadQuota()).rejects.toThrow();
  });

  it("throws when the tracks endpoint returns 500", async () => {
    server.use(
      http.get("*/tracks/me", () =>
        HttpResponse.json(
          { error: { code: "INTERNAL_SERVER_ERROR", message: "Server error" } },
          { status: 500 },
        ),
      ),
    );
    mockSubscriptionEndpoint(3);

    await expect(getUploadQuota()).rejects.toThrow();
  });

  it("throws when the subscription endpoint returns 500", async () => {
    mockTracksEndpoint(1);
    server.use(
      http.get("*/subscriptions/me", () =>
        HttpResponse.json(
          { error: { code: "INTERNAL_SERVER_ERROR", message: "Server error" } },
          { status: 500 },
        ),
      ),
    );

    await expect(getUploadQuota()).rejects.toThrow();
  });

  it("throws when both endpoints fail simultaneously", async () => {
    server.use(
      http.get("*/tracks/me", () =>
        HttpResponse.json(
          { error: { code: "INTERNAL_SERVER_ERROR", message: "Server error" } },
          { status: 500 },
        ),
      ),
      http.get("*/subscriptions/me", () =>
        HttpResponse.json(
          { error: { code: "INTERNAL_SERVER_ERROR", message: "Server error" } },
          { status: 500 },
        ),
      ),
    );

    await expect(getUploadQuota()).rejects.toThrow();
  });
});