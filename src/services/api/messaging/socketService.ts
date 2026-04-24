import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Tracks which conversations the current user has open
// so we can re-join them automatically after reconnect
const activeRooms = new Set<string>();

// Token getter — reads from localStorage so reconnect_attempt always has fresh token
function getFreshToken(): string {
  return localStorage.getItem('access_token') ?? '';
}

export function connectSocket(token: string): void {
  // If a socket already exists in any state, don't make a second one
  if (socket) {
    if (socket.connected) return;
    // Exists but disconnected — update token and reconnect instead of making new socket
    socket.auth = { token: `Bearer ${token}` };
    socket.connect();
    return;
  }

  socket = io('https://rythmify-backend-dev.livelypebble-6b7965ef.uaenorth.azurecontainerapps.io', {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  // Refresh token on every reconnect attempt in case it expired mid-session
  socket.on('reconnect_attempt', () => {
    const fresh = getFreshToken();
    if (socket) socket.auth = { token: `Bearer ${fresh}` };
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
    // Re-join all rooms that were active before the disconnect
    // This fixes the "verifiedRooms wiped on reconnect" bug
    activeRooms.forEach((conversationId) => {
      socket?.emit('message:join', { conversationId });
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
    // 'io server disconnect' means the server forcefully closed the connection
    // auto-reconnect won't trigger in this case — we have to do it manually
    if (reason === 'io server disconnect') {
      socket?.connect();
    }
  });

  socket.on('error', (err: { message: string }) => {
    console.error('[Socket] Server error:', err.message);
  });
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  activeRooms.clear();
}

export function getSocket(): Socket | null {
  return socket;
}

// ── Room management ───────────────────────────────────────────

export function joinConversation(conversationId: string): void {
  activeRooms.add(conversationId);          // track it
  socket?.emit('message:join', { conversationId });
}

export function leaveConversation(conversationId: string): void {
  activeRooms.delete(conversationId);       // stop tracking
  socket?.emit('message:leave', { conversationId });
}

// ── Block/Unblock: force a fresh room auth handshake ─────────
// Call this AFTER the unblock HTTP call succeeds.
// Leave clears the server's verifiedRooms cache,
// rejoin re-runs assertConversationAccess against the updated DB.
export async function rejoinConversation(conversationId: string): Promise<void> {
  leaveConversation(conversationId);
  await new Promise((res) => setTimeout(res, 300));
  joinConversation(conversationId);
}

// ── Outgoing: message events ──────────────────────────────────

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
  socket?.emit('message:read', { conversationId, messageId, isRead, conversationUnreadCount });
}

// ── Outgoing: typing indicators ───────────────────────────────

export function emitTyping(conversationId: string): void {
  socket?.emit('message:typing', { conversationId });
}

export function emitStopTyping(conversationId: string): void {
  socket?.emit('message:stop_typing', { conversationId });
}