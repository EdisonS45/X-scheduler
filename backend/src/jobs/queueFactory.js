import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

export const getProjectQueue = (projectId) => {
  return new Queue(`project:${projectId}`, {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 60_000,
      },
    },
  });
};
