import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  startTwitterOAuth,
  finishTwitterOAuth,
} from '../controllers/oauthController.js';

const router = express.Router();

// STEP 1: user must be logged in
router.get('/twitter/start', protect, startTwitterOAuth);

// STEP 2: Twitter callback (NO AUTH)
router.get('/twitter/callback', finishTwitterOAuth);

export default router;
