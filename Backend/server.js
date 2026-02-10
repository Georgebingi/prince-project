/* eslint-env node */
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './src/routes/index.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { apiLimiter, authLimiter, caseLimiter, readLimiter, staticLimiter } from './src/middleware/rateLimiter.js';

// Simple in-memory cache for ultra-fast responses
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds cache

// Cache middleware for GET requests
function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') return next();

  const key = req.originalUrl;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  // Override res.json to cache the response
  const originalJson = res.json;
  res.json = function(data) {
    cache.set(key, { data, timestamp: Date.now() });
    return originalJson.call(this, data);
  };

  next();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow eval for development (Vite HMR)
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5173"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting - Apply different limits to different endpoints
app.use('/api/auth/', authLimiter); // Strict limits for auth (10 req/15min)
app.use('/api/cases/', caseLimiter); // Moderate limits for case operations (50 req/5min)
app.use('/api/users/lawyers', readLimiter); // Light limits for lawyer list (200 req/min)
app.use('/api/', apiLimiter); // General API limits (1000 req/15min)

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root: clarify this is the API server (frontend runs on Vite port, e.g. 5173)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Kaduna Court API is running. Use the frontend at http://localhost:5173',
    api: 'http://localhost:3000/api',
    health: 'http://localhost:3000/health'
  });
});

// API Routes with caching for ultra-fast responses
app.use('/api', cacheMiddleware, routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Error Handler - use the middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`[SERVER] Server running on http://localhost:${PORT}`);
  console.log(`[ENV] Environment: ${process.env.NODE_ENV || 'development'}`);
});
