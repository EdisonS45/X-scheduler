import Post from '../models/post.js';
import Project from '../models/project.js';
import TwitterAccount from '../models/TwitterAccount.js';
import { postToTwitter } from '../utils/twitterClient.js';
import { autoStopIfFinished } from './jobUtils.js';

export const processPostJob = async (job) => {
  const { postId, projectId } = job.data;

  const post = await Post.findById(postId);
  if (!post || post.status !== 'pending') return;

  const project = await Project.findById(projectId);
  if (!project || project.status !== 'running') return;

  const twitterAccount = await TwitterAccount.findById(
    project.twitterAccountId
  ).select('+accessToken +refreshToken');

  if (!twitterAccount || !twitterAccount.isActive) {
    post.status = 'failed';
    post.failureReason = 'Twitter account not connected';
    await post.save();
    return;
  }

  try {
    await postToTwitter(twitterAccount, post.content);

    post.status = 'posted';
    post.postedAt = new Date();
    await post.save();
  } catch (err) {
    post.status = 'failed';
    post.failureReason = err.message;
    await post.save();
    throw err; // BullMQ retry
  } finally {
    await autoStopIfFinished(projectId);
  }
};
