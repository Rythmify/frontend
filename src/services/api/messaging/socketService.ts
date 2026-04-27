import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentToken: string | null = null;

// The conversation room the client is currently inside.
// Stored here so we can re-join automatically after a reconnect.
let activeConversationRoom: string | null = null;

export function connectSocket(token: string): void {
  // If a socket already exists (connected OR in the middle of reconnecting)
  // do NOT create a second one — that would leak the first instance.
  if (socket) return;

  currentToken = token;
  console.log('[Socket] connectSocket — creating socket');

  socket = io(import.meta.env.VITE_API_BASE_URL, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2_000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);

    // ── Re-join the active room on every (re)connect ──────────────────
    // Socket.IO rooms are server-side only; a new socket.id means the
    // server has no memory of which rooms this client was in before.
    if (activeConversationRoom) {
      console.log('[Socket] Rejoining room after reconnect:', activeConversationRoom);
      socket?.emit('message:join', {
        conversationId: activeConversationRoom.replace('conversation:', ''),
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  socket.on('error', (err: { message: string }) => {
    console.error('[Socket] Server error:', err.message);
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