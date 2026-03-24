import { getMaintenanceQueue } from '../queue';
import { logger } from '../../shared/utils/logger';

export async function setupScheduledJobs(): Promise<void> {
  const queue = getMaintenanceQueue();
  if (!queue) {
    logger.warn('Redis unavailable — scheduled jobs not set up');
    return;
  }

  try {
    // Remove old repeatable jobs first
    const existing = await queue.getRepeatableJobs();
    for (const job of existing) {
      await queue.removeRepeatableByKey(job.key);
    }

    // Check heartbeats every 1 minute
    await queue.add('check-heartbeats', { task: 'check-heartbeats' }, {
      repeat: { pattern: '*/1 * * * *' },
      removeOnComplete: 10,
      removeOnFail: 5,
    });

    // Expire offers daily at midnight
    await queue.add('expire-offers', { task: 'expire-offers' }, {
      repeat: { pattern: '0 0 * * *' },
      removeOnComplete: 10,
      removeOnFail: 5,
    });

    // Cleanup logs daily at 3 AM
    await queue.add('cleanup-logs', { task: 'cleanup-logs' }, {
      repeat: { pattern: '0 3 * * *' },
      removeOnComplete: 10,
      removeOnFail: 5,
    });

    logger.info('Scheduled jobs configured: check-heartbeats (1min), expire-offers (midnight), cleanup-logs (3AM)');
  } catch (err: any) {
    logger.error(`Failed to setup scheduled jobs: ${err.message}`);
  }
}
