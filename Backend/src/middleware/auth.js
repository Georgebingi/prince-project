/* eslint-env node */
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // Check Authorization header first, then query parameter (for direct download URLs)
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    
    // If no token in header, check query parameter (for direct download URLs)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication token required'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they're still active
    const [users] = await db.query(
      'SELECT id, name, email, role, staff_id, department, status FROM users WHERE id = ? AND status = ?',
      [decoded.id, 'active']
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID',
          message: 'User not found or inactive'
        }
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_EXPIRED',
          message: 'Token has expired'
        }
      });
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTH_INVALID',
        message: 'Invalid token'
      }
    });
  }
};

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Expected when a role tries to access an admin/registrar-only resource; no need to log as error
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
        }
      });
    }

    next();
  };
};
