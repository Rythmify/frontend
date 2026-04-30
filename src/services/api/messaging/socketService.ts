import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentToken: string | null = null;

// The conversation room the client is currently inside.
// Stored here so we can re-join automatically after a reconnect.
let activeConversationRoom: string | null = null;

export function connectSocket(token: string): void {
  // KEY CHANGE: don't bail if socket exists but is disconnected/dead
  if (socket?.connected) return;

  // If a stale (disconnected) socket exists, tear it down first
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentToken = token;

  socket = io(import.meta.env.VITE_API_BASE_URL, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,      // increase from 5
    reconnectionDelay: 2_000,
    reconnectionDelayMax: 10_000,  // cap backoff
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
    if (activeConversationRoom) {
      socket?.emit('message:join', {
        conversationId: activeConversationRoom.replace('conversation:', ''),
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
    // Transport-level close = server kicked us; reconnect won't fire automatically
    if (reason === 'io server disconnect') {
      socket?.connect();
    }
  });

  // KEY CHANGE: when Socket.IO gives up, null out the stale reference
  // so the next call to connectSocket() can create a fresh socket
  socket.on('reconnect_failed', () => {
    console.warn('[Socket] Reconnect failed — clearing stale socket');
    socket?.removeAllListeners();
    socket = null;
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  currentToken = null;
  activeConversationRoom = null;
}

export function getSocket(): Socket | null {
  return socket;
}

export function getCurrentToken(): string | null {
  return currentToken;
}

// ── Outgoing: room management ────────────────────────────────────────────────

export function joinConversation(conversationId: string): void {
  activeConversationRoom = `conversation:${conversationId}`;
  socket?.emit('message:join', { conversationId });
}

export function leaveConversation(conversationId: string): void {
  if (activeConversationRoom === `conversation:${conversationId}`) {
    activeConversationRoom = null;
  }
  socket?.emit('message:leave', { conversationId });
}

// ── Outgoing: message events ─────────────────────────────────────────────────

export function emitMessageSent(conversationId: string, message: object): void {
  socket?.emit('message:send', { conversationId, message });
}

export function emitMessageDeleted(conversationId: string, messageId: string): void {
  socket?.emit('message:deleted', { conversationId, messageId });
}

export function emitMessageRead(
  conversationId: string,
  messageId: string,
  isRead: boolean,
  conversationUnreadCount: number,
): void {
  socket?.emit('message:read', {
    conversationId,
    messageId,
    isRead,
    conversationUnreadCount,
  });
}

// ── Outgoing: typing indicators ──────────────────────────────────────────────

export function emitTyping(conversationId: string): void {
  socket?.emit('message:typing', { conversationId });
}

export function emitStopTyping(conversationId: string): void {
  socket?.emit('message:stop_typing', { conversationId });
}