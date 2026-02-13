import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/motions - Get all motions with filters
router.get('/', async (req, res) => {
  try {
    const { status, caseId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        m.id,
        m.case_id,
        m.title,
        m.filed_by,
        m.filed_date as date,
        m.status,
        m.document_url,
        m.description,
        c.case_number,
        c.title as case_title,
        u.name as filed_by_name
      FROM motions m
      LEFT JOIN cases c ON m.case_id = c.id
      LEFT JOIN users u ON m.filed_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'judge') {
      query += ' AND c.judge_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'lawyer') {
      query += ' AND (m.filed_by = ? OR c.lawyer_id = ?)';
      params.push(req.user.id, req.user.id);
    }

    // Apply filters
    if (status) {
      query += ' AND m.status = ?';
      params.push(status);
    }

    if (caseId) {
      query += ' AND (m.case_id = ? OR c.case_number = ?)';
      params.push(caseId, caseId);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT m.id, m.case_id, m.title, m.filed_by, m.filed_date as date, m.status, m.document_url, m.description, c.case_number, c.title as case_title, u.name as filed_by_name',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult && countResult[0] ? countResult[0].total : 0;


    // Get paginated results
    query += ' ORDER BY m.filed_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [motions] = await db.query(query, params);

    // Format motions for frontend
    const formattedMotions = motions.map(m => ({
      id: m.id,
      caseId: m.case_number || String(m.case_id),
      title: m.title,
      filedBy: m.filed_by_name || 'Unknown',
      date: m.date ? new Date(m.date).toISOString().split('T')[0] : '',
      status: m.status || 'Pending',
      documentUrl: m.document_url,
      description: m.description,
      caseTitle: m.case_title
    }));

    res.json({
      success: true,
      data: formattedMotions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get motions error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// POST /api/motions - Create new motion (lawyers only)
router.post('/', authorizeRole('lawyer', 'admin', 'judge'), async (req, res) => {
  try {
    const { caseId, title, description, documentUrl } = req.body;

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
      `SELECT id, case_number, judge_id, lawyer_id FROM cases WHERE ${byNumericId ? 'id = ?' : 'case_number = ?'}`,
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

    // Check permissions - lawyer must be assigned to case or filing for their case
    if (req.user.role === 'lawyer' && caseData.lawyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only file motions for cases assigned to you'
        }
      });
    }

    // Insert motion
    const [result] = await db.query(
      `INSERT INTO motions (case_id, title, description, filed_by, filed_date, status, document_url)
       VALUES (?, ?, ?, ?, CURDATE(), 'Pending', ?)`,
      [caseIdNumeric, title, description || '', req.user.id, documentUrl || null]
    );

    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [caseIdNumeric, 'Motion Filed', `Motion "${title}" filed by ${req.user.name}`, 'motion', req.user.id]
      );
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'create', 'motion', result.insertId, req.ip]
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
        filedBy: req.user.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
      },
      message: 'Motion filed successfully'
    });
  } catch (error) {
    console.error('Create motion error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// PUT /api/motions/:id/status - Update motion status (Approve/Reject)
router.put('/:id/status', authorizeRole('judge', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be either Approved or Rejected'
        }
      });
    }

    // Get motion details
    const [motions] = await db.query(
      `SELECT m.*, c.case_number, c.judge_id, c.id as case_id_numeric 
       FROM motions m
       JOIN cases c ON m.case_id = c.id
       WHERE m.id = ?`,
      [id]
    );

    if (motions.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Motion not found'
        }
      });
    }

    const motion = motions[0];

    // Check if judge is assigned to this case
    if (req.user.role === 'judge' && motion.judge_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only review motions for cases assigned to you'
        }
      });
    }

    // Update motion status
    await db.query(
      'UPDATE motions SET status = ?, reviewed_by = ?, reviewed_at = NOW(), notes = ? WHERE id = ?',
      [status, req.user.id, notes || '', id]
    );

    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [motion.case_id_numeric, `Motion ${status}`, `Motion "${motion.title}" ${status.toLowerCase()} by ${req.user.name}`, 'motion', req.user.id]
      );
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, status.toLowerCase(), 'motion', id, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.json({
      success: true,
      message: `Motion ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Update motion status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/motions/pending-count - Get count of pending motions for dashboard
router.get('/pending-count', async (req, res) => {
  try {
    let query = `
      SELECT COUNT(*) as count 
      FROM motions m
      JOIN cases c ON m.case_id = c.id
      WHERE m.status = 'Pending'
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'judge') {
      query += ' AND c.judge_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'lawyer') {
      query += ' AND (m.filed_by = ? OR c.lawyer_id = ?)';
      params.push(req.user.id, req.user.id);
    }

    const [result] = await db.query(query, params);

    res.json({
      success: true,
      data: {
        pendingMotions: result[0].count
      }
    });
  } catch (error) {
    console.error('Get pending motions count error:', error);
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
