import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/chat/conversations - Get all conversations for the current user
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all unique conversations (people the user has chatted with)
    const query = `
      SELECT 
        CASE 
          WHEN sender_id = ? THEN receiver_id 
          ELSE sender_id 
        END as other_user_id,
        MAX(created_at) as last_message_time
      FROM chat_messages
      WHERE sender_id = ? OR receiver_id = ?
      GROUP BY other_user_id
      ORDER BY last_message_time DESC
    `;
    
    const [conversations] = await db.query(query, [userId, userId, userId]);

    // Get user details for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const [users] = await db.query(
          'SELECT id, name, role, department, status FROM users WHERE id = ?',
          [conv.other_user_id]
        );
        
        if (users.length === 0) return null;

        const user = users[0];
        
        // Get the last message
        const [lastMessages] = await db.query(`
          SELECT message, created_at 
          FROM chat_messages 
          WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
          ORDER BY created_at DESC 
          LIMIT 1
        `, [userId, conv.other_user_id, conv.other_user_id, userId]);

        // Get unread count
        const [unreadResult] = await db.query(
          'SELECT COUNT(*) as unread FROM chat_messages ' +
          'WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
          [conv.other_user_id, userId]
        );

        return {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          lastMessage: lastMessages[0]?.message || '',
          lastMessageTime: lastMessages[0]?.created_at || conv.last_message_time,
          unreadCount: unreadResult[0]?.unread || 0
        };
      })
    );

    // Filter out null values (in case user was deleted)
    res.json({
      success: true,
      data: conversationsWithDetails.filter(c => c !== null)
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/chat/messages/:userId - Get messages with a specific user
router.get('/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const [messages] = await db.query(`
      SELECT 
        cm.id,
        cm.sender_id,
        cm.receiver_id,
        cm.message,
        cm.is_read,
        cm.created_at,
        sender.name as sender_name,
        receiver.name as receiver_name
      FROM chat_messages cm
      JOIN users sender ON cm.sender_id = sender.id
      JOIN users receiver ON cm.receiver_id = receiver.id
      WHERE (cm.sender_id = ? AND cm.receiver_id = ?) 
         OR (cm.sender_id = ? AND cm.receiver_id = ?)
      ORDER BY cm.created_at ASC
    `, [currentUserId, userId, userId, currentUserId]);

    // Mark messages as read
    await db.query(
      'UPDATE chat_messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [userId, currentUserId]
    );

    // Transform messages to match frontend format
    const transformedMessages = messages.map(msg => ({
      id: msg.id.toString(),
      senderId: msg.sender_id.toString(),
      senderName: msg.sender_name,
      receiverId: msg.receiver_id.toString(),
      receiverName: msg.receiver_name,
      message: msg.message,
      timestamp: msg.created_at,
      read: msg.is_read
    }));

    res.json({
      success: true,
      data: transformedMessages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// POST /api/chat/send - Send a message to a user
router.post('/send', async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Receiver ID and message are required'
        }
      });
    }

    // Insert the message
    const [result] = await db.query(
      'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [senderId, receiverId, message]
    );

    // Get sender name for the notification
    const [senderResult] = await db.query(
      'SELECT name FROM users WHERE id = ?',
      [senderId]
    );

    // Create a notification for the receiver
    if (senderResult.length > 0) {
      await db.query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
        [
          receiverId,
          'chat',
          `New message from ${senderResult[0].name}`,
          message.substring(0, 100)
        ]
      );
    }

    // Get the created message
    const [newMessage] = await db.query(
      'SELECT ' +
      'cm.id, cm.sender_id, cm.receiver_id, cm.message, cm.is_read, cm.created_at, ' +
      'sender.name as sender_name, receiver.name as receiver_name ' +
      'FROM chat_messages cm ' +
      'JOIN users sender ON cm.sender_id = sender.id ' +
      'JOIN users receiver ON cm.receiver_id = receiver.id ' +
      'WHERE cm.id = ?',
      [result.insertId]
    );

    const msg = newMessage[0];
    const transformedMessage = {
      id: msg.id.toString(),
      senderId: msg.sender_id.toString(),
      senderName: msg.sender_name,
      receiverId: msg.receiver_id.toString(),
      receiverName: msg.receiver_name,
      message: msg.message,
      timestamp: msg.created_at,
      read: msg.is_read
    };

    res.json({
      success: true,
      data: transformedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// PUT /api/chat/read/:userId - Mark messages from a user as read
router.put('/read/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await db.query(
      'UPDATE chat_messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [userId, currentUserId]
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// GET /api/chat/unread-count - Get total unread message count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM chat_messages WHERE receiver_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({
      success: true,
      data: {
        count: result[0].count
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
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
