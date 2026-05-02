/**
 * Playback region configuration
 * ---------------------------
 * The backend uses `X-Country-Code` (ISO 3166-1 alpha-2) to mask or allow
 * `stream_url`, `preview_url`, and related fields. This module centralizes the
 * value so you can later swap `getPlaybackCountryCode()` to read from the
 * logged-in user, GeoIP, CDN headers, or subscription tier without touching
 * every service call.
 */

const DEFAULT_PLAYBACK_COUNTRY_CODE = "EG";
const PLAYBACK_COUNTRY_OVERRIDE_KEY = "playback_country_code";

let playbackCountryCode = DEFAULT_PLAYBACK_COUNTRY_CODE;

/** Current ISO country code sent on track and player API requests. */
export function getPlaybackCountryCode(): string {
  // Dev/testing override so QA can switch region without rebuild/redeploy.
  const override =
    typeof window !== "undefined"
      ? window.localStorage.getItem(PLAYBACK_COUNTRY_OVERRIDE_KEY)
      : null;
  if (override && /^[A-Za-z]{2}$/.test(override.trim())) {
    return override.trim().toUpperCase();
  }
  return playbackCountryCode;
}

/**
 * Override the playback region (e.g. after loading user profile).
 * Accepts only two-letter codes; invalid input is ignored.
 */
export function setPlaybackCountryCode(code: string): void {
  if (typeof code === "string" && /^[A-Za-z]{2}$/.test(code.trim())) {
    const normalized = code.trim().toUpperCase();
    playbackCountryCode = normalized;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PLAYBACK_COUNTRY_OVERRIDE_KEY, normalized);
    }
  }
}
