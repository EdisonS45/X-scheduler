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

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()
const app = express()
// CORS is simplified since we are serving from the same host, 
// but we keep a generic config in case you need local API calls during development.
app.use(cors()); 
app.use(express.json())

// --- API Routes ---
// API routes MUST be defined *before* serving the frontend
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/templates', templateRoutes)

// --- Production Frontend Hosting ---
// This code is now unconditional, as it runs on the single host
// We assume you have run 'npm run build' in the frontend directory.
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

// 1. Serve all static files (js, css, images) from the 'dist' folder on the root path
app.use(express.static(frontendDistPath));

// 2. For any other route (SPA routes like /login, /project/:id), serve the 'index.html' file
// This is the key to fixing 404s and enabling the frontend router
app.get('*', (req, res) => {
    // Only send the file if the request is not for the API or a static file already served
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.resolve(frontendDistPath, 'index.html'));
    }
});
// ---

const PORT = process.env.PORT || 4000

connectDB().then(()=>{
  startWorkersForRunningProjects().catch(console.error)
  app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`))
})