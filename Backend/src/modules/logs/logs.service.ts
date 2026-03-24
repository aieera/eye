import prisma from '../../config/database';
import { parsePagination, buildPaginationMeta } from '../../shared/utils/pagination';
import type { ScreenLogsQuery, SystemLogsQuery, IngestionLogsQuery } from './logs.schema';

export async function getScreenLogs(query: ScreenLogsQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where: any = {};
  if (query.screenId) where.screenId = query.screenId;
  if (query.eventType) where.eventType = query.eventType;
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) where.createdAt.gte = query.dateFrom;
    if (query.dateTo) where.createdAt.lte = query.dateTo;
  }

  const [logs, total] = await Promise.all([
    prisma.screenLog.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: { screen: { select: { id: true, screenName: true, screenCode: true } } },
    }),
    prisma.screenLog.count({ where }),
  ]);
  return { logs, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getSystemLogs(query: SystemLogsQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where: any = {};
  if (query.level) where.level = query.level;
  if (query.module) where.module = query.module;
  if (query.search) where.message = { contains: query.search };
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) where.createdAt.gte = query.dateFrom;
    if (query.dateTo) where.createdAt.lte = query.dateTo;
  }

  const [logs, total] = await Promise.all([
    prisma.systemLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.systemLog.count({ where }),
  ]);
  return { logs, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getIngestionLogs(query: IngestionLogsQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where: any = {};
  if (query.connectionId) where.connectionId = query.connectionId;
  if (query.status) where.status = query.status;
  if (query.syncType) where.syncType = query.syncType;
  if (query.dateFrom || query.dateTo) {
    where.startedAt = {};
    if (query.dateFrom) where.startedAt.gte = query.dateFrom;
    if (query.dateTo) where.startedAt.lte = query.dateTo;
  }

  const [logs, total] = await Promise.all([
    prisma.ingestionLog.findMany({
      where, skip, take: limit,
      orderBy: { startedAt: 'desc' },
      include: { connection: { select: { id: true, name: true } } },
    }),
    prisma.ingestionLog.count({ where }),
  ]);
  return { logs, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getLogStats() {
  const now = new Date();
  const day = new Date(now.getTime() - 86400000);
  const week = new Date(now.getTime() - 7 * 86400000);
  const month = new Date(now.getTime() - 30 * 86400000);

  const [errorsDay, errorsWeek, syncTotal, syncSuccess] = await Promise.all([
    Promise.all([
      prisma.systemLog.count({ where: { level: 'error', createdAt: { gte: day } } }),
      prisma.screenLog.count({ where: { eventType: 'error', createdAt: { gte: day } } }),
    ]),
    Promise.all([
      prisma.systemLog.count({ where: { level: 'error', createdAt: { gte: week } } }),
      prisma.screenLog.count({ where: { eventType: 'error', createdAt: { gte: week } } }),
    ]),
    prisma.ingestionLog.count({ where: { createdAt: { gte: month } } }),
    prisma.ingestionLog.count({ where: { status: 'success', createdAt: { gte: month } } }),
  ]);

  return {
    errors24h: errorsDay[0] + errorsDay[1],
    errors7d: errorsWeek[0] + errorsWeek[1],
    syncSuccessRate: syncTotal > 0 ? Math.round((syncSuccess / syncTotal) * 100) : 0,
    syncTotal30d: syncTotal,
  };
}

export async function createSystemLog(
  level: string, module: string, action: string, message: string,
  metadata?: any, userId?: string
) {
  // Fire and forget — don't await in hot paths
  prisma.systemLog.create({
    data: { level, module, action, message, metadata: metadata || undefined, userId: userId || undefined },
  }).catch(() => {}); // Silently ignore log write failures
}
