import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './api';

// Socket.io server URL - explicitly use backend port 3000
// In development, the backend runs on port 3000
// In production, set VITE_SOCKET_URL to your production server URL
const envUrl = import.meta.env.VITE_SOCKET_URL;
const SOCKET_URL = (envUrl && envUrl.trim()) ? envUrl.trim() : 'http://localhost:3000';

// Log the URL being used for debugging
console.log('[SOCKET] Using server URL:', SOCKET_URL);

let socket: Socket | null = null;

/**
 * Get or create the socket connection
 */
export function getSocket(): Socket {
  if (!socket) {
    // Ensure we're using the correct URL
    const connectionUrl = SOCKET_URL;
    
    socket = io(connectionUrl, {
      auth: {
        token: getAuthToken() || ''
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      // Force new connection to avoid using cached connections
      forceNew: true,
      // Disable auto-connect to handle it manually
      autoConnect: true
    });


    // Event handlers
    socket.on('connect', () => {
      console.log('[SOCKET] Connected to server at', connectionUrl);
    });

    socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('[SOCKET] Connection error:', error.message);
      console.error('[SOCKET] Attempted URL:', connectionUrl);
    });


    socket.on('reconnect', (attemptNumber) => {
      console.log('[SOCKET] Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_failed', () => {
      console.error('[SOCKET] Reconnection failed');
    });
  }

  return socket;
}

export function authenticateSocket(userId: string): void {
  const s = getSocket();
  if (!s.connected) return;
  s.emit('authenticate', userId);
}

export function joinCaseRoom(caseId: string): void {
  const s = getSocket();
  if (!s.connected) return;
  s.emit('join:case', caseId);
}

export function leaveCaseRoom(caseId: string): void {
  const s = getSocket();
  if (!s.connected) return;
  s.emit('leave:case', caseId);
}

export function sendChatMessage(receiverId: string, senderId: string, senderName: string, message: string): void {
  const s = getSocket();
  if (!s.connected) return;
  s.emit('chat:send', { receiverId, senderId, senderName, message });
}

export function markChatAsRead(senderId: string, receiverId: string): void {
  const s = getSocket();
  if (!s.connected) return;
  s.emit('chat:read', { senderId, receiverId });
}

export function sendNotification(recipientId: string, notification: object): void {
  const s = getSocket();
  if (!s.connected) return;
  s.emit('notification:send', { recipientId, notification });
}

export function broadcastCaseUpdate(caseId: string, update: object, assignedUserId?: string): void {
  const s = getSocket();
  if (!s.connected) return;
  s.emit('case:update', { caseId, update, assignedUserId });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}


export type {
  Socket
};
