import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/reports/dashboard-stats - Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'admin' || userRole === 'registrar') {
      // Admin/Registrar sees all cases
      const [totalCases] = await db.query('SELECT COUNT(*) as total FROM cases');
      const [pendingCases] = await db.query("SELECT COUNT(*) as total FROM cases WHERE status = 'Pending Approval'");
      const [completedCases] = await db.query("SELECT COUNT(*) as total FROM cases WHERE status = 'Closed'");
      const [upcomingHearings] = await db.query(
        'SELECT COUNT(*) as total FROM hearings WHERE date >= CURDATE()'
      );

      stats = {
        totalCases: totalCases[0].total,
        pendingCases: pendingCases[0].total,
        completedCases: completedCases[0].total,
        upcomingHearings: upcomingHearings[0].total || 0
      };
    } else if (userRole === 'judge') {
      // Judge sees only their cases
      const [totalCases] = await db.query('SELECT COUNT(*) as total FROM cases WHERE judge_id = ?', [userId]);
      const [pendingCases] = await db.query(
        "SELECT COUNT(*) as total FROM cases WHERE judge_id = ? AND status = 'Pending Approval'",
        [userId]
      );
      const [completedCases] = await db.query(
        "SELECT COUNT(*) as total FROM cases WHERE judge_id = ? AND status = 'Closed'",
        [userId]
      );
      const [upcomingHearings] = await db.query(
        'SELECT COUNT(*) as total FROM hearings WHERE judge_id = ? AND date >= CURDATE()',
        [userId]
      );

      stats = {
        totalCases: totalCases[0].total,
        pendingCases: pendingCases[0].total,
        completedCases: completedCases[0].total,
        upcomingHearings: upcomingHearings[0].total || 0
      };
    } else if (userRole === 'lawyer') {
      // Lawyer sees cases they're involved in
      const [totalCases] = await db.query(
        `SELECT COUNT(DISTINCT c.id) as total 
         FROM cases c 
         JOIN case_parties cp ON c.id = cp.case_id 
         WHERE cp.lawyer_id = ?`,
        [userId]
      );
      const [pendingCases] = await db.query(
        `SELECT COUNT(DISTINCT c.id) as total 
         FROM cases c 
         JOIN case_parties cp ON c.id = cp.case_id 
         WHERE cp.lawyer_id = ? AND c.status = 'Pending Approval'`,
        [userId]
      );
      const [completedCases] = await db.query(
        `SELECT COUNT(DISTINCT c.id) as total 
         FROM cases c 
         JOIN case_parties cp ON c.id = cp.case_id 
         WHERE cp.lawyer_id = ? AND c.status = 'Closed'`,
        [userId]
      );

      stats = {
        totalCases: totalCases[0].total,
        pendingCases: pendingCases[0].total,
        completedCases: completedCases[0].total,
        upcomingHearings: 0
      };
    } else {
      stats = {
        totalCases: 0,
        pendingCases: 0,
        completedCases: 0,
        upcomingHearings: 0
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/reports/case-statistics - Get case statistics
router.get('/case-statistics', authorizeRole('admin', 'registrar', 'auditor'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
      dateFilter = ' WHERE filed_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Cases by status
    const [byStatus] = await db.query(
      `SELECT status, COUNT(*) as count 
       FROM cases 
       ${dateFilter}
       GROUP BY status`,
      params
    );

    // Cases by type
    const [byType] = await db.query(
      `SELECT type, COUNT(*) as count 
       FROM cases 
       ${dateFilter}
       GROUP BY type`,
      params
    );

    // Cases by month
    const [byMonth] = await db.query(
      `SELECT DATE_FORMAT(filed_date, '%Y-%m') as month, COUNT(*) as count 
       FROM cases 
       ${dateFilter}
       GROUP BY DATE_FORMAT(filed_date, '%Y-%m') 
       ORDER BY month DESC 
       LIMIT 12`,
      params
    );

    res.json({
      success: true,
      data: {
        byStatus,
        byType,
        byMonth
      }
    });
  } catch (error) {
    console.error('Get case statistics error:', error);
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
