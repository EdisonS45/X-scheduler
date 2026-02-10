import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';
import Project from '../models/project.js';
import Post from '../models/post.js';
import { startWorker, stopWorker } from '../jobs/workerManager.js';

export const startProjectScheduler = async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!project || project.status === 'running')
    return res.status(400).json({ message: 'Invalid project state' });

  const posts = await Post.find({
    projectId: project._id,
    status: 'pending',
  });

  if (!posts.length)
    return res.status(400).json({ message: 'No pending posts' });

  const queue = new Queue(`queue_${project._id}`, { connection: redis });
  await queue.obliterate({ force: true });

  let delay = 0;
  for (const post of posts) {
    await queue.add(
      post._id.toString(),
      { postId: post._id, projectId: project._id },
      { delay }
    );

    post.scheduledAt = new Date(Date.now() + delay);
    await post.save();

    delay += project.timeGapMinutes * 60 * 1000;
  }

  project.status = 'running';
  await project.save();

  startWorker(project._id.toString());

  res.json({ message: 'Scheduler started' });
};

export const stopProjectScheduler = async (req, res) => {
  await stopWorker(req.params.id);

  await Project.findByIdAndUpdate(req.params.id, { status: 'stopped' });

  res.json({ message: 'Scheduler stopped' });
};
