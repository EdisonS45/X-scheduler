import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_PORT = parseInt(process.env.REDIS_PORT, 10);

if (!process.env.REDIS_HOST) {
  throw new Error('REDIS_HOST is missing');
}

if (!REDIS_PORT || Number.isNaN(REDIS_PORT)) {
  throw new Error(`Invalid REDIS_PORT: ${process.env.REDIS_PORT}`);
}

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: REDIS_PORT,
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,

  // Production-safe options
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy(times) {
    return Math.min(times * 1000, 10000);
  },
});

redis.on('connect', () => {
  console.log('🟢 Redis connected');
});

redis.on('error', (err) => {
  console.error('🔴 Redis error:', err.message);
});
