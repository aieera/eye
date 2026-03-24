import { config } from './index';
import { logger } from '../shared/utils/logger';

// Use IORedis from BullMQ's bundled dependency to avoid version conflicts
let Redis: any = null;
let redisConnection: any = null;
let redisAvailable = false;

function getRedisClass(): any {
  if (!Redis) {
    try {
      // BullMQ re-exports IORedis
      Redis = require('ioredis');
    } catch {
      // If ioredis not available at all, try bullmq's bundled version
      try {
        Redis = require('bullmq/node_modules/ioredis');
      } catch {
        return null;
      }
    }
  }
  return Redis;
}

export function createRedisConnection(): any {
  if (redisConnection) return redisConnection;

  const IORedis = getRedisClass();
  if (!IORedis) {
    logger.warn('IORedis not available');
    return null;
  }

  redisConnection = new IORedis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    retryStrategy(times: number) {
      if (times > 10) {
        logger.warn('Redis: max retries reached, stopping reconnection');
        return null;
      }
      const delay = Math.min(times * 500, 5000);
      return delay;
    },
    lazyConnect: true,
  });

  redisConnection.on('connect', () => {
    redisAvailable = true;
    logger.info('Redis connected');
  });

  redisConnection.on('error', (err: any) => {
    redisAvailable = false;
    logger.warn(`Redis error: ${err.message}`);
  });

  redisConnection.on('close', () => {
    redisAvailable = false;
  });

  return redisConnection;
}

export function getRedisConnection(): any {
  return redisConnection;
}

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

export async function connectRedis(): Promise<boolean> {
  try {
    const conn = createRedisConnection();
    if (!conn) return false;
    await conn.connect();
    redisAvailable = true;
    return true;
  } catch (err: any) {
    logger.warn(`Redis unavailable: ${err.message}. Background jobs will be disabled.`);
    redisAvailable = false;
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (redisConnection) {
    try {
      await redisConnection.quit();
    } catch {
      // ignore
    }
    redisConnection = null;
    redisAvailable = false;
  }
}
