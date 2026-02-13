import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/orders - Get all orders with filters
router.get('/', async (req, res) => {
  try {
    const { status, caseId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.id,
        o.case_id,
        o.title,
        o.content,
        o.drafted_by,
        o.drafted_date as date,
        o.status,
        o.signed_by,
        o.signed_at,
        c.case_number,
        c.title as case_title,
        u.name as drafted_by_name,
        su.name as signed_by_name
      FROM orders o
      LEFT JOIN cases c ON o.case_id = c.id
      LEFT JOIN users u ON o.drafted_by = u.id
      LEFT JOIN users su ON o.signed_by = su.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'judge') {
      query += ' AND (c.judge_id = ? OR o.drafted_by = ?)';
      params.push(req.user.id, req.user.id);
    } else if (req.user.role === 'lawyer') {
      query += ' AND c.lawyer_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'clerk' || req.user.role === 'registrar') {
      query += ' AND o.drafted_by = ?';
      params.push(req.user.id);
    }

    // Apply filters
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (caseId) {
      query += ' AND (o.case_id = ? OR c.case_number = ?)';
      params.push(caseId, caseId);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT o.id, o.case_id, o.title, o.content, o.drafted_by, o.drafted_date as date, o.status, o.signed_by, o.signed_at, c.case_number, c.title as case_title, u.name as drafted_by_name, su.name as signed_by_name',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult && countResult[0] ? countResult[0].total : 0;


    // Get paginated results
    query += ' ORDER BY o.drafted_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.query(query, params);

    // Format orders for frontend
    const formattedOrders = orders.map(o => ({
      id: o.id,
      caseId: o.case_number || String(o.case_id),
      title: o.title,
      content: o.content,
      draftedBy: o.drafted_by_name || 'Unknown',
      date: o.date ? new Date(o.date).toISOString().split('T')[0] : '',
      status: o.status || 'Draft',
      signedBy: o.signed_by_name,
      signedAt: o.signed_at,
      caseTitle: o.case_title
    }));

    res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// POST /api/orders - Create new order (clerks, registrars, judges, admins)
router.post('/', authorizeRole('clerk', 'registrar', 'judge', 'admin'), async (req, res) => {
  try {
    const { caseId, title, content } = req.body;

    if (!caseId || !title) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Case ID and title are required'
        }
      });
    }

    // Verify case exists
    const byNumericId = /^\d+$/.test(caseId);
    const [cases] = await db.query(
      `SELECT id, case_number, judge_id FROM cases WHERE ${byNumericId ? 'id = ?' : 'case_number = ?'}`,
      [byNumericId ? parseInt(caseId, 10) : caseId]
    );

    if (cases.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Case not found'
        }
      });
    }

    const caseData = cases[0];
    const caseIdNumeric = caseData.id;

    // Check permissions - judges can draft orders for their cases
    if (req.user.role === 'judge' && caseData.judge_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only draft orders for cases assigned to you'
        }
      });
    }

    // Insert order
    const [result] = await db.query(
      `INSERT INTO orders (case_id, title, content, drafted_by, drafted_date, status)
       VALUES (?, ?, ?, ?, CURDATE(), 'Draft')`,
      [caseIdNumeric, title, content || '', req.user.id]
    );

    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [caseIdNumeric, 'Order Drafted', `Order "${title}" drafted by ${req.user.name}`, 'order', req.user.id]
      );
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'create', 'order', result.insertId, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        caseId: caseData.case_number || String(caseIdNumeric),
        title,
        draftedBy: req.user.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Draft'
      },
      message: 'Order drafted successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// PUT /api/orders/:id/sign - Sign an order (judges only)
router.put('/:id/sign', authorizeRole('judge', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const [orders] = await db.query(
      `SELECT o.*, c.case_number, c.judge_id, c.id as case_id_numeric 
       FROM orders o
       JOIN cases c ON o.case_id = c.id
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    const order = orders[0];

    // Check if already signed
    if (order.status === 'Signed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_SIGNED',
          message: 'Order is already signed'
        }
      });
    }

    // Check if judge is assigned to this case
    if (req.user.role === 'judge' && order.judge_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only sign orders for cases assigned to you'
        }
      });
    }

    // Update order status to signed
    await db.query(
      'UPDATE orders SET status = ?, signed_by = ?, signed_at = NOW() WHERE id = ?',
      ['Signed', req.user.id, id]
    );

    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [order.case_id_numeric, 'Order Signed', `Order "${order.title}" signed by ${req.user.name}`, 'order', req.user.id]
      );
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'sign', 'order', id, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.json({
      success: true,
      message: 'Order signed successfully'
    });
  } catch (error) {
    console.error('Sign order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/orders/draft-count - Get count of draft orders for dashboard
router.get('/draft-count', async (req, res) => {
  try {
    let query = `
      SELECT COUNT(*) as count 
      FROM orders o
      JOIN cases c ON o.case_id = c.id
      WHERE o.status = 'Draft'
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'judge') {
      query += ' AND (c.judge_id = ? OR o.drafted_by = ?)';
      params.push(req.user.id, req.user.id);
    } else if (req.user.role === 'clerk' || req.user.role === 'registrar') {
      query += ' AND o.drafted_by = ?';
      params.push(req.user.id);
    }

    const [result] = await db.query(query, params);

    res.json({
      success: true,
      data: {
        draftOrders: result[0].count
      }
    });
  } catch (error) {
    console.error('Get draft orders count error:', error);
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
