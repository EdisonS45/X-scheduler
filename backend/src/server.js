import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path' 
import { fileURLToPath } from 'url' 

import projectRoutes from './routes/projectRoutes.js'
import authRoutes from './routes/authRoutes.js'
import templateRoutes from './routes/templateRoutes.js'
import { connectDB } from './config/db.js'
import { startWorkersForRunningProjects } from './jobs/workerManager.js'

// --- Get __dirname equivalent in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ---

dotenv.config()
const app = express()
app.use(cors()); // Keep generic CORS for local development/testing
app.use(express.json())

// --- API Routes (MUST be defined first) ---
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/templates', templateRoutes)

// --- Frontend Hosting Logic ---
// 1. Define the path to the frontend's build directory (located at X-scheduler/frontend/dist)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

// 2. Serve all static files (JS, CSS, images) from the 'dist' folder on the root path
// This handles requests like /assets/index-CoK_IbJm.js
app.use(express.static(frontendDistPath));

// 3. SPA Fallback: For any other route (like /login or /dashboard), serve index.html
// This fixes the 404 Not Found error on direct access or refresh.
app.get('*', (req, res) => {
    // We only serve index.html if the request is NOT for an existing API route
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.resolve(frontendDistPath, 'index.html'));
    }
});
// --- End Frontend Hosting Logic ---

const PORT = process.env.PORT || 4000

connectDB().then(()=>{
  startWorkersForRunningProjects().catch(console.error)
  app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`))
})