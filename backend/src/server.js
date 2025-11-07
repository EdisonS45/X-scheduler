import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import projectRoutes from './routes/projectRoutes.js'
import authRoutes from './routes/authRoutes.js' // Added
import { connectDB } from './config/db.js'
import { startWorkersForRunningProjects } from './jobs/workerManager.js' // Updated

dotenv.config()
const app = express()
app.use(cors()); 
app.use(express.json())

// --- New Auth Routes ---
app.use('/api/auth', authRoutes)
// --- Project routes are now protected ---
app.use('/api/projects', projectRoutes)

const PORT = process.env.PORT || 4000

connectDB().then(()=>{
  // Only start workers for projects that were 'running'
  startWorkersForRunningProjects().catch(console.error)

  app.listen(PORT, ()=>console.log('Server listening on', PORT))
})