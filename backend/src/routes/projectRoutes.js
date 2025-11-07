import express from 'express'
import { createProject, uploadCsv, listProjects, pauseProject, deleteProject } from '../controllers/projectController.js'
import multer from 'multer'
const upload = multer({ dest: 'uploads/' })
const router = express.Router()

router.post('/', createProject)
router.post('/:id/upload-csv', upload.single('file'), uploadCsv)
router.post('/:id/pause', pauseProject);
router.delete('/:id', deleteProject);

router.get('/', listProjects)

export default router