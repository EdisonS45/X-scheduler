import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  bulkCreatePosts,
  getCalendarPosts,
} from '../controllers/postController.js';

const router = express.Router();

router.use(protect);

// Inbox: bulk paste tweets
router.post('/bulk', bulkCreatePosts);

// Calendar: scheduled posts
router.get('/calendar/:projectId', getCalendarPosts);

export default router;
