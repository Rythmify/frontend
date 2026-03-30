import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(token: string): void {
  if (socket?.connected) return; // already connected, do nothing

  socket = io('wss://api.rythmify.com', {  // ask backend for exact URL
    auth: { token },                        // this is how Socket.IO passes the JWT
    transports: ['websocket'],              // skip the HTTP polling fallback
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('error', (err: { message: string }) => {
    console.error('[Socket] Server error:', err.message);
  });
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}

// ── Outgoing: room management ────────────────────────────────
export function joinConversation(conversationId: string): void {
  socket?.emit('message:join', { conversationId });
}

export function leaveConversation(conversationId: string): void {
  socket?.emit('message:leave', { conversationId });
}

// ── Outgoing: message events ─────────────────────────────────
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
  conversationUnreadCount: number
): void {
  socket?.emit('message:read', {
    conversationId,
    messageId,
    isRead,
    conversationUnreadCount,
  });
}

// ── Outgoing: typing indicators ──────────────────────────────
export function emitTyping(conversationId: string): void {
  socket?.emit('message:typing', { conversationId });
}

export function emitStopTyping(conversationId: string): void {
  socket?.emit('message:stop_typing', { conversationId });
}