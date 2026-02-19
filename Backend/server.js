/* eslint-env node */
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import routes from './src/routes/index.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { apiLimiter, authLimiter, caseLimiter, readLimiter } from './src/middleware/rateLimiter.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

const PORT = process.env.PORT || 3000;

// Simple in-memory cache for ultra-fast responses
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds cache

function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') return next();

  const key = req.originalUrl;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  const originalJson = res.json;
  res.json = function(data) {
    cache.set(key, { data, timestamp: Date.now() });
    return originalJson.call(this, data);
  };

  next();
}

// Middleware
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5173", "ws://localhost:3000", "wss://localhost:3000"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
app.use('/api/auth/', authLimiter);
app.use('/api/cases/', caseLimiter);
app.use('/api/users/lawyers', readLimiter);
app.use('/api/', apiLimiter);

// Serve documents folder statically
app.use('/documents', express.static(path.join(__dirname, './public/documents')));

// Note: Download routes are now handled in src/routes/documents.js
// This ensures proper authentication and file path resolution

// Socket.io setup
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);

  socket.on('authenticate', (userId) => {
    connectedUsers.set(socket.id, userId);
    socket.join(`user:${userId}`);
    console.log(`[SOCKET] User ${userId} authenticated on socket ${socket.id}`);
  });

  socket.on('join:case', (caseId) => {
    socket.join(`case:${caseId}`);
    console.log(`[SOCKET] Socket ${socket.id} joined case room: ${caseId}`);
  });

  socket.on('leave:case', (caseId) => {
    socket.leave(`case:${caseId}`);
    console.log(`[SOCKET] Socket ${socket.id} left case room: ${caseId}`);
  });

  socket.on('chat:send', (data) => {
    const { receiverId, message, senderId, senderName } = data;
    io.to(`user:${receiverId}`).emit('chat:receive', {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
    console.log(`[SOCKET] Chat message sent from ${senderId} to ${receiverId}`);
  });

  socket.on('chat:read', (data) => {
    const { senderId, receiverId } = data;
    io.to(`user:${senderId}`).emit('chat:read:confirm', { userId: receiverId });
  });

  socket.on('notification:send', (data) => {
    const { recipientId, notification } = data;
    io.to(`user:${recipientId}`).emit('notification:receive', notification);
    console.log(`[SOCKET] Notification sent to user ${recipientId}`);
  });

  socket.on('case:update', (data) => {
    const { caseId, update, assignedUserId } = data;
    io.to(`case:${caseId}`).emit('case:updated', update);
    if (assignedUserId) io.to(`user:${assignedUserId}`).emit('case:updated', update);
    console.log(`[SOCKET] Case ${caseId} update broadcasted`);
  });

  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) connectedUsers.delete(socket.id);
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    sockets: connectedUsers.size
  });
});

// Root info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Kaduna Court API is running. Use the frontend at http://localhost:5173',
    api: 'http://localhost:3000/api',
    health: 'http://localhost:3000/health',
    websocket: 'ws://localhost:3000'
  });
});

// API Routes with caching
app.use('/api', cacheMiddleware, routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Error handler
app.use(errorHandler);

// Function to list all registered routes
function listRoutes(app) {
  const routes = [];
  
  function printStack(stack, basePath = '') {
    stack.forEach((layer) => {
      if (layer.route) {
        // Routes registered directly on the app
        const path = basePath + layer.route.path;
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        routes.push({ path, methods });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        // Router middleware - get the mount path from regexp
        let mountPath = basePath;
        if (layer.regexp) {
          const match = layer.regexp.toString().match(/^\/\^\\\/(.*?)\\\/\?\(\?=.*\)\$\/$/);
          if (match) {
            mountPath = basePath + '/' + match[1].replace(/\\\//g, '/');
          }
        }
        printStack(layer.handle.stack, mountPath);
      }
    });
  }
  
  if (app._router && app._router.stack) {
    printStack(app._router.stack);
  }
  
  return routes;
}


// Start server
httpServer.listen(PORT, () => {
  console.log(`[SERVER] Server running on http://localhost:${PORT}`);
  console.log(`[SOCKET] Socket.io server running on ws://localhost:${PORT}`);
  console.log(`[ENV] Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // List all registered routes for debugging
  console.log('\n[ROUTES] Registered API Routes:');
  const routes = listRoutes(app);
  routes.forEach(route => {
    console.log(`  ${route.methods.padEnd(6)} ${route.path}`);
  });
  console.log(`[ROUTES] Total routes: ${routes.length}\n`);
});
