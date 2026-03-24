import prisma from '../../config/database';

export async function getDashboardStats() {
  const [
    screenCounts,
    productStats,
    activeOffers,
    playlistStats,
    recentSyncLog,
    recentErrors,
  ] = await Promise.all([
    prisma.screen.groupBy({
      by: ['status'],
      where: { isActive: true },
      _count: true,
    }),
    Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, hasValidImage: true } }),
      prisma.product.count({ where: { isActive: true, hasValidImage: false } }),
      prisma.product.count({ where: { isActive: true, isSynced: true } }),
    ]),
    prisma.offer.count({
      where: { isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
    }),
    Promise.all([
      prisma.playlist.count({ where: { isActive: true } }),
      prisma.playlist.count({ where: { isActive: true, status: 'published' } }),
    ]),
    prisma.ingestionLog.findFirst({
      orderBy: { startedAt: 'desc' },
      select: {
        id: true, syncType: true, status: true,
        recordsProcessed: true, recordsCreated: true, recordsUpdated: true, recordsFailed: true,
        startedAt: true, completedAt: true,
        connection: { select: { name: true } },
      },
    }),
    Promise.all([
      prisma.systemLog.count({
        where: { level: 'error', createdAt: { gte: new Date(Date.now() - 86400000) } },
      }),
      prisma.screenLog.count({
        where: { eventType: 'error', createdAt: { gte: new Date(Date.now() - 86400000) } },
      }),
    ]),
  ]);

  const screens: Record<string, number> = { total: 0, online: 0, offline: 0, error: 0 };
  for (const group of screenCounts) {
    const status = group.status as string;
    screens[status] = (screens[status] || 0) + group._count;
    screens.total += group._count;
  }

  return {
    screens,
    products: { total: productStats[0], withImages: productStats[1], withoutImages: productStats[2], synced: productStats[3] },
    offers: { active: activeOffers },
    playlists: { total: playlistStats[0], published: playlistStats[1] },
    lastSync: recentSyncLog || null,
    errors: { system: recentErrors[0], screen: recentErrors[1], total: recentErrors[0] + recentErrors[1] },
  };
}

export async function getRecentActivity(limit = 15) {
  const [systemLogs, screenLogs] = await Promise.all([
    prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, level: true, module: true, action: true, message: true, createdAt: true },
    }),
    prisma.screenLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, eventType: true, createdAt: true, screen: { select: { screenName: true } } },
    }),
  ]);

  const activities = [
    ...systemLogs.map((l) => ({ type: 'system' as const, ...l, timestamp: l.createdAt })),
    ...screenLogs.map((l) => ({ type: 'screen' as const, ...l, timestamp: l.createdAt })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);

  return activities;
}
