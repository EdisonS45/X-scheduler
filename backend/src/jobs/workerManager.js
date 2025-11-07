import { Worker } from 'bullmq'
import { redis } from '../config/redis.js'
import Post from '../models/post.js'
import Project from '../models/project.js'
import { postToTwitter } from '../utils/twitterClient.js'

// This map holds all active worker instances, keyed by projectId
const activeWorkers = new Map();

// --- Helper function to auto-stop worker and update project ---
const checkAndStopIfFinished = async (projectId) => {
  try {
    const pendingCount = await Post.countDocuments({ projectId, status: 'pending' });
    
    if (pendingCount === 0) {
      console.log(`[Project: ${projectId}] No pending posts left. Auto-stopping worker.`);
      
      // Update project status to 'stopped'
      await Project.findByIdAndUpdate(projectId, { status: 'stopped' });
      
      // Stop and remove the worker instance
      await stopWorker(projectId);
    }
  } catch (err) {
    console.error(`[Project: ${projectId}] Error during auto-stop check: ${err.message}`);
  }
};
// --- End of new helper ---


// The core worker logic
const createWorker = (projectId) => {
  const worker = new Worker(`queue_${projectId}`, async (job) => {
    const { postId, content } = job.data;
    let post; // Define post here to access in finally
    let project; // Define project here

    try {
      post = await Post.findById(postId);
      if (!post || post.status !== 'pending') {
        console.log(`Skipping job for post ${postId}, status: ${post?.status}`);
        return;
      }
      
      project = await Project.findById(projectId);
      if (!project) {
        console.log(`Skipping job, project ${projectId} not found.`);
        return;
      }

      await postToTwitter(project, content);
      post.status = 'posted';
      post.postedAt = new Date();
      await post.save();
      console.log(`Successfully posted ${postId} for project ${projectId}`);
    
    } catch (err) {
      // --- UPDATED ERROR LOGGING ---
      let errorReason = err.message;
      if (err.code === 429 || (err.message && err.message.includes('429'))) {
        errorReason = `Rate Limit Exceeded (429). This is likely the 50 posts/24-hour limit on the Twitter Free tier.`;
      }
      console.error(`[Project: ${projectId}] Failed to post ${postId}. Error: ${errorReason}`);
      // ---
      
      if (post) {
        post.status = 'failed';
        await post.save();
      }
      throw err; // Re-throw error to trigger BullMQ retry logic
    
    } finally {
      // --- NEW: Check if project is finished after every job ---
      if (project) {
        await checkAndStopIfFinished(projectId);
      }
      // ---
    }
  }, { connection: redis });

  worker.on('failed', async (job, err) => {
    console.error(`[Project: ${projectId}] Job ${job?.id} failed after all retries. Error: ${err.message}`);
    // --- NEW: Check if finished even on final failure ---
    // This handles the case where the *last* post fails all retries
    await checkAndStopIfFinished(projectId);
    // ---
  });

  return worker;
};

/**
 * Starts a worker for a specific project if one isn't already running.
 */
export const startWorker = (projectId) => {
  if (!activeWorkers.has(projectId)) {
    console.log(`Starting worker for project: ${projectId}`);
    const worker = createWorker(projectId);
    activeWorkers.set(projectId, worker);
  } else {
    console.log(`Worker for project ${projectId} is already running.`);
  }
};

/**
 * Stops and removes a worker for a specific project.
 */
export const stopWorker = async (projectId) => {
  if (activeWorkers.has(projectId)) {
    console.log(`Stopping worker for project: ${projectId}`);
    const worker = activeWorkers.get(projectId);
    await worker.close();
    activeWorkers.delete(projectId);
  } else {
    console.log(`No active worker found for project ${projectId} to stop.`);
  }
};

/**
 * Called on server boot to restart workers for projects that were
 * previously in a 'running' state.
 */
export const startWorkersForRunningProjects = async () => {
  console.log('Restarting workers for all running projects...');
  try {
    const runningProjects = await Project.find({ status: 'running' });
    let restartedCount = 0;

    for (const project of runningProjects) {
      // --- NEW: Sanity check before restarting ---
      const pendingCount = await Post.countDocuments({ projectId: project._id, status: 'pending' });
      if (pendingCount > 0) {
        startWorker(project._id.toString());
        restartedCount++;
      } else {
        // This is a "zombie" project. Fix it.
        console.log(`[Project: ${project._id}] Was 'running' but has no pending posts. Setting to 'stopped'.`);
        project.status = 'stopped';
        await project.save();
      }
      // ---
    }
    console.log(`Restarted ${restartedCount} workers.`);
  } catch (err) {
    console.error('Error restarting workers:', err);
  }
};