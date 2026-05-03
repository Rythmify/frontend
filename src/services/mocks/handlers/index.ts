
import { authHandlers } from "./authHandlers";
import { trackHandlers } from "./trackHandlers"; // upload API handlers
import { trackPageHandlers as trackPageHandlers } from "./trackPageHandlers"; // track page handlers
import { discoverHandlers } from "./discoverHandlers";
import { feedHandlers } from "./feedHandlers";
import { playlistHandlers } from "./playlistHandlers"; // playlist API handlers


export const handlers = [
  ...trackHandlers, // upload/artist studio handlers
  ...authHandlers,
  ...playlistHandlers,
  ...trackPageHandlers, // track detail page + users handlers
  ...discoverHandlers,
  ...feedHandlers,
];
