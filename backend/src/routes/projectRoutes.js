import express from 'express'
import { 
  createProject, 
  uploadCsv, 
  listProjects, 
  deleteProject,
  deleteBulkProjects, // --- New
  getProjectById 
} from '../controllers/projectController.js'
import { 
  startProjectScheduler, 
  pauseProjectScheduler, 
  stopProjectScheduler 
} from '../controllers/schedulerController.js'
import { protect } from '../middleware/authMiddleware.js'
import multer from 'multer'

const upload = multer({ dest: 'uploads/' })
const router = express.Router()

router.use(protect) // All routes are protected

// --- New Bulk Delete Route ---
router.post('/delete-bulk', deleteBulkProjects)
// ---

// Project CRUD
router.post('/', createProject)
router.get('/', listProjects)
router.get('/:id', getProjectById)
router.delete('/:id', deleteProject)
router.post('/:id/upload-csv', upload.single('file'), uploadCsv)

// Scheduler Control Routes
router.post('/:id/start', startProjectScheduler)
router.post('/:id/pause', pauseProjectScheduler)
router.post('/:id/stop', stopProjectScheduler)

export default router