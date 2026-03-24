import http from 'http';
import app from './app';
import { config } from './config';
import prisma from './config/database';
import { logger } from './shared/utils/logger';
import { initializeSocket } from './modules/websocket/socket';
import { connectRedis, closeRedis } from './config/redis';
import { closeQueues } from './jobs/queue';
import { startMaintenanceWorker, stopMaintenanceWorker } from './jobs/workers/maintenance.worker';
import { startIngestionWorker, stopIngestionWorker } from './jobs/workers/ingestion.worker';
import { setupScheduledJobs } from './jobs/schedulers/cron.scheduler';

const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Start server
httpServer.listen(config.PORT, async () => {
  logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
  logger.info(`API prefix: ${config.API_PREFIX}`);
  logger.info(`WebSocket: /admin and /screen namespaces active`);
  logger.info(`CORS origin: ${config.CORS_ORIGIN}`);

  // Initialize Redis + workers (non-blocking — server works without Redis)
  try {
    const redisOk = await connectRedis();
    if (redisOk) {
      startMaintenanceWorker();
      startIngestionWorker();
      await setupScheduledJobs();
      logger.info('Background workers and scheduled jobs started');
    }
  } catch (err: any) {
    logger.warn(`Redis/Workers init failed: ${err.message}. Server continues without background jobs.`);
  }
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  io.close();

  // Stop workers
  await stopMaintenanceWorker().catch(() => {});
  await stopIngestionWorker().catch(() => {});
  await closeQueues().catch(() => {});
  await closeRedis().catch(() => {});

  httpServer.close(async () => {
    await prisma.$disconnect();
    logger.info('Server shut down gracefully');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
