import { Worker, Job } from 'bullmq';
import { getRedisConnection, isRedisAvailable } from '../../config/redis';
import { logger } from '../../shared/utils/logger';
import { fullSync, incrementalSync, priceSyncOnly } from '../../modules/ingestion/sync.engine';
import type { IngestionJobData } from '../queue';

let worker: Worker | null = null;

async function processIngestionJob(job: Job): Promise<void> {
  const { connectionId, syncType, triggeredBy } = job.data as IngestionJobData;
  logger.info(`Ingestion job started: ${syncType} for connection ${connectionId} (triggered by ${triggeredBy})`);

  switch (syncType) {
    case 'full':
      await fullSync(connectionId, triggeredBy);
      break;
    case 'incremental':
      await incrementalSync(connectionId, triggeredBy);
      break;
    case 'price-only':
      await priceSyncOnly(connectionId, triggeredBy);
      break;
    default:
      throw new Error(`Unknown sync type: ${syncType}`);
  }
}

export function startIngestionWorker(): Worker | null {
  if (!isRedisAvailable()) {
    logger.warn('Redis unavailable — ingestion worker not started');
    return null;
  }

  const connection = getRedisConnection();
  if (!connection) return null;

  worker = new Worker('ingestion', processIngestionJob, {
    connection,
    concurrency: 1,
  });

  worker.on('completed', (job) => {
    const data = job?.data as IngestionJobData;
    logger.info(`Ingestion job completed: ${data.syncType} for ${data.connectionId}`);
  });

  worker.on('failed', (job, err) => {
    const data = job?.data as IngestionJobData;
    logger.error(`Ingestion job failed: ${data?.syncType} for ${data?.connectionId}`, { error: err.message });
  });

  logger.info('Ingestion worker started (concurrency: 1)');
  return worker;
}

export async function stopIngestionWorker(): Promise<void> {
  if (worker) {
    await worker.close().catch(() => {});
    worker = null;
  }
}
