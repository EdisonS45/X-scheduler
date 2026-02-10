import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
  startTwitterOAuth,
  finishTwitterOAuth,
} from '../controllers/oauthController.js';

const router = express.Router();

// All OAuth actions require a logged-in user
router.use(protect);

// Step 1: Get redirect URL
router.get('/twitter/start', startTwitterOAuth);

// Step 2: Callback from Twitter
router.get('/twitter/callback', finishTwitterOAuth);

export default router;
