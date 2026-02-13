import express from 'express';
import authRoutes from './auth.js';
import caseRoutes from './cases.js';
import documentRoutes from './documents.js';
import userRoutes from './users.js';
import reportRoutes from './reports.js';
import notificationRoutes from './notifications.js';
import calendarRoutes from './calendar.js';
import motionRoutes from './motions.js';
import orderRoutes from './orders.js';
import partnerRoutes from './partners.js';
import chatRoutes from './chat.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/documents', documentRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/calendar', calendarRoutes);
router.use('/motions', motionRoutes);
router.use('/orders', orderRoutes);
router.use('/partners', partnerRoutes);
router.use('/chat', chatRoutes);

export default router;
