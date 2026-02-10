import rateLimit from 'express-rate-limit';

// General API rate limiter - ultra permissive for speed
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute (reduced window)
  max: 10000, // limit each IP to 10000 requests per minute (increased limit)
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and static files
    return req.path === '/health' || req.path.startsWith('/static/');
  }
});

// Stricter limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Moderate limiter for case operations - faster for better UX
export const caseLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes (reduced window)
  max: 200, // limit each IP to 200 case operations per 2 minutes (increased limit)
  message: {
    success: false,
    error: {
      code: 'CASE_RATE_LIMIT_EXCEEDED',
      message: 'Too many case operations, please slow down.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Light limiter for read-only operations
export const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 read requests per minute
  message: {
    success: false,
    error: {
      code: 'READ_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again in a moment.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Very light limiter for static assets - ultra fast
export const staticLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 2000, // limit each IP to 2000 static requests per 30 seconds
  message: {
    success: false,
    error: {
      code: 'STATIC_RATE_LIMIT_EXCEEDED',
      message: 'Too many static requests.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});
