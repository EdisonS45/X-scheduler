import express from 'express'
import { 
  createProject, 
  uploadCsv, 
  listProjects, 
  deleteProject,
  getProjectById 
} from '../controllers/projectController.js'
import { 
  startProjectScheduler, 
  pauseProjectScheduler, 
  stopProjectScheduler 
} from '../controllers/schedulerController.js' // New controller
import { protect } from '../middleware/authMiddleware.js' // Auth
import multer from 'multer'

const upload = multer({ dest: 'uploads/' })
const router = express.Router()

// All routes are now protected
router.use(protect)

// Project CRUD
router.post('/', createProject)
router.get('/', listProjects)
router.get('/:id', getProjectById) // New: Get a single project
router.delete('/:id', deleteProject)
router.post('/:id/upload-csv', upload.single('file'), uploadCsv)

// --- NEW Scheduler Control Routes ---
router.post('/:id/start', startProjectScheduler)
router.post('/:id/pause', pauseProjectScheduler)
router.post('/:id/stop', stopProjectScheduler)

export default router