import express from 'express';

import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import schedulerRoutes from './schedulerRoutes.js';
import templateRoutes from './templateRoutes.js';
import twitterAccountRoutes from './twitterAccountRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/scheduler', schedulerRoutes);
router.use('/templates', templateRoutes);
router.use('/twitter-accounts', twitterAccountRoutes);

export default router;
