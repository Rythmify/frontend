import { messageHandlers } from './messageHandlers';
import { authHandlers } from './authHandlers';
import { trackHandlers } from "./trackHandlers";

export const handlers = [
  ...trackHandlers, 
  ...authHandlers,
  ...messageHandlers,
];