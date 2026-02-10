import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import projectRoutes from './routes/projectRoutes.js';
import authRoutes from './routes/authRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';

import { connectDB } from './config/db.js';
import { redis } from './config/redis.js';
import { startWorkersForRunningProjects } from './jobs/workerManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/oauth', oauthRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/templates', templateRoutes);

// Frontend static serving (safe)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  }
});

const PORT = process.env.PORT || 4000;

// 🔐 Boot sequence (correct order)
(async () => {
  try {
    await connectDB();
    await redis.ping();

    console.log('🟢 Redis ready, starting workers');
    await startWorkersForRunningProjects();

    app.listen(PORT, () =>
      console.log(`🚀 API running on port ${PORT}`)
    );
  } catch (err) {
    console.error('❌ Server boot failed:', err);
    process.exit(1);
  }
})();
