import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createProject,
  listProjects,
  getProjectById,
  startProject,
  pauseProject,
  stopProject,
} from '../controllers/projectController.js';

const router = express.Router();

router.use(protect);

// Core
router.post('/', createProject);
router.get('/', listProjects);
router.get('/:id', getProjectById);

// Lifecycle controls
router.post('/:id/start', startProject);
router.post('/:id/pause', pauseProject);
router.post('/:id/stop', stopProject);

export default router;
