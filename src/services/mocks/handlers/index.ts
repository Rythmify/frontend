import { messageHandlers } from "./messageHandlers";
import { authHandlers } from "./authHandlers";
import { discoverHandlers } from "./discoverHandlers";
import { trackHandlers } from "./trackHandlers";

export const handlers = [
  ...trackHandlers,
  ...authHandlers,
  ...messageHandlers,
  ...discoverHandlers,
  ...trackHandlers,
];
