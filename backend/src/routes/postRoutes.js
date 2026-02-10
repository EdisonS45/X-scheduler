import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPost,
  bulkCreatePosts,
} from '../controllers/postController.js';

const router = express.Router();

router.post('/', protect, createPost);
router.post('/bulk', protect, bulkCreatePosts);

export default router;
