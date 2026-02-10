import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listTwitterAccounts,
} from '../controllers/twitterAccountController.js';

const router = express.Router();

router.use(protect);

// Later:
// POST /connect
// GET /callback
// DELETE /:id

router.get('/', listTwitterAccounts);

export default router;
