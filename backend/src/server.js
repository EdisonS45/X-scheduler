import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
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

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

/* 🔐 SESSION MIDDLEWARE — MUST COME BEFORE ROUTES */
app.use(
  session({
    name: 'x-scheduler-session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 10, // 10 minutes
    },
  })
);

/* ROUTES */
app.use('/api/oauth', oauthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/templates', templateRoutes);

/* Frontend static serving */
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  }
});

const PORT = process.env.PORT || 4000;

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
