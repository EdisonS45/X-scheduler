import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  analyticsOverview,
  analyticsTimeseries,
} from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect);

// GET /api/analytics/overview
router.get('/overview', analyticsOverview);

// GET /api/analytics/timeseries?range=7d|30d
router.get('/timeseries', analyticsTimeseries);

export default router;
