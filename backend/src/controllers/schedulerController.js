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

    // Block only if THIS project is already running
    if (project.status === 'running') {
      return res.status(400).json({ message: 'Project is already running' });
    }

    // 1. Find pending posts
    const posts = await Post.find({
      projectId: id,
      status: 'pending'
    }).sort({ createdAt: 'asc' });

    if (posts.length === 0) {
      return res.status(400).json({
        message: 'No pending posts to schedule. Please upload a new CSV.'
      });
    }

    // 2. Clear any old jobs
    await queue.obliterate({ force: true });

    // 3. Schedule posts
    const timeGapMs = project.timeGapMinutes * 60 * 1000;
    let delay = 0;

    for (const post of posts) {
      await queue.add(
        post._id.toString(),
        {
          postId: post._id,
          content: post.content
        },
        {
          delay,
          removeOnComplete: true,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 60000
          }
        }
      );

      post.scheduledAt = new Date(Date.now() + delay);
      await post.save();

      delay += timeGapMs;
    }

    // 4. Start worker
    startWorker(id);

    // 5. Update project status
    project.status = 'running';
    await project.save();

    res.json({
      message: `Project started with ${posts.length} posts scheduled.`
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: 'Error starting project',
      error: error.message
    });
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
    res.status(400).json({
      message: 'Error pausing project',
      error: error.message
    });
  }
};

// @desc    Stop (or resume) the scheduler for a project
// @route   POST /api/projects/:id/stop
export const stopProjectScheduler = async (req, res) => {
  const { id } = req.params;

  try {
    const { project, queue } = await getProjectAndQueue(id, req.user.id);

    // Resume if paused
    if (project.status === 'paused') {
      await queue.resume();
      project.status = 'running';
      await project.save();
      return res.json({ message: 'Project resumed' });
    }

    if (project.status !== 'running') {
      return res.status(400).json({ message: 'Project is not running' });
    }

    // 1. Stop worker
    await stopWorker(id);

    // 2. Drain queue
    await queue.drain(true);

    // 3. Update project status
    project.status = 'stopped';
    await project.save();

    // 4. Reset scheduled posts
    await Post.updateMany(
      { projectId: id, status: 'pending' },
      { $unset: { scheduledAt: '' } }
    );

    res.json({
      message: 'Project stopped and all pending jobs cleared.'
    });

  } catch (error) {
    res.status(400).json({
      message: 'Error stopping project',
      error: error.message
    });
  }
};
