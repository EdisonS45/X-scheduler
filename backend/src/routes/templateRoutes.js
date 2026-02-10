import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTemplate,
  listTemplates,
  deleteTemplate,
} from '../controllers/templateController.js';

const router = express.Router();

router.use(protect);

router.post('/', createTemplate);
router.get('/', listTemplates);
router.delete('/:id', deleteTemplate);

export default router;
