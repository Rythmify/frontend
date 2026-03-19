import { http, passthrough } from "msw";
import { messageHandlers } from "./messageHandlers";
import { discoverHandlers } from "./discoverHandlers";
import { trackHandlers } from "./trackHandlers";

// Auth requests pass through to the real backend
// authHandlers (mock) are kept in authHandlers.ts for unit tests only
const authPassthroughHandlers = [
  http.post("*/auth/register", passthrough),
  http.post("*/auth/verify-email", passthrough),
  http.post("*/auth/resend-verification", passthrough),
  http.post("*/auth/login", passthrough),
  http.post("*/auth/logout", passthrough),
  http.post("*/auth/refresh", passthrough),
  http.post("*/auth/forgot-password", passthrough),
  http.post("*/auth/reset-password", passthrough),
  http.post("*/auth/change-email", passthrough),
  http.post("*/auth/verify-email-change", passthrough),
  http.post("*/auth/google", passthrough),
  http.delete("*/auth/connections/:provider", passthrough),
  http.post("*/auth/check-email", passthrough),
  http.get("*/users/me", passthrough),
];

export const handlers = [
  ...authPassthroughHandlers,
  ...trackHandlers,
  ...messageHandlers,
  ...discoverHandlers,
];
