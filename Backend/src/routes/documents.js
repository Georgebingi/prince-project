import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Test endpoint - no authentication required
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Documents router is working',
    timestamp: new Date().toISOString()
  });
});

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

    // Verify case exists - handle both numeric ID and case_number (e.g., "KDH/2026/001")
    let [cases] = await db.query('SELECT id FROM cases WHERE id = ? OR case_number = ?', [caseId, caseId]);
    if (cases.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Case not found'
        }
      });
    }

    // Get the numeric ID from the database
    const numericCaseId = cases[0].id;

    // Move file from temp to case folder
    const caseDir = path.join(__dirname, '..', 'public', 'documents', numericCaseId.toString());
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const destPath = path.join(caseDir, fileName);

    // Create case directory if it doesn't exist
    if (!fs.existsSync(caseDir)) {
      fs.mkdirSync(caseDir, { recursive: true });
    }

    // Move file from temp to case folder
    const tempFilePath = req.file.path;
    fs.renameSync(tempFilePath, destPath);

    // Store relative file path
    const filePath = `documents/${numericCaseId}/${fileName}`;


    // Save document metadata to database
    const [result] = await db.query(
      `INSERT INTO documents (name, type, case_id, uploaded_by, file_path, file_size, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        req.file.originalname,
        type,
        numericCaseId,
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
        [numericCaseId, 'Document Uploaded', `Document "${req.file.originalname}" uploaded`, 'admin', req.user.id]
      );
    } catch {
      console.warn('Case timeline table might not exist');
    }

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'create', 'document', result.insertId, req.ip]
      );
    } catch {
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
    const { caseId, type, status, page = 1, limit = 20, lawyerId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT d.*, u.name as uploaded_by_name, c.case_number
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN cases c ON d.case_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by case ID - handle both numeric ID and case_number
    if (caseId) {
      query += ' AND (d.case_id = ? OR c.case_number = ?)';
      params.push(caseId, caseId);
    }

    // Filter by document type
    if (type) {
      query += ' AND d.type = ?';
      params.push(type);
    }

    // Filter by status
    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    // Filter by lawyer - get documents for cases assigned to this lawyer
    // OR documents uploaded by this lawyer
    if (lawyerId) {
      query += ' AND (c.lawyer_id = ? OR d.uploaded_by = ?)';
      params.push(lawyerId, lawyerId);
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

// GET /api/documents/:id/download - Download a document
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    // Get document metadata from database
    const [documents] = await db.query(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    }

    const document = documents[0];

    const filePath = document.file_path;

    // Construct full path - files are stored in public/documents relative to project root
    // When server is started from Backend folder, 'public' refers to Backend/public
    // But uploads save to 'public/documents' relative to where server starts
    // To handle both cases, check multiple possible locations
    const possiblePaths = [
      path.join(__dirname, '..', '..', 'public', filePath),  // Backend/public/documents/...
      path.join(__dirname, '..', 'public', filePath),         // Backend/public/documents/... (alternative)
      path.resolve('public', filePath)                         // Project root public/documents/...
    ];

    let fullPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        fullPath = p;
        break;
      }
    }

    if (!fullPath) {
      console.error('File not found in any location. Searched paths:', possiblePaths);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'File not found on server'
        }
      });
    }

    // Expose Content-Disposition header for frontend access
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    // Use Express built-in download (safer + cleaner)
    return res.download(fullPath, document.name);

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Internal server error'
      }
    });
  }
});

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get document metadata from database
    const [documents] = await db.query(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    }

    const document = documents[0];
    const filePath = document.file_path;

    // Find and delete the file
    const possiblePaths = [
      path.join(__dirname, '..', '..', 'public', filePath),
      path.join(__dirname, '..', 'public', filePath),
      path.resolve('public', filePath)
    ];

    let fileDeleted = false;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
          fileDeleted = true;
          break;
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
        }
      }
    }

    // Delete document record from database
    await db.query('DELETE FROM documents WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Document deleted successfully',
      fileDeleted
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Internal server error'
      }
    });
  }
});


export default router;
