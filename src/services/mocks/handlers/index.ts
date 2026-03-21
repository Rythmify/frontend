import { messageHandlers } from './messageHandlers';
import { authHandlers } from './authHandlers';
import { trackHandlers } from "./trackHandlers";        // upload API handlers 
import { trackPageHandlers as trackPageHandlers } from "./trackPageHandlers"; // track page handlers 


export const handlers = [
  ...authHandlers,
  ...messageHandlers,
  ...trackHandlers,      // upload/artist studio handlers
  ...trackPageHandlers,  // track detail page + users handlers
];
