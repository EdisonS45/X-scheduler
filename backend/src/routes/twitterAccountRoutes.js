import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listTwitterAccounts,
  activateTwitterAccount,
  deactivateTwitterAccount,
  deleteTwitterAccount,
} from '../controllers/twitterAccountController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/twitter-accounts
router.get('/', listTwitterAccounts);

// POST /api/twitter-accounts/:id/activate
router.post('/:id/activate', activateTwitterAccount);

// POST /api/twitter-accounts/:id/deactivate
router.post('/:id/deactivate', deactivateTwitterAccount);

// DELETE /api/twitter-accounts/:id
router.delete('/:id', deleteTwitterAccount);

export default router;
