import { messageHandlers } from './messageHandlers';
import { authHandlers } from './authHandlers';

export const handlers = [
  ...authHandlers,
  ...messageHandlers,
];