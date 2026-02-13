import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';




const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/calendar/hearings - Get all scheduled hearings with filters
router.get('/hearings', async (req, res) => {
  try {
    const { startDate, endDate, court, judgeId, caseId } = req.query;

    let query = `
      SELECT 
        c.id,
        c.case_number,
        c.title,
        c.type,
        c.status,
        c.next_hearing as date,
        c.court,
        c.priority,
        u.name as judge_name,
        lu.name as lawyer_name,
        CASE 
          WHEN c.type = 'Criminal' THEN 'bg-red-600'
          WHEN c.type = 'Civil' THEN 'bg-blue-600'
          WHEN c.type = 'Family' THEN 'bg-emerald-600'
          WHEN c.type = 'Commercial' THEN 'bg-purple-600'
          WHEN c.type = 'Appeal' THEN 'bg-amber-600'
          ELSE 'bg-slate-600'
        END as color
      FROM cases c
      LEFT JOIN users u ON c.judge_id = u.id
      LEFT JOIN users lu ON c.lawyer_id = lu.id
      WHERE c.next_hearing IS NOT NULL 
        AND c.next_hearing REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        AND c.status NOT IN ('Closed', 'Disposed')

    `;
    const params = [];

    // Apply date range filter
    if (startDate) {
      query += ' AND c.next_hearing >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND c.next_hearing <= ?';
      params.push(endDate);
    }

    // Apply court filter
    if (court) {
      query += ' AND c.court = ?';
      params.push(court);
    }

    // Apply judge filter
    if (judgeId) {
      query += ' AND c.judge_id = ?';
      params.push(judgeId);
    }

    // Apply case filter
    if (caseId) {
      query += ' AND (c.id = ? OR c.case_number = ?)';
      params.push(caseId, caseId);
    }

    // Role-based filtering
    if (req.user.role === 'judge') {
      query += ' AND c.judge_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'lawyer') {
      query += ' AND c.lawyer_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY c.next_hearing ASC, c.priority DESC';

    const [hearings] = await db.query(query, params);

    // Format hearings for frontend
    const formattedHearings = hearings.map(h => ({
      id: `${h.case_number || h.id}-${h.date}`,
      caseId: h.case_number || String(h.id),
      title: h.title,
      type: h.type,
      date: h.date,
      time: '09:00', // Default time, can be enhanced with time slots
      court: h.court || 'Unassigned',
      judge: h.judge_name || 'Unassigned',
      lawyer: h.lawyer_name,
      priority: h.priority,
      status: h.status,
      color: h.color
    }));

    res.json({
      success: true,
      data: formattedHearings,
      count: formattedHearings.length
    });
  } catch (error) {
    console.error('Get calendar hearings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/calendar/hearings/:date - Get hearings for specific date
router.get('/hearings/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format. Use YYYY-MM-DD'
        }
      });
    }

    let query = `
      SELECT 
        c.id,
        c.case_number,
        c.title,
        c.type,
        c.status,
        c.next_hearing as date,
        c.court,
        c.priority,
        u.name as judge_name,
        lu.name as lawyer_name,
        CASE 
          WHEN c.type = 'Criminal' THEN 'bg-red-600'
          WHEN c.type = 'Civil' THEN 'bg-blue-600'
          WHEN c.type = 'Family' THEN 'bg-emerald-600'
          WHEN c.type = 'Commercial' THEN 'bg-purple-600'
          WHEN c.type = 'Appeal' THEN 'bg-amber-600'
          ELSE 'bg-slate-600'
        END as color
      FROM cases c
      LEFT JOIN users u ON c.judge_id = u.id
      LEFT JOIN users lu ON c.lawyer_id = lu.id
      WHERE c.next_hearing = ?
        AND c.status NOT IN ('Closed', 'Disposed')
    `;
    const params = [date];

    // Role-based filtering
    if (req.user.role === 'judge') {
      query += ' AND c.judge_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'lawyer') {
      query += ' AND c.lawyer_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY c.priority DESC, c.created_at ASC';

    const [hearings] = await db.query(query, params);

    const formattedHearings = hearings.map(h => ({
      id: `${h.case_number || h.id}-${h.date}`,
      caseId: h.case_number || String(h.id),
      title: h.title,
      type: h.type,
      date: h.date,
      time: '09:00',
      court: h.court || 'Unassigned',
      judge: h.judge_name || 'Unassigned',
      lawyer: h.lawyer_name,
      priority: h.priority,
      status: h.status,
      color: h.color
    }));

    res.json({
      success: true,
      data: formattedHearings,
      date: date,
      count: formattedHearings.length
    });
  } catch (error) {
    console.error('Get date hearings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/calendar/availability - Check court room availability
router.get('/availability', async (req, res) => {
  try {
    const { date, court } = req.query;

    if (!date || !court) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Date and court are required'
        }
      });
    }

    // Get existing hearings for the date and court
    const [existingHearings] = await db.query(
      `SELECT c.id, c.case_number, c.title, c.next_hearing
       FROM cases c
       WHERE c.next_hearing = ? 
         AND c.court = ?
         AND c.status NOT IN ('Closed', 'Disposed')
         AND c.next_hearing REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'`,
      [date, court]
    );


    // Define time slots (9 AM to 4 PM)
    const timeSlots = [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: true },
      { time: '12:00', available: true },
      { time: '14:00', available: true },
      { time: '15:00', available: true },
      { time: '16:00', available: true }
    ];

    // Mark slots as unavailable if hearings exist (simplified logic)
    // In a real system, you'd have time_slot column in cases table
    const bookedSlots = existingHearings.length;
    for (let i = 0; i < Math.min(bookedSlots, timeSlots.length); i++) {
      timeSlots[i].available = false;
      timeSlots[i].caseId = existingHearings[i].case_number || existingHearings[i].id;
      timeSlots[i].caseTitle = existingHearings[i].title;
    }

    res.json({
      success: true,
      data: {
        date,
        court,
        timeSlots,
        totalHearings: existingHearings.length
      }
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/calendar/stats - Get calendar statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get hearings today
    const [todayHearings] = await db.query(
      `SELECT COUNT(*) as count FROM cases 
       WHERE next_hearing = ? 
         AND status NOT IN ('Closed', 'Disposed')
         AND next_hearing REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'`,
      [today]
    );

    // Get hearings this week
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const [weekHearings] = await db.query(
      `SELECT COUNT(*) as count FROM cases 
       WHERE next_hearing BETWEEN ? AND ? 
         AND status NOT IN ('Closed', 'Disposed')
         AND next_hearing REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'`,
      [today, weekEnd.toISOString().split('T')[0]]
    );

    // Get hearings by court
    const [courtStats] = await db.query(
      `SELECT court, COUNT(*) as count 
       FROM cases 
       WHERE next_hearing >= ? 
         AND status NOT IN ('Closed', 'Disposed')
         AND court IS NOT NULL
         AND next_hearing REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
       GROUP BY court`,
      [today]
    );

    // Get hearings by type
    const [typeStats] = await db.query(
      `SELECT type, COUNT(*) as count 
       FROM cases 
       WHERE next_hearing >= ? 
         AND status NOT IN ('Closed', 'Disposed')
         AND next_hearing REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
       GROUP BY type`,
      [today]
    );


    res.json({
      success: true,
      data: {
        today: todayHearings[0].count,
        thisWeek: weekHearings[0].count,
        byCourt: courtStats,
        byType: typeStats
      }
    });
  } catch (error) {
    console.error('Get calendar stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// POST /api/calendar/hearings - Schedule a new hearing (alias for case update)
router.post('/hearings', authorizeRole('judge', 'registrar', 'admin', 'clerk'), async (req, res) => {
  try {
    const { caseId, hearingDate, hearingTime, court } = req.body;


    if (!caseId || !hearingDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Case ID and hearing date are required'
        }
      });
    }

    // Decode case ID
    const byNumericId = /^\d+$/.test(caseId);
    
    // Get case
    const [cases] = await db.query(
      `SELECT c.id, c.case_number FROM cases c 
       WHERE ${byNumericId ? 'c.id = ?' : 'c.case_number = ?'}`,
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

    // Update case with new hearing date
    await db.query(
      'UPDATE cases SET next_hearing = ?, court = COALESCE(?, court), updated_at = NOW() WHERE id = ?',
      [hearingDate, court || null, caseIdNumeric]
    );

    // Add timeline entry
    try {
      await db.query(
        `INSERT INTO case_timeline (case_id, date, title, description, type, created_by)
         VALUES (?, CURDATE(), ?, ?, ?, ?)`,
        [caseIdNumeric, 'Hearing Scheduled', `Hearing scheduled for ${hearingDate}${court ? ` in ${court}` : ''}`, 'hearing', req.user.id]
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
      message: 'Hearing scheduled successfully',
      data: {
        caseId: caseId,
        hearingDate,
        hearingTime,
        court
      }
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

export default router;
