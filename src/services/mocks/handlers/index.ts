import { messageHandlers } from './messageHandlers';
import { authHandlers } from './authHandlers';
import {trackHandlers} from './trackHandler';

export const handlers = [
  ...authHandlers,
  ...messageHandlers,
  ...trackHandlers
];