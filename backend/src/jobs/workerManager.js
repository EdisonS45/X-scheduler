import { Worker, Queue } from 'bullmq';
import { redis } from '../config/redis.js';
import Project from '../models/project.js';
import Post from '../models/post.js';
import { processPostJob } from './postWorker.js';

const activeWorkers = new Map();

/**
 * Create a worker for a project
 */
const createWorker = (projectId) => {
  return new Worker(
    `queue_${projectId}`,
    async (job) => {
      await processPostJob(job);
    },
    {
      connection: redis,
      concurrency: 1, // Important for Twitter rate limits
    }
  );
};

/**
 * Start worker safely
 */
export const startWorker = (projectId) => {
  if (activeWorkers.has(projectId)) return;

  const worker = createWorker(projectId);
  activeWorkers.set(projectId, worker);

  worker.on('failed', (job, err) => {
    console.error(
      `[Worker ${projectId}] Job ${job?.id} failed: ${err.message}`
    );
  });

  worker.on('closed', () => {
    activeWorkers.delete(projectId);
  });
};

/**
 * Stop worker safely
 */
export const stopWorker = async (projectId) => {
  const worker = activeWorkers.get(projectId);
  if (!worker) return;

  await worker.close();
  activeWorkers.delete(projectId);
};

/**
 * Restart workers after server reboot
 */
export const startWorkersForRunningProjects = async () => {
  const projects = await Project.find({ status: 'running' });

  for (const project of projects) {
    const pending = await Post.countDocuments({
      projectId: project._id,
      status: 'pending',
    });

    if (pending > 0) {
      startWorker(project._id.toString());
    } else {
      project.status = 'stopped';
      await project.save();
    }
  }
};

/**
 * Clean queue completely (used on delete)
 */
export const destroyQueue = async (projectId) => {
  const queue = new Queue(`queue_${projectId}`, { connection: redis });
  await queue.obliterate({ force: true });
  await queue.close();
};
