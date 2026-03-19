import { messageHandlers } from './messageHandlers';
import { authHandlers } from './authHandlers';
import { trackHandlers } from "@/services/api/upload/trackHandlers";

export const handlers = [
  ...authHandlers,
  ...messageHandlers,
  ...trackHandlers, 
];