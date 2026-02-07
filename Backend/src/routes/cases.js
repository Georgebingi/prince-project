import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/cases - Get all cases with filters
router.get('/', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20, search, assignedTo } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, u.name as judge_name 
      FROM cases c 
      LEFT JOIN users u ON c.judge_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'judge') {
      query += ' AND c.judge_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'lawyer') {
      query += ` AND EXISTS (
        SELECT 1 FROM case_parties cp 
        WHERE cp.case_id = c.id AND cp.lawyer_id = ?
      )`;
      params.push(req.user.id);
    }

    // Apply filters
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND c.type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (c.case_number LIKE ? OR c.title LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (assignedTo) {
      query += ' AND c.judge_id = ?';
      params.push(assignedTo);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT c.*, u.name as judge_name',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    query += ' ORDER BY c.filed_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [cases] = await db.query(query, params);

    res.json({
      success: true,
      data: cases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/cases/:id - Get case by ID (numeric) or case_number (e.g. KDH/2024/001)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const byNumericId = /^\d+$/.test(id);

    // Get case details (by id or case_number for frontend-friendly URLs)
    const [cases] = await db.query(
      `SELECT c.*, u.name as judge_name, u.email as judge_email 
       FROM cases c 
       LEFT JOIN users u ON c.judge_id = u.id 
       WHERE ${byNumericId ? 'c.id = ?' : 'c.case_number = ?'}`,
      [byNumericId ? parseInt(id, 10) : id]
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

    // Get parties
    let parties = [];
    try {
      const [partiesResult] = await db.query(
        `SELECT cp.*, u.name as lawyer_name, u.staff_id as lawyer_staff_id 
         FROM case_parties cp 
         LEFT JOIN users u ON cp.lawyer_id = u.id 
         WHERE cp.case_id = ?`,
        [caseIdNumeric]
      );
      parties = partiesResult;
    } catch (error) {
      console.warn('Case parties table might not exist');
    }

    // Get documents
    let documents = [];
    try {
      const [documentsResult] = await db.query(
        `SELECT d.*, u.name as uploaded_by_name 
         FROM documents d 
         LEFT JOIN users u ON d.uploaded_by = u.id 
         WHERE d.case_id = ? 
         ORDER BY d.uploaded_at DESC`,
        [caseIdNumeric]
      );
      documents = documentsResult;
    } catch (error) {
      console.warn('Documents table might not exist');
    }

    // Get timeline
    let timeline = [];
    try {
      const [timelineResult] = await db.query(
        `SELECT ct.*, u.name as created_by_name 
         FROM case_timeline ct 
         LEFT JOIN users u ON ct.created_by = u.id 
         WHERE ct.case_id = ? 
         ORDER BY ct.date DESC`,
        [caseIdNumeric]
      );
      timeline = timelineResult;
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }

    res.json({
      success: true,
      data: {
        ...caseData,
        parties,
        documents,
        timeline
      }
    });
  } catch (error) {
    console.error('Get case error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// POST /api/cases - Create new case
router.post('/', authorizeRole('judge', 'registrar', 'admin'), async (req, res) => {
  try {
    const { title, type, description, priority, parties, nextHearing } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and type are required'
        }
      });
    }

    // Generate case number
    const year = new Date().getFullYear();
    const [countResult] = await db.query(
      'SELECT COUNT(*) as count FROM cases WHERE YEAR(filed_date) = ?',
      [year]
    );
    const caseNumber = `KDH/${year}/${String(countResult[0].count + 1).padStart(3, '0')}`;

    // Insert case
    const [result] = await db.query(
      `INSERT INTO cases (case_number, title, type, status, priority, description, filed_date, next_hearing, judge_id, created_by, court)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
      [
        caseNumber,
        title,
        type,
        req.user.role === 'judge' ? 'Filed' : 'Pending Approval',
        priority || 'Medium',
        description || '',
        nextHearing || null,
        req.user.role === 'judge' ? req.user.id : null,
        req.user.id,
        req.user.department || null
      ]
    );

    const caseId = result.insertId;

    // Insert parties if provided
    if (parties && parties.length > 0) {
      for (const party of parties) {
        try {
          await db.query(
            'INSERT INTO case_parties (case_id, role, name, lawyer_id) VALUES (?, ?, ?, ?)',
            [caseId, party.role, party.name, party.lawyerId || null]
          );
        } catch (error) {
          console.warn('Case parties table might not exist');
        }
      }
    }

    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by) 
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [caseId, 'Case Filed', `Case ${caseNumber} has been filed`, 'filing', req.user.id]
      );
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'create', 'case', caseId, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.status(201).json({
      success: true,
      data: { id: caseId, caseNumber },
      message: 'Case created successfully'
    });
  } catch (error) {
    console.error('Create case error:', error);
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
