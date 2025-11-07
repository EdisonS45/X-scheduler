import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { 
  createTemplate, 
  listTemplates, 
  deleteTemplate, 
  createProjectFromTemplate 
} from '../controllers/templateController.js'
import multer from 'multer'

const upload = multer({ dest: 'uploads/' })
const router = express.Router()

router.use(protect) // All template routes are protected

router.route('/')
  .post(createTemplate)
  .get(listTemplates)

router.route('/:id')
  .delete(deleteTemplate)

// This is the special route to create a new project *using* a template
router.post('/:id/create-project', upload.single('file'), createProjectFromTemplate)

export default router