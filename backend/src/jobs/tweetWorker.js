import { Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import Post from '../models/post.js';
import Project from '../models/project.js';
import { postToTwitter } from '../utils/twitterClient.js';
import { POST_STATUS, PROJECT_STATUS, JOB_NAMES } from './jobConstants.js';

const autoStopIfFinished = async (projectId) => {
  const remaining = await Post.countDocuments({
    projectId,
    status: POST_STATUS.PENDING,
  });

  if (remaining === 0) {
    await Project.findByIdAndUpdate(projectId, {
      status: PROJECT_STATUS.STOPPED,
    });
  }
};

export const createTweetWorker = (projectId) => {
  return new Worker(
    `project:${projectId}`,
    async (job) => {
      if (job.name !== JOB_NAMES.TWEET_POST) return;

      const { postId } = job.data;

      const post = await Post.findById(postId);
      if (!post || post.status !== POST_STATUS.PENDING) {
        return;
      }

      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      try {
        await postToTwitter(project, post.content);

        post.status = POST_STATUS.POSTED;
        post.postedAt = new Date();
        await post.save();
      } catch (err) {
        post.status = POST_STATUS.FAILED;
        post.failureReason = err.message;
        await post.save();
        throw err;
      } finally {
        await autoStopIfFinished(projectId);
      }
    },
    { connection: redis }
  );
};
