/* eslint-env node */
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Default JWT secrets for development (should be set via environment variables in production)
const DEFAULT_JWT_SECRET = 'kaduna-court-dev-secret-2026';
const DEFAULT_JWT_REFRESH_SECRET = 'kaduna-court-refresh-secret-2026';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    console.log('[AUTH] Login attempt:', { username, role, hasPassword: !!password });

    // Validation
    if (!username || !password || !role) {
      console.log('[AUTH:ERROR] Validation failed: missing fields');
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username, password, and role are required'
        }
      });
    }

    // Find user by staff_id or email - explicitly select password_hash to avoid case issues
    const [users] = await db.query(
      `SELECT id, name, email, password_hash, staff_id, role, department, status 
       FROM users 
       WHERE (staff_id = ? OR email = ?) 
       AND role = ? 
       AND status = 'active'`,
      [username, username, role]
    );

    console.log(`[AUTH] Query result: Found ${users.length} user(s) matching criteria`);

    if (users.length === 0) {
      // Try to find user without role/status filter to help debug
      const [allUsers] = await db.query(
        `SELECT id, name, email, staff_id, role, status 
         FROM users 
         WHERE staff_id = ? OR email = ?`,
        [username, username]
      );
      
      if (allUsers.length > 0) {
        const foundUser = allUsers[0];
        console.log(`[AUTH:WARN] User found but: role=${foundUser.role} (expected ${role}), status=${foundUser.status} (expected active)`);
      } else {
        console.log(`[AUTH:WARN] No user found with username/email: ${username}`);
      }

      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID',
          message: 'Invalid credentials'
        }
      });
    }

    const user = users[0];
    console.log(`[AUTH] User found: ${user.email} (ID: ${user.id}, Role: ${user.role})`);

    // Check if password_hash exists and is valid
    if (!user.password_hash) {
      console.error('[AUTH:ERROR] password_hash is missing for user:', user.email);
      console.error('Available fields:', Object.keys(user));
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID',
          message: 'Invalid credentials'
        }
      });
    }

    // Verify password - handle both password_hash and PASSWORD_HASH (case variations)
    const passwordHash = user.password_hash || user.PASSWORD_HASH || user.passwordHash;
    if (!passwordHash) {
      console.error('[AUTH:ERROR] Could not find password_hash field. Available fields:', Object.keys(user));
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID',
          message: 'Invalid credentials'
        }
      });
    }

    console.log(`[AUTH] Comparing password (hash length: ${passwordHash.length})`);
    const validPassword = await bcrypt.compare(password, passwordHash);
    
    if (!validPassword) {
      console.log('[AUTH:ERROR] Password comparison failed');
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID',
          message: 'Invalid credentials'
        }
      });
    }

    console.log('[AUTH] Password verified successfully');

    // Use environment secrets or fallbacks for development
    const jwtSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || DEFAULT_JWT_REFRESH_SECRET;
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        staffId: user.staff_id
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      jwtRefreshSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    // Save refresh token to database (if sessions table exists)
    try {
      await db.query(
        `INSERT INTO sessions (user_id, refresh_token, expires_at, ip_address, user_agent) 
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?, ?)`,
        [user.id, refreshToken, req.ip, req.get('user-agent')]
      );
    } catch (error) {
      // Sessions table might not exist, continue without it
      console.warn('Sessions table not found, skipping session storage');
    }

    // Log login action (if audit_logs table exists)
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.id, user.name, 'login', 'auth', req.ip, req.get('user-agent')]
      );
    } catch (error) {
      // Audit logs table might not exist, continue without it
      console.warn('Audit logs table not found, skipping audit log');
    }

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        staffId: user.staff_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token required'
        }
      });
    }

    // Check if refresh token exists in sessions
    const [sessions] = await db.query(
      'SELECT user_id FROM sessions WHERE refresh_token = ? AND expires_at > NOW()',
      [refreshToken]
    );

    if (sessions.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID',
          message: 'Invalid refresh token'
        }
      });
    }

    const userId = sessions[0].user_id;

    // Get user details
    const [users] = await db.query(
      'SELECT id, name, email, role, staff_id, department FROM users WHERE id = ? AND status = ?',
      [userId, 'active']
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

    const user = users[0];

    // Use environment secrets or fallbacks for development
    const jwtSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || DEFAULT_JWT_REFRESH_SECRET;

    // Generate new access token
    const newToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        staffId: user.staff_id
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { id: user.id },
      jwtRefreshSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    // Update session with new refresh token
    await db.query(
      'UPDATE sessions SET refresh_token = ?, expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE refresh_token = ?',
      [newRefreshToken, refreshToken]
    );

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        staffId: user.staff_id
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_EXPIRED',
          message: 'Refresh token expired'
        }
      });
    }

    console.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Remove refresh token from sessions
    try {
      await db.query('DELETE FROM sessions WHERE user_id = ?', [req.user.id]);
    } catch (error) {
      console.warn('Sessions table not found or error deleting session');
    }

    // Log logout action (if audit_logs table exists)
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, ip_address) 
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'logout', 'auth', req.ip]
      );
    } catch (error) {
      // Audit logs table might not exist, continue without it
      console.warn('Audit logs table not found, skipping audit log');
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, staffId, role, department, password } = req.body;

    // Validation
    if (!fullName || !email || !staffId || !role || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields'
        }
      });
    }

    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ? OR staff_id = ?',
      [email, staffId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'User with this email or staff ID already exists'
        }
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user (status: pending)
    const [result] = await db.query(
      `INSERT INTO users (name, email, phone, staff_id, role, department, password_hash, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [fullName, email, phone, staffId, role, department, passwordHash]
    );

    res.status(201).json({
      success: true,
      message: 'Registration submitted for approval',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

export default router;
