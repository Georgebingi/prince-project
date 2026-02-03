import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/documents/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file uploaded'
        }
      });
    }

    const { caseId, type, description } = req.body;

    if (!caseId || !type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Case ID and document type are required'
        }
      });
    }

    // Verify case exists
    const [cases] = await db.query('SELECT id FROM cases WHERE id = ?', [caseId]);
    if (cases.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Case not found'
        }
      });
    }

    // For now, store file path (you'll implement cloud storage later)
    const filePath = `documents/${caseId}/${Date.now()}_${req.file.originalname}`;

    // Save document metadata to database
    const [result] = await db.query(
      `INSERT INTO documents (name, type, case_id, uploaded_by, file_path, file_size, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        req.file.originalname,
        type,
        caseId,
        req.user.id,
        filePath,
        req.file.size,
        description || ''
      ]
    );

    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by) 
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [caseId, 'Document Uploaded', `Document "${req.file.originalname}" uploaded`, 'admin', req.user.id]
      );
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'create', 'document', result.insertId, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name: req.file.originalname,
        url: filePath,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Internal server error'
      }
    });
  }
});

// GET /api/documents - Get all documents with filters
router.get('/', async (req, res) => {
  try {
    const { caseId, type, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT d.*, u.name as uploaded_by_name, c.case_number 
      FROM documents d 
      LEFT JOIN users u ON d.uploaded_by = u.id 
      LEFT JOIN cases c ON d.case_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (caseId) {
      query += ' AND d.case_id = ?';
      params.push(caseId);
    }

    if (type) {
      query += ' AND d.type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT d.*, u.name as uploaded_by_name, c.case_number',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    query += ' ORDER BY d.uploaded_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [documents] = await db.query(query, params);

    res.json({
      success: true,
      data: documents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
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
