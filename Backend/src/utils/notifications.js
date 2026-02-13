import db from '../config/database.js';

/**
 * Create a notification for a user
 * @param {Object} params - Notification parameters
 * @param {number} params.userId - User ID to notify
 * @param {string} params.type - Notification type (case_assigned, hearing_scheduled, etc.)
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} [params.relatedResourceType] - Related resource type (case, document, etc.)
 * @param {number} [params.relatedResourceId] - Related resource ID
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedResourceType = null,
  relatedResourceId = null
}) {
  try {
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, type, title, message, related_resource_type, related_resource_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, relatedResourceType, relatedResourceId]
    );

    return {
      id: result.insertId,
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Create notification error:', error);
    // Don't throw - notifications should not break main functionality
    return null;
  }
}

/**
 * Create notification for case assignment
 * @param {number} judgeId - Judge user ID
 * @param {string} caseNumber - Case number
 * @param {string} caseTitle - Case title
 * @param {string} court - Court name
 */
export async function notifyCaseAssigned(judgeId, caseNumber, caseTitle, court) {
  return createNotification({
    userId: judgeId,
    type: 'case_assigned',
    title: 'New Case Assigned',
    message: `You have been assigned to case ${caseNumber}: ${caseTitle} at ${court}`,
    relatedResourceType: 'case',
    relatedResourceId: null // Will be updated when we have the case ID
  });
}

/**
 * Create notification for hearing scheduled
 * @param {number} userId - User ID to notify
 * @param {string} caseNumber - Case number
 * @param {string} caseTitle - Case title
 * @param {string} hearingDate - Hearing date
 * @param {string} court - Court name
 */
export async function notifyHearingScheduled(userId, caseNumber, caseTitle, hearingDate, court) {
  const formattedDate = new Date(hearingDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  return createNotification({
    userId,
    type: 'hearing_scheduled',
    title: 'Hearing Scheduled',
    message: `Hearing for case ${caseNumber}: ${caseTitle} scheduled on ${formattedDate} at ${court}`,
    relatedResourceType: 'case',
    relatedResourceId: null
  });
}

/**
 * Create notification for case registration approval
 * @param {number} userId - User ID (registrar who submitted)
 * @param {string} caseNumber - Case number
 * @param {string} caseTitle - Case title
 */
export async function notifyCaseApproved(userId, caseNumber, caseTitle) {
  return createNotification({
    userId,
    type: 'case_approved',
    title: 'Case Registration Approved',
    message: `Case ${caseNumber}: ${caseTitle} has been approved and filed`,
    relatedResourceType: 'case',
    relatedResourceId: null
  });
}

/**
 * Create notification for document upload
 * @param {number} userId - User ID to notify
 * @param {string} caseNumber - Case number
 * @param {string} documentName - Document name
 */
export async function notifyDocumentUploaded(userId, caseNumber, documentName) {
  return createNotification({
    userId,
    type: 'document_uploaded',
    title: 'New Document Uploaded',
    message: `Document "${documentName}" uploaded for case ${caseNumber}`,
    relatedResourceType: 'document',
    relatedResourceId: null
  });
}

/**
 * Create notification for judgment submitted
 * @param {number} registrarId - Registrar user ID
 * @param {string} caseNumber - Case number
 * @param {string} caseTitle - Case title
 * @param {string} judgeName - Judge name
 */
export async function notifyJudgmentSubmitted(registrarId, caseNumber, caseTitle, judgeName) {
  return createNotification({
    userId: registrarId,
    type: 'judgment_submitted',
    title: 'Judgment Submitted',
    message: `Judge ${judgeName} has submitted judgment for case ${caseNumber}: ${caseTitle}`,
    relatedResourceType: 'case',
    relatedResourceId: null
  });
}

/**
 * Get unread notification count for user
 * @param {number} userId - User ID
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount(userId) {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = FALSE',
      [userId]
    );
    return result[0].count;
  } catch (error) {
    console.error('Get unread count error:', error);
    return 0;
  }
}

/**
 * Mark notifications as read for a specific resource
 * @param {number} userId - User ID
 * @param {string} resourceType - Resource type
 * @param {number} resourceId - Resource ID
 */
export async function markRelatedNotificationsRead(userId, resourceType, resourceId) {
  try {
    await db.query(
      `UPDATE notifications 
       SET read = TRUE 
       WHERE user_id = ? AND related_resource_type = ? AND related_resource_id = ?`,
      [userId, resourceType, resourceId]
    );
  } catch (error) {
    console.error('Mark related notifications read error:', error);
  }
}

/**
 * Log an audit event
 * @param {Object} params - Audit parameters
 * @param {number} params.userId - User ID who performed the action
 * @param {string} params.action - Action performed (e.g., 'DATA_EXCHANGE_INITIATED')
 * @param {string} params.resource - Resource type affected
 * @param {number} params.resourceId - Resource ID affected
 * @param {Object} [params.details] - Additional details
 */
export async function logAudit({
  userId,
  action,
  resource,
  resourceId,
  details = {}
}) {
  try {
    // For now, just log to console. In production, this could write to an audit_logs table
    console.log(`[AUDIT] ${new Date().toISOString()} | User: ${userId} | Action: ${action} | Resource: ${resource}:${resourceId} | Details:`, details);
    
    // Optionally create a notification for important audit events
    if (['DATA_EXCHANGE_INITIATED', 'PARTNER_SYNC_TRIGGERED'].includes(action)) {
      await createNotification({
        userId,
        type: 'system',
        title: `Audit: ${action}`,
        message: `Action ${action} performed on ${resource} #${resourceId}`,
        relatedResourceType: resource,
        relatedResourceId: resourceId
      });
    }
    
    return true;
  } catch (error) {
    console.error('Log audit error:', error);
    // Don't throw - audit logging should not break main functionality
    return false;
  }
}
