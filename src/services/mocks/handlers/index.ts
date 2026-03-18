import { messageHandlers } from "./messageHandlers";
import { authHandlers } from "./authHandlers";
import { discoverHandlers } from "./discoverHandlers";

export const handlers = [
  ...authHandlers,
  ...messageHandlers,
  ...discoverHandlers,
];
