import Project from '../models/project.js';
import Post from '../models/post.js';
import TwitterAccount from '../models/TwitterAccount.js';

/**
 * Create Project
 * POST /api/projects
 */
export const createProject = async (req, res) => {
  const { name, twitterAccountId, timeGapMinutes } = req.body;

  if (!name || !twitterAccountId || !timeGapMinutes) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  // Ensure twitter account belongs to user
  const account = await TwitterAccount.findOne({
    _id: twitterAccountId,
    userId: req.user.id,
    isActive: true,
  });

  if (!account) {
    return res.status(400).json({
      message: 'Invalid or inactive Twitter account',
    });
  }

  const project = await Project.create({
    userId: req.user.id,
    twitterAccountId,
    name,
    timeGapMinutes,
    status: 'stopped',
  });

  res.status(201).json(project);
};

/**
 * List Projects (Dashboard API)
 * GET /api/projects
 */
export const listProjects = async (req, res) => {
  const projects = await Project.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  // Attach post stats per project
  const enriched = await Promise.all(
    projects.map(async (project) => {
      const stats = await Post.aggregate([
        { $match: { projectId: project._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const normalizedStats = {
        pending: 0,
        posted: 0,
        failed: 0,
      };

      for (const s of stats) {
        normalizedStats[s._id] = s.count;
      }

      return {
        ...project,
        stats: normalizedStats,
      };
    })
  );

  // Categorize for dashboard
  const active = [];
  const pendingStopped = [];
  const completed = [];

  for (const p of enriched) {
    if (p.status === 'running' || p.status === 'paused') {
      active.push(p);
    } else if (p.status === 'stopped' && p.stats.pending > 0) {
      pendingStopped.push(p);
    } else if (p.status === 'stopped' && p.stats.pending === 0) {
      completed.push(p);
    }
  }

  res.json({
    active,
    pendingStopped,
    completed,
  });
};

/**
 * Get Project Details
 * GET /api/projects/:id
 */
export const getProjectById = async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).lean();

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const posts = await Post.find({ projectId: project._id })
    .sort({ scheduledAt: 1 })
    .lean();

  res.json({ project, posts });
};
