import { Queue } from 'bullmq';
import { getRedisConnection, isRedisAvailable } from '../config/redis';
import { logger } from '../shared/utils/logger';

export interface IngestionJobData {
  connectionId: string;
  syncType: 'full' | 'incremental' | 'price-only';
  triggeredBy: string;
}

export interface MaintenanceJobData {
  task: 'expire-offers' | 'check-heartbeats' | 'cleanup-logs';
}

let ingestionQueue: Queue | null = null;
let maintenanceQueue: Queue | null = null;

export function getIngestionQueue(): Queue | null {
  if (!isRedisAvailable()) return null;
  if (!ingestionQueue) {
    const connection = getRedisConnection();
    if (!connection) return null;
    ingestionQueue = new Queue('ingestion', { connection });
  }
  return ingestionQueue;
}

export function getMaintenanceQueue(): Queue | null {
  if (!isRedisAvailable()) return null;
  if (!maintenanceQueue) {
    const connection = getRedisConnection();
    if (!connection) return null;
    maintenanceQueue = new Queue('maintenance', { connection });
  }
  return maintenanceQueue;
}

export async function addIngestionJob(data: IngestionJobData): Promise<boolean> {
  const queue = getIngestionQueue();
  if (!queue) {
    logger.warn('Redis unavailable — cannot queue ingestion job');
    return false;
  }

  await queue.add(`sync-${data.syncType}`, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 60000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });
  logger.info(`Ingestion job queued: ${data.syncType} for connection ${data.connectionId}`);
  return true;
}

export async function addMaintenanceJob(data: MaintenanceJobData): Promise<boolean> {
  const queue = getMaintenanceQueue();
  if (!queue) {
    logger.warn('Redis unavailable — cannot queue maintenance job');
    return false;
  }

  await queue.add(data.task, data, {
    removeOnComplete: 50,
    removeOnFail: 20,
  });
  return true;
}

export async function closeQueues(): Promise<void> {
  if (ingestionQueue) {
    await ingestionQueue.close().catch(() => {});
    ingestionQueue = null;
  }
  if (maintenanceQueue) {
    await maintenanceQueue.close().catch(() => {});
    maintenanceQueue = null;
  }
}
