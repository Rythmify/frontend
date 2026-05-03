import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { trackHandlers } from "../mocks/handlers/trackHandlers";
import { getUploadQuota } from "../api/upload/quota.service";

// ─── MSW Node Server ──────────────────────────────────────────────────────────
// quota.service calls only GET /subscriptions/me (usage is embedded in the response).

const server = setupServer(...trackHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface MockSubOptions {
  trackLimit: number | null;
  tracksUploaded?: number;
  playlistLimit?: number | null;
  playlistsCreated?: number;
  canUploadTrack?: boolean;
  canCreatePlaylist?: boolean;
}

const mockSubscriptionEndpoint = ({
  trackLimit,
  tracksUploaded = 0,
  playlistLimit = 2,
  playlistsCreated = 0,
  canUploadTrack = true,
  canCreatePlaylist = true,
}: MockSubOptions) => {
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
            subscription_plan_id: trackLimit === null ? 2 : 1,
            name: trackLimit === null ? "premium" : "free",
            price: "0.00",
            duration_days: null,
            track_limit: trackLimit,
            playlist_limit: playlistLimit,
          },
          usage: {
            tracks_uploaded: tracksUploaded,
            track_limit: trackLimit,
            playlists_created: playlistsCreated,
            playlist_limit: playlistLimit,
            can_upload_track: canUploadTrack,
            can_create_playlist: canCreatePlaylist,
            offline_listening_enabled: trackLimit === null,
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

  it("returns correct usedTracks count from usage", async () => {
    mockSubscriptionEndpoint({ trackLimit: 3, tracksUploaded: 2 });

    const result = await getUploadQuota();
    expect(result.usedTracks).toBe(2);
  });

  it("returns correct trackLimit from the subscription plan", async () => {
    mockSubscriptionEndpoint({ trackLimit: 3, tracksUploaded: 1 });

    const result = await getUploadQuota();
    expect(result.trackLimit).toBe(3);
  });

  it("returns usedTracks=0 when the user has uploaded no tracks", async () => {
    mockSubscriptionEndpoint({ trackLimit: 3, tracksUploaded: 0 });

    const result = await getUploadQuota();
    expect(result.usedTracks).toBe(0);
  });

  it("returns canUpload=true when under the limit", async () => {
    mockSubscriptionEndpoint({ trackLimit: 3, tracksUploaded: 2, canUploadTrack: true });

    const result = await getUploadQuota();
    expect(result.canUpload).toBe(true);
  });

  it("returns canUpload=false when at the limit", async () => {
    mockSubscriptionEndpoint({ trackLimit: 3, tracksUploaded: 3, canUploadTrack: false });

    const result = await getUploadQuota();
    expect(result.canUpload).toBe(false);
  });

  it("returns playlist quota fields correctly", async () => {
    mockSubscriptionEndpoint({
      trackLimit: 3,
      playlistLimit: 2,
      playlistsCreated: 1,
      canCreatePlaylist: true,
    });

    const result = await getUploadQuota();
    expect(result.usedPlaylists).toBe(1);
    expect(result.playlistLimit).toBe(2);
    expect(result.canCreatePlaylist).toBe(true);
  });

  it("returns a QuotaData object with all required keys", async () => {
    mockSubscriptionEndpoint({ trackLimit: 3 });

    const result = await getUploadQuota();
    expect(result).toHaveProperty("usedTracks");
    expect(result).toHaveProperty("trackLimit");
    expect(result).toHaveProperty("canUpload");
    expect(result).toHaveProperty("usedPlaylists");
    expect(result).toHaveProperty("playlistLimit");
    expect(result).toHaveProperty("canCreatePlaylist");
  });

  // ── Unlimited / premium plan ───────────────────────────────────────────────

  it("returns null trackLimit for a premium/unlimited plan", async () => {
    mockSubscriptionEndpoint({ trackLimit: null, tracksUploaded: 5 });

    const result = await getUploadQuota();
    expect(result.trackLimit).toBeNull();
  });

  it("still returns correct usedTracks when plan is unlimited", async () => {
    mockSubscriptionEndpoint({ trackLimit: null, tracksUploaded: 5 });

    const result = await getUploadQuota();
    expect(result.usedTracks).toBe(5);
  });

  it("returns canUpload=true for premium regardless of track count", async () => {
    mockSubscriptionEndpoint({ trackLimit: null, tracksUploaded: 100, canUploadTrack: true });

    const result = await getUploadQuota();
    expect(result.canUpload).toBe(true);
  });

  it("returns null playlistLimit for premium plan", async () => {
    mockSubscriptionEndpoint({ trackLimit: null, playlistLimit: null, canCreatePlaylist: true });

    const result = await getUploadQuota();
    expect(result.playlistLimit).toBeNull();
    expect(result.canCreatePlaylist).toBe(true);
  });

  // ── Uses default mock (trackHandlers provides the baseline) ───────────────

  it("works with the default trackHandlers mock without overrides", async () => {
    // trackHandlers returns tracks_uploaded: 0, free plan with limit 3
    const result = await getUploadQuota();
    expect(result.usedTracks).toBe(0);
    expect(result.trackLimit).toBe(3);
    expect(result.canUpload).toBe(true);
  });

  // ── Error cases ────────────────────────────────────────────────────────────

  it("throws when the subscription endpoint returns 401", async () => {
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

  it("throws when the subscription endpoint returns 500", async () => {
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
});
