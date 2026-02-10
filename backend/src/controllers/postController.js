import Post from '../models/post.js';
import Project from '../models/project.js';

/**
 * Create a single scheduled post
 */
export const createPost = async (req, res) => {
  const { projectId, content, scheduledAt } = req.body;

  if (!projectId || !content || !scheduledAt) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const project = await Project.findOne({
    _id: projectId,
    userId: req.user.id,
  });

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const post = await Post.create({
    userId: req.user.id,
    projectId,
    content,
    scheduledAt: new Date(scheduledAt),
    status: 'scheduled',
  });

  res.status(201).json(post);
};

/**
 * Bulk create posts from text
 */
export const bulkCreatePosts = async (req, res) => {
  const { projectId, text, startTime } = req.body;

  if (!projectId || !text || !startTime) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const project = await Project.findOne({
    _id: projectId,
    userId: req.user.id,
  });

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const chunks = text
    .split('\n')
    .map(t => t.trim())
    .filter(Boolean);

  if (chunks.length === 0) {
    return res.status(400).json({ message: 'No valid posts found' });
  }

  const start = new Date(startTime);
  const gapMs = project.timeGapMinutes * 60 * 1000;

  const posts = chunks.map((content, index) => ({
    userId: req.user.id,
    projectId,
    content,
    scheduledAt: new Date(start.getTime() + index * gapMs),
    status: 'scheduled',
  }));

  await Post.insertMany(posts);

  res.status(201).json({ created: posts.length });
};
