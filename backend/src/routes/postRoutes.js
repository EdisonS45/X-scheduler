import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createProject,
  listProjects,
  getProjectById,
} from '../controllers/projectController.js';

const router = express.Router();

router.use(protect);

router.post('/', createProject);
router.get('/', listProjects);
router.get('/:id', getProjectById);

export default router;
