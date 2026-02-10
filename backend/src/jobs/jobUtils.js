import Post from '../models/post.js';
import Project from '../models/project.js';

/**
 * Auto-stop a project when no pending posts remain
 */
export const autoStopIfFinished = async (projectId) => {
  const pendingCount = await Post.countDocuments({
    projectId,
    status: 'pending',
  });

  if (pendingCount === 0) {
    await Project.findByIdAndUpdate(projectId, { status: 'stopped' });
    return true;
  }

  return false;
};
