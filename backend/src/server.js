import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path' // --- NEW: Import 'path'
import { fileURLToPath } from 'url' // --- NEW: Import 'url'

import projectRoutes from './routes/projectRoutes.js'
import authRoutes from './routes/authRoutes.js'
import templateRoutes from './routes/templateRoutes.js'
import { connectDB } from './config/db.js'
import { startWorkersForRunningProjects } from './jobs/workerManager.js'

// --- NEW: ES Module equivalents for __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ---

dotenv.config()
const app = express()
app.use(cors()); 
app.use(express.json())

// --- API Routes ---
// All API routes MUST be defined *before* the frontend static/catch-all routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/templates', templateRoutes)

// --- NEW: Production Frontend Hosting ---
if (process.env.NODE_ENV === 'production') {
  // 1. Define the path to the frontend's build directory
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');

  // 2. Serve all static files (js, css, images) from the 'dist' folder
  app.use(express.static(frontendDistPath));

  // 3. For any other route, serve the 'index.html' file
  // This is the key to fixing 404s on refresh
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
}
// ---

const PORT = process.env.PORT || 4000

connectDB().then(()=>{
  startWorkersForRunningProjects().catch(console.error)
  app.listen(PORT, ()=>console.log('Server listening on', PORT))
})