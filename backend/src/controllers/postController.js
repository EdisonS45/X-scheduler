import Post from '../models/post.js';

export const bulkCreatePosts = async (req, res) => {
  const { projectId, contents } = req.body;

  if (!Array.isArray(contents) || contents.length === 0)
    return res.status(400).json({ message: 'No posts provided' });

  const posts = contents.map((text) => ({
    projectId,
    content: text.trim(),
    status: 'pending',
  }));

  await Post.insertMany(posts);

  res.json({ created: posts.length });
};

export const getCalendarPosts = async (req, res) => {
  const posts = await Post.find({
    projectId: req.params.projectId,
    scheduledAt: { $ne: null },
  });

  res.json(posts);
};
