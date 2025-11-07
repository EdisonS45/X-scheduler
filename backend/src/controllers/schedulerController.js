import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';
import Project from '../models/project.js';
import Post from '../models/post.js';
import { startWorker, stopWorker } from '../jobs/workerManager.js';

// (getProjectAndQueue helper function is unchanged)
// ...
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


export const startProjectScheduler = async (req, res) => {
  const { id } = req.params;
  try {
    const { project, queue } = await getProjectAndQueue(id, req.user.id);

    if (project.status === 'running') {
      return res.status(400).json({ message: 'Project is already running' });
    }

    // --- UPDATED: Smarter Duplicate Project Check ---
    const otherRunningProjects = await Project.find({
      _id: { $ne: id },
      userId: req.user.id,
      status: 'running',
      twitterApiKey: project.twitterApiKey
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
          // This is a "zombie" project. Fix it.
          console.log(`[Project: ${otherProject._id}] Was 'running' but has no pending posts. Setting to 'stopped'.`);
          otherProject.status = 'stopped';
          await otherProject.save();
        }
      }
    }
    // --- End of updated check ---

    const posts = await Post.find({ projectId: id, status: 'pending' }).sort({ createdAt: 'asc' });
    if (posts.length === 0) {
      return res.status(400).json({ message: 'No pending posts to schedule. Please upload a new CSV.' });
    }

    await queue.obliterate({ force: true });

    const timeGapMs = project.timeGapMinutes * 60 * 1000;
    let delay = 0;

    for (const post of posts) {
      const jobData = { postId: post._id, content: post.content };
      await queue.add(post._id.toString(), jobData, { 
        delay: delay,
        removeOnComplete: true, 
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 60000 }
      });
      post.scheduledAt = new Date(Date.now() + delay);
      await post.save();
      delay += timeGapMs;
    }

    startWorker(id);

    project.status = 'running';
    await project.save();

    res.json({ message: `Project started with ${posts.length} posts scheduled.` });

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error starting project', error: error.message });
  }
};

// (pauseProjectScheduler and stopProjectScheduler are unchanged)
// ...
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

export const stopProjectScheduler = async (req, res) => {
  const { id } = req.params;
  try {
    const { project, queue } = await getProjectAndQueue(id, req.user.id);

    if (project.status === 'paused') {
      await queue.resume();
      project.status = 'running';
      await project.save();
      return res.json({ message: 'Project resumed' });
    }

    if (project.status !== 'running') {
      return res.status(400).json({ message: 'Project is not running' });
    }
    
    await stopWorker(id);
    await queue.drain(true);

    project.status = 'stopped';
    await project.save();
    
    await Post.updateMany(
      { projectId: id, status: 'pending' },
      { $set: { status: 'pending' }, $unset: { scheduledAt: "" } }
    );

    res.json({ message: 'Project stopped and all pending jobs cleared.' });
  } catch (error) {
    res.status(400).json({ message: 'Error stopping project', error: error.message });
  }
};