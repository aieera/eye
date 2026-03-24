import { Worker, Job } from 'bullmq';
import { getRedisConnection, isRedisAvailable } from '../../config/redis';
import prisma from '../../config/database';
import { logger } from '../../shared/utils/logger';
import type { MaintenanceJobData } from '../queue';

let worker: Worker | null = null;

async function processMaintenanceJob(job: Job): Promise<void> {
  const { task } = job.data as MaintenanceJobData;
  logger.info(`Maintenance task started: ${task}`);

  switch (task) {
    case 'expire-offers': {
      const result = await prisma.offer.updateMany({
        where: { endDate: { lt: new Date() }, isActive: true },
        data: { isActive: false },
      });
      logger.info(`Expired ${result.count} offers`);
      break;
    }

    case 'check-heartbeats': {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = await prisma.screen.updateMany({
        where: {
          status: 'online',
          isActive: true,
          lastHeartbeat: { lt: fiveMinAgo },
        },
        data: { status: 'offline' },
      });
      if (result.count > 0) {
        logger.info(`Marked ${result.count} screens offline (no heartbeat > 5min)`);
      }
      break;
    }

    case 'cleanup-logs': {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      const screenLogs = await prisma.screenLog.deleteMany({
        where: { createdAt: { lt: thirtyDaysAgo } },
      });
      const systemLogs = await prisma.systemLog.deleteMany({
        where: { createdAt: { lt: ninetyDaysAgo } },
      });
      const ingestionLogs = await prisma.ingestionLog.deleteMany({
        where: { createdAt: { lt: ninetyDaysAgo } },
      });
      logger.info(`Cleanup: ${screenLogs.count} screen logs, ${systemLogs.count} system logs, ${ingestionLogs.count} ingestion logs deleted`);
      break;
    }
  }
}

export function startMaintenanceWorker(): Worker | null {
  if (!isRedisAvailable()) {
    logger.warn('Redis unavailable — maintenance worker not started');
    return null;
  }

  const connection = getRedisConnection();
  if (!connection) return null;

  worker = new Worker('maintenance', processMaintenanceJob, {
    connection,
    concurrency: 1,
  });

  worker.on('completed', (job) => {
    logger.info(`Maintenance task completed: ${job.data.task}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Maintenance task failed: ${job?.data.task}`, { error: err.message });
  });

  logger.info('Maintenance worker started');
  return worker;
}

export function getMaintenanceWorker(): Worker | null {
  return worker;
}

export async function stopMaintenanceWorker(): Promise<void> {
  if (worker) {
    await worker.close().catch(() => {});
    worker = null;
  }
}
