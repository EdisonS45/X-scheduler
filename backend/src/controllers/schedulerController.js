import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';
import Project from '../models/project.js';
import Post from '../models/post.js';
import { startWorker, stopWorker } from '../jobs/workerManager.js';

// Helper to get project and queue, checking ownership
const getProjectAndQueue = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  if (project.userId.toString() !== userId.toString()) {
    throw new Error('User not authorized for this project');
  }
  
  const queue = new Queue(`queue_${projectId}`, { connection: redis });
  return { project, queue };
};

// @desc    Start the scheduler for a project
// @route   POST /api/projects/:id/start
export const startProjectScheduler = async (req, res) => {
  const { id } = req.params;
  try {
    const { project, queue } = await getProjectAndQueue(id, req.user.id);

    if (project.status === 'running') {
      return res.status(400).json({ message: 'Project is already running' });
    }

    // --- UPDATED: Smarter Duplicate Project Check ---
    const otherRunningProjects = await Project.find({
      _id: { $ne: id }, // Not this project
      userId: req.user.id, // For this user
      status: 'running', // That is currently running
      twitterApiKey: project.twitterApiKey // With the same API key
    });

    if (otherRunningProjects.length > 0) {
      for (const otherProject of otherRunningProjects) {
        // Check if this "running" project *actually* has pending posts
        const pendingCount = await Post.countDocuments({ projectId: otherProject._id, status: 'pending' });
        
        if (pendingCount > 0) {
          // This is a *true* conflict.
          return res.status(400).json({ 
            message: `Another project ('${otherProject.name}') is already running with these Twitter credentials. Please stop that project first.` 
          });
        } else {
          // This is a "zombie" project that finished but wasn't auto-stopped. Fix it.
          console.log(`[Project: ${otherProject._id}] Was 'running' but has no pending posts. Setting to 'stopped'.`);
          otherProject.status = 'stopped';
          await otherProject.save();
        }
      }
    }
    // --- End of updated check ---

    // 1. Find all pending posts
    const posts = await Post.find({ projectId: id, status: 'pending' }).sort({ createdAt: 'asc' });
    if (posts.length === 0) {
      return res.status(400).json({ message: 'No pending posts to schedule. Please upload a new CSV.' });
    }

    // 2. Clear any old jobs from the queue to start fresh
    await queue.obliterate({ force: true });

    // 3. Add all pending posts to the queue with a delay
    const timeGapMs = project.timeGapMinutes * 60 * 1000;
    let delay = 0;

    for (const post of posts) {
      const jobData = { postId: post._id, content: post.content };
      await queue.add(post._id.toString(), jobData, { 
        delay: delay,
        removeOnComplete: true, 
        removeOnFail: 50, // Keep last 50 failed jobs
        // Retry logic for 429 errors
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1 minute
        }
      });
      // Update post with scheduled time
      post.scheduledAt = new Date(Date.now() + delay);
      await post.save();
      
      delay += timeGapMs;
    }

    // 4. Start the worker for this queue
    startWorker(id);

    // 5. Update project status
    project.status = 'running';
    await project.save();

    res.json({ message: `Project started with ${posts.length} posts scheduled.` });

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error starting project', error: error.message });
  }
};

// @desc    Pause the scheduler for a project
// @route   POST /api/projects/:id/pause
export const pauseProjectScheduler = async (req, res) => {
  const { id } = req.params;
  try {
    const { project, queue } = await getProjectAndQueue(id, req.user.id);

    if (project.status !== 'running') {
      return res.status(400).json({ message: 'Project is not running' });
    }

    await queue.pause();
    project.status = 'paused';
    await project.save();

    res.json({ message: 'Project paused' });
  } catch (error) {
    res.status(400).json({ message: 'Error pausing project', error: error.message });
  }
};

// @desc    Stop (or resume) the scheduler for a project
// @route   POST /api/projects/:id/stop
export const stopProjectScheduler = async (req, res) => {
  const { id } = req.params;
  try {
    const { project, queue } = await getProjectAndQueue(id, req.user.id);

    if (project.status === 'paused') {
      // This action will RESUME a paused project
      await queue.resume();
      project.status = 'running';
      await project.save();
      return res.json({ message: 'Project resumed' });
    }

    if (project.status !== 'running') {
      return res.status(400).json({ message: 'Project is not running' });
    }
    
    // 1. Stop the worker process
    await stopWorker(id);

    // 2. Empty the queue of all pending (delayed) jobs
    await queue.drain(true);

    // 3. Update project status
    project.status = 'stopped';
    await project.save();
    
    // 4. Update all pending posts back to 'pending' and clear scheduledAt
    await Post.updateMany(
      { projectId: id, status: 'pending' },
      { $set: { status: 'pending' }, $unset: { scheduledAt: "" } }
    );

    res.json({ message: 'Project stopped and all pending jobs cleared.' });
  } catch (error) {
    res.status(400).json({ message: 'Error stopping project', error: error.message });
  }
};