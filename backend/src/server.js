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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()
const app = express()

// --- FIX: CORS Configuration ---
// Define your Vercel frontend URL
const allowedOrigins = [
  'https://x-scheduler-git-main-edisons45s-projects.vercel.app',
  'http://localhost:5173' // Keep this for local testing
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
// --- End of FIX ---

app.use(express.json())

// --- API Routes ---
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/templates', templateRoutes)

// --- Production Frontend Hosting ---
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode. Serving frontend static files.');
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');

  app.use(express.static(frontendDistPath));

  // Fix for 404-on-refresh
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
} else {
  console.log('Running in development mode.');
}
// ---

const PORT = process.env.PORT || 4000

connectDB().then(()=>{
  startWorkersForRunningProjects().catch(console.error)
  app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`))
})