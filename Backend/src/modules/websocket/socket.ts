import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import prisma from '../../config/database';
import { logger } from '../../shared/utils/logger';
import { WS_EVENTS } from './events';

let io: Server | null = null;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Admin namespace — JWT auth
  const adminNamespace = io.of('/admin');
  adminNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, config.JWT_SECRET) as { sub: string; email: string };
      const user = await prisma.adminUser.findUnique({ where: { id: decoded.sub } });
      if (!user || !user.isActive) return next(new Error('User not found'));
      (socket as any).userId = user.id;
      (socket as any).userEmail = user.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  adminNamespace.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    logger.info(`Admin connected: ${userId} (socket: ${socket.id})`);
    socket.join('admin-room');
    socket.on('disconnect', () => {
      logger.info(`Admin disconnected: ${userId}`);
    });
  });

  // Screen namespace — device token auth
  const screenNamespace = io.of('/screen');
  screenNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['x-device-token'] as string;
      if (!token) return next(new Error('Device token required'));
      const decoded = jwt.verify(token, config.JWT_SECRET) as { sub: string; screenId?: string };
      if (!decoded.sub) return next(new Error('Invalid token'));
      const screen = await prisma.screen.findFirst({
        where: { OR: [{ id: decoded.sub }, { deviceToken: decoded.sub }], isActive: true },
      });
      if (!screen) return next(new Error('Screen not found'));
      (socket as any).screenId = screen.id;
      (socket as any).screenName = screen.screenName;
      next();
    } catch {
      next(new Error('Invalid device token'));
    }
  });

  screenNamespace.on('connection', async (socket: Socket) => {
    const screenId = (socket as any).screenId;
    const screenName = (socket as any).screenName;
    logger.info(`Screen connected: ${screenName} (${screenId})`);

    socket.join(`screen:${screenId}`);

    await prisma.screen.update({
      where: { id: screenId },
      data: { status: 'online', lastHeartbeat: new Date() },
    }).catch(() => {});

    adminNamespace.to('admin-room').emit(WS_EVENTS.SCREEN_STATUS_CHANGED, {
      screenId, screenName, status: 'online', timestamp: new Date().toISOString(),
    });

    socket.on(WS_EVENTS.SCREEN_HEARTBEAT, async (data: any) => {
      try {
        await prisma.screen.update({
          where: { id: screenId },
          data: {
            lastHeartbeat: new Date(),
            status: 'online',
            ...(data?.appVersion && { appVersion: data.appVersion }),
          },
        });
      } catch (err) {
        logger.error(`Heartbeat error for screen ${screenId}`, err);
      }
    });

    socket.on('disconnect', async () => {
      logger.info(`Screen disconnected: ${screenName} (${screenId})`);
      await prisma.screen.update({
        where: { id: screenId },
        data: { status: 'offline' },
      }).catch(() => {});
      adminNamespace.to('admin-room').emit(WS_EVENTS.SCREEN_STATUS_CHANGED, {
        screenId, screenName, status: 'offline', timestamp: new Date().toISOString(),
      });
    });
  });

  logger.info('Socket.IO initialized with /admin and /screen namespaces');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function emitToScreen(screenId: string, event: string, data: any) {
  if (!io) return;
  io.of('/screen').to(`screen:${screenId}`).emit(event, data);
}

export function emitToAdmins(event: string, data: any) {
  if (!io) return;
  io.of('/admin').to('admin-room').emit(event, data);
}

export function emitPlaylistPublish(screenIds: string[], playlistData: any) {
  if (!io) return;
  for (const screenId of screenIds) {
    io.of('/screen').to(`screen:${screenId}`).emit(WS_EVENTS.PLAYLIST_PUBLISHED, playlistData);
  }
  io.of('/admin').to('admin-room').emit(WS_EVENTS.PLAYLIST_PUBLISHED, {
    playlistId: playlistData.id,
    playlistName: playlistData.name,
    version: playlistData.version,
    affectedScreens: screenIds.length,
    timestamp: new Date().toISOString(),
  });
}
