import express from 'express';
import { body, param, validationResult } from 'express-validator';

import pool from '../config/database.js';

import { authenticateToken } from '../middleware/auth.js';
import { logAudit } from '../utils/notifications.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }
  next();
};

/**
 * GET /api/partners
 * Get all partner agencies with their connection status
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        pa.id,
        pa.name,
        pa.code,
        pa.type,
        pa.description,
        pa.contact_email,
        pa.contact_phone,
        pa.status as agency_status,
        pc.status as connection_status,
        pc.latency_ms,
        pc.last_sync_at,
        pc.uptime_percentage,
        pc.encryption_protocol,
        pc.tls_version,
        pc.health_check_at,
        pc.error_message
      FROM partner_agencies pa
      LEFT JOIN partner_connections pc ON pa.id = pc.partner_id
      WHERE pa.status = 'active'
      ORDER BY pa.name ASC
    `;

    const [partners] = await pool.query(query);

    // Format the response
    const formattedPartners = partners.map(partner => ({
      id: partner.id,
      name: partner.name,
      code: partner.code,
      type: partner.type,
      description: partner.description,
      contact: {
        email: partner.contact_email,
        phone: partner.contact_phone
      },
      status: partner.connection_status || 'Disconnected',
      latency: partner.latency_ms ? `${partner.latency_ms}ms` : '-',
      lastSync: partner.last_sync_at 
        ? formatTimeAgo(partner.last_sync_at)
        : 'Never',
      uptime: partner.uptime_percentage || 99.99,
      encryption: partner.encryption_protocol || 'AES-256',
      tlsVersion: partner.tls_version || '1.3',
      healthCheckedAt: partner.health_check_at,
      errorMessage: partner.error_message
    }));

    res.json({
      success: true,
      data: formattedPartners,
      count: formattedPartners.length
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch partner agencies'
      }
    });
  }
});

/**
 * GET /api/partners/stats
 * Get network statistics
 */
router.get('/stats', async (req, res) => {

  try {
    // Get overall stats
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT pa.id) as total_partners,
        COUNT(DISTINCT CASE WHEN pc.status = 'Connected' THEN pa.id END) as connected_count,
        COUNT(DISTINCT CASE WHEN pc.status = 'Syncing' THEN pa.id END) as syncing_count,
        COUNT(DISTINCT CASE WHEN pc.status = 'Disconnected' OR pc.status IS NULL THEN pa.id END) as disconnected_count,
        AVG(pc.latency_ms) as avg_latency,
        MIN(pc.uptime_percentage) as min_uptime
      FROM partner_agencies pa
      LEFT JOIN partner_connections pc ON pa.id = pc.partner_id
      WHERE pa.status = 'active'
    `;

    const [statsResult] = await pool.query(statsQuery);
    const stats = statsResult[0];

    // Get recent exchanges count
    const exchangesQuery = `
      SELECT 
        COUNT(*) as total_exchanges,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_exchanges,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_exchanges,
        COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failed_exchanges,
        COUNT(CASE WHEN DATE(initiated_at) = CURDATE() THEN 1 END) as today_exchanges
      FROM data_exchanges
      WHERE initiated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;

    const [exchangesResult] = await pool.query(exchangesQuery);
    const exchanges = exchangesResult[0];

    res.json({
      success: true,
      data: {
        network: {
          totalPartners: stats.total_partners || 0,
          connected: stats.connected_count || 0,
          syncing: stats.syncing_count || 0,
          disconnected: stats.disconnected_count || 0,
          averageLatency: Math.round(stats.avg_latency || 0),
          uptime: stats.min_uptime ? parseFloat(stats.min_uptime) : 99.99,

          encryption: 'AES-256',
          tlsVersion: '1.3'
        },
        exchanges: {
          total30Days: exchanges.total_exchanges || 0,
          completed: exchanges.completed_exchanges || 0,
          pending: exchanges.pending_exchanges || 0,
          failed: exchanges.failed_exchanges || 0,
          today: exchanges.today_exchanges || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching partner stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch partner statistics'
      }
    });
  }
});

/**
 * GET /api/partners/exchanges
 * Get data exchange history
 */
router.get('/exchanges', async (req, res) => {

  try {
    const { limit = 20, offset = 0, partnerId, status } = req.query;

    let query = `
      SELECT 
        de.*,
        pa.name as partner_name,
        pa.code as partner_code,
        pa.type as partner_type,
        c.case_number,
        c.title as case_title,
        u.name as initiated_by_name
      FROM data_exchanges de
      JOIN partner_agencies pa ON de.partner_id = pa.id
      LEFT JOIN cases c ON de.case_id = c.id
      JOIN users u ON de.initiated_by = u.id
      WHERE 1=1
    `;

    const params = [];

    if (partnerId) {
      query += ' AND de.partner_id = ?';
      params.push(partnerId);
    }

    if (status) {
      query += ' AND de.status = ?';
      params.push(status);
    }

    query += ' ORDER BY de.initiated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [exchanges] = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM data_exchanges de
      JOIN partner_agencies pa ON de.partner_id = pa.id
      WHERE 1=1
    `;
    
    const countParams = [];
    if (partnerId) {
      countQuery += ' AND de.partner_id = ?';
      countParams.push(partnerId);
    }
    if (status) {
      countQuery += ' AND de.status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    const formattedExchanges = exchanges.map(exchange => ({
      id: exchange.id,
      exchangeId: exchange.exchange_id,
      partner: {
        id: exchange.partner_id,
        name: exchange.partner_name,
        code: exchange.partner_code,
        type: exchange.partner_type
      },
      case: exchange.case_id ? {
        id: exchange.case_id,
        number: exchange.case_number,
        title: exchange.case_title
      } : null,
      type: exchange.type,
      direction: exchange.direction,
      status: exchange.status,
      initiatedBy: {
        id: exchange.initiated_by,
        name: exchange.initiated_by_name
      },
      initiatedAt: exchange.initiated_at,
      completedAt: exchange.completed_at,
      errorDetails: exchange.error_details
    }));

    res.json({
      success: true,
      data: formattedExchanges,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > (parseInt(offset) + parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching data exchanges:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch data exchange history'
      }
    });
  }
});

/**
 * GET /api/partners/:id
 * Get specific partner details
 */
router.get('/:id', [
  param('id').isInt().withMessage('Partner ID must be an integer'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        pa.*,
        pc.status as connection_status,
        pc.latency_ms,
        pc.last_sync_at,
        pc.uptime_percentage,
        pc.encryption_protocol,
        pc.tls_version,
        pc.health_check_at,
        pc.error_message
      FROM partner_agencies pa
      LEFT JOIN partner_connections pc ON pa.id = pc.partner_id
      WHERE pa.id = ? AND pa.status = 'active'
    `;

    const [partners] = await pool.query(query, [id]);

    if (partners.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Partner agency not found'
        }
      });
    }

    const partner = partners[0];

    res.json({
      success: true,
      data: {
        id: partner.id,
        name: partner.name,
        code: partner.code,
        type: partner.type,
        description: partner.description,
        contact: {
          email: partner.contact_email,
          phone: partner.contact_phone
        },
        connection: {
          status: partner.connection_status || 'Disconnected',
          latency: partner.latency_ms,
          lastSync: partner.last_sync_at,
          uptime: partner.uptime_percentage,
          encryption: partner.encryption_protocol,
          tlsVersion: partner.tls_version,
          healthCheckedAt: partner.health_check_at,
          errorMessage: partner.error_message
        },
        createdAt: partner.created_at,
        updatedAt: partner.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch partner agency details'
      }
    });
  }
});

/**
 * POST /api/partners/exchanges

 * Initiate new data transfer
 */
router.post('/exchanges', [
  body('partnerId').isInt().withMessage('Partner ID is required'),
  body('type').isIn(['Warrant Request', 'Prisoner Remand', 'Evidence Transfer', 'Case Data', 'Judgment', 'Other']).withMessage('Invalid exchange type'),
  body('caseId').optional().isInt().withMessage('Case ID must be an integer'),
  body('direction').isIn(['outbound', 'inbound']).withMessage('Direction must be outbound or inbound'),
  body('dataPayload').optional().isObject().withMessage('Data payload must be an object'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { partnerId, type, caseId, direction, dataPayload } = req.body;
    const userId = req.user.id;

    // Generate exchange ID
    const exchangeId = `TRX-${Date.now().toString(36).toUpperCase()}`;

    const query = `
      INSERT INTO data_exchanges (
        exchange_id, partner_id, case_id, type, direction, 
        status, data_payload, initiated_by, initiated_at
      ) VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, NOW())
    `;

    const [result] = await pool.query(query, [
      exchangeId,
      partnerId,
      caseId || null,
      type,
      direction,
      JSON.stringify(dataPayload || {}),
      userId
    ]);

    // Log the audit
    await logAudit({
      userId,
      action: 'DATA_EXCHANGE_INITIATED',
      resource: 'data_exchanges',
      resourceId: result.insertId,
      details: {
        exchangeId,
        partnerId,
        type,
        direction
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        exchangeId,
        partnerId,
        type,
        direction,
        status: 'Pending',
        initiatedAt: new Date().toISOString()
      },
      message: 'Data exchange initiated successfully'
    });
  } catch (error) {
    console.error('Error creating data exchange:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to initiate data exchange'
      }
    });
  }
});

/**
 * PUT /api/partners/exchanges/:id/status
 * Update data exchange status
 */
router.put('/exchanges/:id/status', [
  param('id').isInt().withMessage('Exchange ID must be an integer'),
  body('status').isIn(['Processing', 'Completed', 'Failed', 'Cancelled']).withMessage('Invalid status'),
  body('errorDetails').optional().isString(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, errorDetails } = req.body;
    const userId = req.user.id;

    const query = `
      UPDATE data_exchanges 
      SET status = ?, 
          completed_at = CASE WHEN ? IN ('Completed', 'Failed', 'Cancelled') THEN NOW() ELSE completed_at END,
          error_details = ?
      WHERE id = ?
    `;

    await pool.query(query, [status, status, errorDetails || null, id]);

    // Log the audit
    await logAudit({
      userId,
      action: 'DATA_EXCHANGE_STATUS_UPDATED',
      resource: 'data_exchanges',
      resourceId: id,
      details: {
        status,
        errorDetails
      }
    });

    res.json({
      success: true,
      message: 'Data exchange status updated successfully'
    });
  } catch (error) {
    console.error('Error updating exchange status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update data exchange status'
      }
    });
  }
});

/**
 * PUT /api/partners/:id/status
 * Update partner connection status
 */
router.put('/:id/status', [
  param('id').isInt().withMessage('Partner ID must be an integer'),
  body('status').isIn(['Connected', 'Disconnected', 'Syncing', 'Error']).withMessage('Invalid status'),
  body('latency').optional().isInt().withMessage('Latency must be an integer'),
  body('errorMessage').optional().isString(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, latency, errorMessage } = req.body;

    // Check if connection record exists
    const [existing] = await pool.query(
      'SELECT id FROM partner_connections WHERE partner_id = ?',
      [id]
    );

    if (existing.length === 0) {
      // Create new connection record
      await pool.query(`
        INSERT INTO partner_connections (
          partner_id, status, latency_ms, last_sync_at, 
          health_check_at, error_message
        ) VALUES (?, ?, ?, NOW(), NOW(), ?)
      `, [id, status, latency || 0, errorMessage || null]);
    } else {
      // Update existing record
      await pool.query(`
        UPDATE partner_connections 
        SET status = ?,
            latency_ms = ?,
            last_sync_at = CASE WHEN ? = 'Connected' THEN NOW() ELSE last_sync_at END,
            health_check_at = NOW(),
            error_message = ?
        WHERE partner_id = ?
      `, [status, latency || 0, status, errorMessage || null, id]);
    }

    res.json({
      success: true,
      message: 'Partner connection status updated successfully'
    });
  } catch (error) {
    console.error('Error updating partner status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update partner connection status'
      }
    });
  }
});

/**
 * POST /api/partners/:id/sync
 * Trigger manual sync with partner
 */
router.post('/:id/sync', [
  param('id').isInt().withMessage('Partner ID must be an integer'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Update status to syncing
    await pool.query(`
      UPDATE partner_connections 
      SET status = 'Syncing', health_check_at = NOW()
      WHERE partner_id = ?
    `, [id]);

    // Log the audit
    await logAudit({
      userId,
      action: 'PARTNER_SYNC_TRIGGERED',
      resource: 'partner_connections',
      resourceId: id,
      details: {
        partnerId: id,
        triggeredManually: true
      }
    });

    // Simulate sync completion after 3 seconds
    setTimeout(async () => {
      try {
        await pool.query(`
          UPDATE partner_connections 
          SET status = 'Connected', last_sync_at = NOW(), health_check_at = NOW()
          WHERE partner_id = ?
        `, [id]);
        console.log(`[SYNC] Partner ${id} sync completed`);
      } catch (err) {
        console.error(`[SYNC] Error completing sync for partner ${id}:`, err);
      }
    }, 3000);

    res.json({
      success: true,
      message: 'Manual sync triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering sync:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SYNC_ERROR',
        message: 'Failed to trigger manual sync'
      }
    });
  }
});


// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return past.toLocaleDateString();
}

export default router;
