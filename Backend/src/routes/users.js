import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users/profile - Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, staff_id, department FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const user = users[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        staffId: user.staff_id
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/users/lawyers - Get all lawyers (judge, registrar, admin, court_admin only)
router.get('/lawyers', authorizeRole('judge', 'registrar', 'admin', 'court_admin'), async (req, res) => {
  try {
    const [lawyers] = await db.query(
      'SELECT id, name, email, staff_id, department FROM users WHERE role = ? AND status = ?',
      ['lawyer', 'active']
    );

    res.json({
      success: true,
      data: lawyers
    });
  } catch (error) {
    console.error('Get lawyers error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/users - Get all users (admin only)
router.get('/', authorizeRole('admin', 'registrar'), async (req, res) => {
  try {
    const { role, department, status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, name, email, role, department, staff_id, status, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR staff_id LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT id, name, email, role, department, staff_id, status, created_at, updated_at',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await db.query(query, params);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});


// GET /api/users/lawyers - Get list of lawyers (judges and admins can access)
router.get('/lawyers', authorizeRole('judge', 'admin', 'registrar', 'court_admin'), async (req, res) => {
  try {
    const [lawyers] = await db.query(
      `SELECT id, name, email, staff_id, department
       FROM users
       WHERE role = 'lawyer' AND status = 'active'
       ORDER BY name`
    );

    res.json({
      success: true,
      data: lawyers
    });
  } catch (error) {
    console.error('Get lawyers error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/users/judges - Get list of judges
router.get('/judges', async (req, res) => {
  try {
    const [judges] = await db.query(
      `SELECT id, name, email, staff_id, department
       FROM users
       WHERE role = 'judge' AND status = 'active'
       ORDER BY name`
    );

    res.json({
      success: true,
      data: judges
    });
  } catch (error) {
    console.error('Get judges error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless admin
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin' && req.user.role !== 'registrar') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      });
    }

    const [users] = await db.query(
      'SELECT id, name, email, phone, role, department, staff_id, status, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, role } = req.body;

    // Users can only update their own profile unless admin
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin' && req.user.role !== 'registrar') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      });
    }

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (phone) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (department && (req.user.role === 'admin' || req.user.role === 'registrar')) {
      updates.push('department = ?');
      params.push(department);
    }
    if (role && (req.user.role === 'admin' || req.user.role === 'registrar')) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update'
        }
      });
    }

    params.push(id);
    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});


// POST /api/users/:id/approve - Approve user registration (admin only)
router.post('/:id/approve', authorizeRole('admin', 'registrar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, staffId } = req.body;

    const status = approved ? 'active' : 'rejected';

    await db.query(
      'UPDATE users SET status = ?, staff_id = COALESCE(?, staff_id) WHERE id = ?',
      [status, staffId, id]
    );

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'approve', 'user', id, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.json({
      success: true,
      message: `User ${status} successfully`
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// PUT /api/users/:id/status - Update user status (admin/registrar only)
router.put('/:id/status', authorizeRole('admin', 'registrar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'pending', 'suspended', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status. Must be one of: active, pending, suspended, rejected'
        }
      });
    }

    // Check if user exists
    const [users] = await db.query('SELECT id, name, status FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const oldStatus = users[0].status;

    // Update user status
    await db.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address, details)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'status_change', 'user', id, req.ip, JSON.stringify({ oldStatus, newStatus: status })]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.json({
      success: true,
      message: `User status updated to ${status} successfully`,
      data: {
        id,
        status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authorizeRole('admin', 'registrar'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await db.query('SELECT id, name FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Delete the user
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'delete', 'user', id, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
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
