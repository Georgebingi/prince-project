import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './api';

// Socket.io server URL configuration
// In development: Use the Vite proxy path (/socket.io) which forwards to backend
// In production: Set VITE_SOCKET_URL to your production server URL (e.g., https://api.example.com)
const envUrl = import.meta.env.VITE_SOCKET_URL;

// Use direct backend URL in development (proxy doesn't work well with WebSocket)
// In production: Set VITE_SOCKET_URL to your production server URL
const isDevelopment = import.meta.env.DEV;
const SOCKET_URL = (envUrl && envUrl.trim()) 
  ? envUrl.trim() 
  : (isDevelopment ? 'http://localhost:3000' : 'http://localhost:3000');

// Log the URL being used for debugging
console.log('[SOCKET] Using server URL:', SOCKET_URL);

let socket: Socket | null = null;
let isConnecting = false;

/**
 * Get or create the socket connection
 */
export function getSocket(): Socket {
  if (!socket && !isConnecting) {
    // Ensure we're using the correct URL
    const connectionUrl = SOCKET_URL;
    isConnecting = true;
    
    socket = io(connectionUrl, {
      auth: {
        token: getAuthToken() || ''
      },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 10000,
      // Force new connection to avoid using cached connections
      forceNew: true,
    });


    // Event handlers
    socket.on('connect', () => {
      console.log('[SOCKET] Connected to server at', connectionUrl);
      isConnecting = false;
    });

    socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason);
    });

    socket.on('connect_error', (error: Error) => {
      isConnecting = false;
      // Only log meaningful errors, not repeated connection failures
      if (socket?.connected) return;
      console.log('[SOCKET] Unable to connect to server. Backend may not be running.', error.message);
    });


    socket.on('reconnect', (attemptNumber) => {
      console.log('[SOCKET] Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_failed', () => {
      console.log('[SOCKET] Reconnection failed. Backend may not be running.');
    });
  }

  return socket as Socket;
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
