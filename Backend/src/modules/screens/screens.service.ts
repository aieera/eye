import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AppError } from '../../shared/utils/apiError';
import { parsePagination, buildPaginationMeta } from '../../shared/utils/pagination';
import type { CreateScreenInput, UpdateScreenInput, ListScreensQuery, HeartbeatInput } from './screens.schema';

function generateScreenCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SCR-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function list(query: ListScreensQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where: any = {};

  if (query.search) {
    where.OR = [
      { screenName: { contains: query.search } },
      { screenCode: { contains: query.search } },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.locationId) {
    where.locationId = query.locationId;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  const [screens, total] = await Promise.all([
    prisma.screen.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        location: { select: { id: true, name: true, oracleLocationId: true } },
      },
    }),
    prisma.screen.count({ where }),
  ]);

  // Strip deviceSecret from results
  const safeScreens = screens.map(({ deviceSecret, ...rest }) => rest);

  return { screens: safeScreens, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getById(id: string) {
  const screen = await prisma.screen.findUnique({
    where: { id },
    include: {
      location: { select: { id: true, name: true, oracleLocationId: true } },
      schedules: {
        where: { isActive: true },
        include: { playlist: { select: { id: true, name: true } } },
      },
      _count: { select: { screenLogs: true } },
    },
  });

  if (!screen) {
    throw AppError.notFound('Screen not found');
  }

  const { deviceSecret, ...safeScreen } = screen;
  return safeScreen;
}

export async function create(data: CreateScreenInput) {
  // Validate location exists
  const location = await prisma.location.findUnique({ where: { id: data.locationId } });
  if (!location) {
    throw AppError.notFound('Location not found');
  }

  const screenCode = generateScreenCode();
  const deviceToken = uuidv4();
  const rawDeviceSecret = crypto.randomBytes(32).toString('hex');
  const hashedSecret = await bcrypt.hash(rawDeviceSecret, 12);

  const screen = await prisma.screen.create({
    data: {
      screenName: data.screenName,
      screenCode,
      deviceToken,
      deviceSecret: hashedSecret,
      locationId: data.locationId,
      orientation: data.orientation || 'landscape',
      resolution: data.resolution,
    },
    include: {
      location: { select: { id: true, name: true, oracleLocationId: true } },
    },
  });

  const { deviceSecret, ...safeScreen } = screen;

  return {
    ...safeScreen,
    rawDeviceSecret,
  };
}

export async function update(id: string, data: UpdateScreenInput) {
  const existing = await prisma.screen.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Screen not found');
  }

  if (data.locationId) {
    const location = await prisma.location.findUnique({ where: { id: data.locationId } });
    if (!location) {
      throw AppError.notFound('Location not found');
    }
  }

  const screen = await prisma.screen.update({
    where: { id },
    data,
    include: {
      location: { select: { id: true, name: true, oracleLocationId: true } },
    },
  });

  const { deviceSecret, ...safeScreen } = screen;
  return safeScreen;
}

export async function remove(id: string) {
  const existing = await prisma.screen.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Screen not found');
  }

  await prisma.screen.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function registerDevice(screenCode: string) {
  const screen = await prisma.screen.findFirst({
    where: { screenCode, isActive: true },
    select: { id: true, deviceToken: true, screenName: true },
  });

  if (!screen) {
    throw AppError.notFound('Invalid screen code');
  }

  return { deviceToken: screen.deviceToken, screenId: screen.id, screenName: screen.screenName };
}

export async function heartbeat(screenId: string, data: HeartbeatInput) {
  const screen = await prisma.screen.findUnique({ where: { id: screenId } });
  if (!screen) {
    throw AppError.notFound('Screen not found');
  }

  await prisma.screen.update({
    where: { id: screenId },
    data: {
      lastHeartbeat: new Date(),
      status: 'online',
      ...(data.appVersion && { appVersion: data.appVersion }),
      ...(data.resolution && { resolution: data.resolution }),
    },
  });

  await prisma.screenLog.create({
    data: {
      screenId,
      eventType: 'heartbeat',
      payload: data as any,
    },
  });
}

export async function getStats() {
  const [total, online, offline, error] = await Promise.all([
    prisma.screen.count({ where: { isActive: true } }),
    prisma.screen.count({ where: { isActive: true, status: 'online' } }),
    prisma.screen.count({ where: { isActive: true, status: 'offline' } }),
    prisma.screen.count({ where: { isActive: true, status: 'error' } }),
  ]);

  return { total, online, offline, error };
}
