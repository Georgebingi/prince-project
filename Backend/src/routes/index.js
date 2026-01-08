import express from 'express';
import authRoutes from './auth.js';
import caseRoutes from './cases.js';
import documentRoutes from './documents.js';
import userRoutes from './users.js';
import reportRoutes from './reports.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/documents', documentRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);

export default router;
