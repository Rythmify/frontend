import { messageHandlers } from "./messageHandlers";
import { authHandlers } from "./authHandlers";
import { trackHandlers } from "./trackHandlers"; // upload API handlers
import { trackPageHandlers as trackPageHandlers } from "./trackPageHandlers"; // track page handlers
import { discoverHandlers } from "./discoverHandlers";

export const handlers = [
  ...trackHandlers, // upload/artist studio handlers
  ...authHandlers,
  ...messageHandlers,
  ...trackPageHandlers, // track detail page + users handlers
  ...discoverHandlers,
];
