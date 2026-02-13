import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { notifyCaseAssigned, notifyHearingScheduled, notifyCaseApproved } from '../utils/notifications.js';


const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/cases - Get all cases with filters
router.get('/', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20, search, assignedTo } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, u.name as judge_name, lu.name as lawyer_name
      FROM cases c
      LEFT JOIN users u ON c.judge_id = u.id
      LEFT JOIN users lu ON c.lawyer_id = lu.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'judge') {
      query += ' AND c.judge_id = ?';
      params.push(req.user.id);
    }
    // Lawyers can see all cases (assigned and unassigned for requesting assignment)

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

    // Get total count - simplified query without JOINs for better performance
    let countQuery = `
      SELECT COUNT(*) as total
      FROM cases c
      WHERE 1=1
    `;
    const countParams = [];

    // Apply same filters to count query
    if (req.user.role === 'judge') {
      countQuery += ' AND c.judge_id = ?';
      countParams.push(req.user.id);
    } else if (req.user.role === 'lawyer') {
      countQuery += ' AND c.lawyer_id = ?';
      countParams.push(req.user.id);
    }

    if (status) {
      countQuery += ' AND c.status = ?';
      countParams.push(status);
    }

    if (type) {
      countQuery += ' AND c.type = ?';
      countParams.push(type);
    }

    if (search) {
      countQuery += ' AND (c.case_number LIKE ? OR c.title LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (assignedTo) {
      countQuery += ' AND c.judge_id = ?';
      countParams.push(assignedTo);
    }

    const [countResult] = await db.query(countQuery, countParams);
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
      return res.json({
        success: true,
        message: `Case ${id} deleted successfully`
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
router.post('/', authorizeRole('judge', 'registrar', 'admin', 'lawyer'), async (req, res) => {
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

// POST /api/cases/:id/request-assignment - Request case assignment (lawyers only)
router.post('/:id/request-assignment', authorizeRole('lawyer'), async (req, res) => {
  try {
    const { id } = req.params;

    // Decode the case ID to handle IDs with slashes (e.g., "KDH/2026/001")
    const encodedId = id;
    const caseId = decodeURIComponent(encodedId);
    const byNumericId = /^\d+$/.test(caseId);

    // Get the case to verify it exists and is unassigned
    const [cases] = await db.query(
      `SELECT c.id, c.case_number, c.lawyer_id FROM cases c WHERE ${byNumericId ? 'c.id = ?' : 'c.case_number = ?'}`,
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

    // Check if case is already assigned
    if (caseData.lawyer_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_ASSIGNED',
          message: 'Case is already assigned to a lawyer'
        }
      });
    }

    // Check if lawyer already has a pending request for this case
    try {
      const [existingRequests] = await db.query(
        `SELECT id FROM case_assignment_requests
         WHERE case_id = ? AND lawyer_id = ? AND status = 'pending'`,
        [caseData.id, req.user.id]
      );

      if (existingRequests.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'REQUEST_EXISTS',
            message: 'You already have a pending assignment request for this case'
          }
        });
      }
    } catch (error) {
      // Table might not exist, create it
      console.warn('case_assignment_requests table might not exist, creating...');
      await db.query(`
        CREATE TABLE IF NOT EXISTS case_assignment_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          case_id INT NOT NULL,
          lawyer_id INT NOT NULL,
          requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
          reviewed_by INT NULL,
          reviewed_at TIMESTAMP NULL,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
    }

    // Insert assignment request
    await db.query(
      `INSERT INTO case_assignment_requests (case_id, lawyer_id, status)
       VALUES (?, ?, 'pending')`,
      [caseData.id, req.user.id]
    );

    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [caseData.id, 'Assignment Requested', `Lawyer ${req.user.name} requested assignment to case ${caseData.case_number}`, 'assignment_request', req.user.id]
      );
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'request_assignment', 'case', caseData.id, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.json({
      success: true,
      message: 'Assignment request submitted successfully. A judge will review your request.'
    });
  } catch (error) {
    console.error('Request assignment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// PUT /api/cases/:id/assign-lawyer - Assign lawyer to case
router.put('/:id/assign-lawyer', authorizeRole('judge', 'registrar', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { lawyerId } = req.body;

    if (!lawyerId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Lawyer ID is required'
        }
      });
    }

    // Decode the case ID to handle IDs with slashes (e.g., "KDH/2026/001")
    const encodedId = id;
    const caseId = decodeURIComponent(encodedId);
    const byNumericId = /^\d+$/.test(caseId);

    // Get the case to verify it exists
    const [cases] = await db.query(
      `SELECT c.id, c.case_number FROM cases c WHERE ${byNumericId ? 'c.id = ?' : 'c.case_number = ?'}`,
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

    const caseIdNumeric = cases[0].id;

    // Update the case with the assigned lawyer
    await db.query(
      'UPDATE cases SET lawyer_id = ? WHERE id = ?',
      [lawyerId, caseIdNumeric]
    );

    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [caseIdNumeric, 'Lawyer Assigned', `Lawyer assigned to case ${cases[0].case_number}`, 'assignment', req.user.id]
      );
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'assign_lawyer', 'case', caseIdNumeric, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.json({
      success: true,
      message: 'Lawyer assigned successfully'
    });
  } catch (error) {
    console.error('Assign lawyer error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// PUT /api/cases/:id/assign-court - Assign case to court (judge + court)
router.put('/:id/assign-court', authorizeRole('judge', 'registrar', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { court, judgeId } = req.body;

    if (!court || !judgeId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Court and Judge ID are required'
        }
      });
    }

    // Decode the case ID to handle IDs with slashes (e.g., "KDH/2026/001")
    const encodedId = id;
    const caseId = decodeURIComponent(encodedId);
    const byNumericId = /^\d+$/.test(caseId);

    // Get the case to verify it exists
    const [cases] = await db.query(
      `SELECT c.id, c.case_number FROM cases c WHERE ${byNumericId ? 'c.id = ?' : 'c.case_number = ?'}`,
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

    const caseIdNumeric = cases[0].id;

    // Update the case with court and judge
    await db.query(
      'UPDATE cases SET court = ?, judge_id = ?, status = ? WHERE id = ?',
      [court, judgeId, 'Assigned', caseIdNumeric]
    );

    // Get judge name for timeline and notification
    const [judgeResult] = await db.query('SELECT name FROM users WHERE id = ?', [judgeId]);
    const judgeName = judgeResult.length > 0 ? judgeResult[0].name : 'Unknown';

    // Send notification to judge
    await notifyCaseAssigned(parseInt(judgeId), cases[0].case_number, cases[0].title || 'Untitled Case', court);


    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [caseIdNumeric, 'Case Assigned to Court', `Case assigned to ${court} before Hon. ${judgeName}`, 'assignment', req.user.id]
      );
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }

    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'assign_court', 'case', caseIdNumeric, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.json({
      success: true,
      message: 'Case assigned to court successfully'
    });
  } catch (error) {
    console.error('Assign court error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// PUT /api/cases/:id/schedule-hearing - Schedule hearing (update next_hearing)
router.put('/:id/schedule-hearing', authorizeRole('judge', 'registrar', 'admin', 'clerk'), async (req, res) => {
  try {
    const { id } = req.params;
    const { hearingDate } = req.body;

    if (!hearingDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Hearing date is required'
        }
      });
    }

    // Decode the case ID to handle IDs with slashes (e.g., "KDH/2026/001")
    const encodedId = id;
    const caseId = decodeURIComponent(encodedId);
    const byNumericId = /^\d+$/.test(caseId);

    // Get the case to verify it exists
    const [cases] = await db.query(
      `SELECT c.id, c.case_number FROM cases c WHERE ${byNumericId ? 'c.id = ?' : 'c.case_number = ?'}`,
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

    const caseIdNumeric = cases[0].id;

    // Update the case with the hearing date
    await db.query(
      'UPDATE cases SET next_hearing = ? WHERE id = ?',
      [hearingDate, caseIdNumeric]
    );

    // Get case details for notification
    const [caseDetails] = await db.query(
      'SELECT title, judge_id, lawyer_id FROM cases WHERE id = ?',
      [caseIdNumeric]
    );

    // Send notifications to judge and lawyer if assigned
    if (caseDetails.length > 0) {
      const caseTitle = caseDetails[0].title || 'Untitled Case';
      const courtName = caseDetails[0].court || 'the court';
      
      if (caseDetails[0].judge_id) {
        await notifyHearingScheduled(caseDetails[0].judge_id, cases[0].case_number, caseTitle, hearingDate, courtName);
      }
      if (caseDetails[0].lawyer_id) {
        await notifyHearingScheduled(caseDetails[0].lawyer_id, cases[0].case_number, caseTitle, hearingDate, courtName);
      }
    }

    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [caseIdNumeric, 'Hearing Scheduled', `Hearing scheduled for ${hearingDate}`, 'hearing', req.user.id]
      );
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }


    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'schedule_hearing', 'case', caseIdNumeric, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.json({
      success: true,
      message: 'Hearing scheduled successfully'
    });
  } catch (error) {
    console.error('Schedule hearing error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// PUT /api/cases/:id/approve - Approve case registration (update status)
router.put('/:id/approve', authorizeRole('judge', 'registrar', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Decode the case ID to handle IDs with slashes (e.g., "KDH/2026/001")
    const encodedId = id;
    const caseId = decodeURIComponent(encodedId);
    const byNumericId = /^\d+$/.test(caseId);

    // Get the case to verify it exists
    const [cases] = await db.query(
      `SELECT c.id, c.case_number, c.status FROM cases c WHERE ${byNumericId ? 'c.id = ?' : 'c.case_number = ?'}`,
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
    
    // Check if case is already approved
    if (caseData.status === 'Filed' || caseData.status === 'Assigned' || caseData.status === 'In Progress') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_APPROVED',
          message: 'Case is already approved'
        }
      });
    }

    const caseIdNumeric = caseData.id;

    // Update the case status to 'Filed'
    await db.query(
      'UPDATE cases SET status = ? WHERE id = ?',
      ['Filed', caseIdNumeric]
    );

    // Get case creator for notification
    const [caseInfo] = await db.query(
      'SELECT title, created_by FROM cases WHERE id = ?',
      [caseIdNumeric]
    );

    // Send notification to case creator
    if (caseInfo.length > 0 && caseInfo[0].created_by) {
      await notifyCaseApproved(caseInfo[0].created_by, cases[0].case_number, caseInfo[0].title || 'Untitled Case');
    }

    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [caseIdNumeric, 'Case Registration Approved', `Case registration approved by ${req.user.name}`, 'approval', req.user.id]
      );
    } catch (error) {
      console.warn('Case timeline table might not exist');
    }


    // Log action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'approve_case', 'case', caseIdNumeric, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist');
    }

    res.json({
      success: true,
      message: 'Case registration approved successfully'
    });
  } catch (error) {
    console.error('Approve case error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// DELETE /api/cases/:id - Delete case (Chief Judge, Admin, or Court Admin only) with URL decoding
router.delete('/:id', authorizeRole('judge', 'admin', 'court_admin'), async (req, res) => {
  try {
    // Decode the case ID to handle IDs with slashes (e.g., "KDH/2026/001")
    const encodedId = req.params.id;
    const id = decodeURIComponent(encodedId);
    const byNumericId = /^\d+$/.test(id);

    // Get the case to get the numeric ID and case number
    const [cases] = await db.query(
      `SELECT c.id, c.case_number FROM cases c WHERE ${byNumericId ? 'c.id = ?' : 'c.case_number = ?'}`,
      [byNumericId ? parseInt(id, 10) : id]
    );

    if (cases.length === 0) {
      return res.json({
        success: true,
        message: `Case ${id} deleted successfully`
      });
    }

    const caseIdNumeric = cases[0].id;
    const caseNumber = cases[0].case_number;

    // Delete related records first (to maintain referential integrity)
    // Delete case parties
    try {
      await db.query('DELETE FROM case_parties WHERE case_id = ?', [caseIdNumeric]);
    } catch (error) {
      console.warn('Case parties table might not exist or error deleting:', error.message);
    }

    // Delete case timeline entries
    try {
      await db.query('DELETE FROM case_timeline WHERE case_id = ?', [caseIdNumeric]);
    } catch (error) {
      console.warn('Case timeline table might not exist or error deleting:', error.message);
    }

    // Delete documents (we'll keep the files on disk for now, just remove DB records)
    try {
      await db.query('DELETE FROM documents WHERE case_id = ?', [caseIdNumeric]);
    } catch (error) {
      console.warn('Documents table might not exist or error deleting:', error.message);
    }

    // Finally, delete the case
    await db.query('DELETE FROM cases WHERE id = ?', [caseIdNumeric]);

    // Log the action
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, 'delete', 'case', caseIdNumeric, req.ip]
      );
    } catch (error) {
      console.warn('Audit logs table might not exist:', error.message);
    }

    res.json({
      success: true,
      message: `Case ${caseNumber} deleted successfully`
    });
  } catch (error) {
    console.error('Delete case error:', error);
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
