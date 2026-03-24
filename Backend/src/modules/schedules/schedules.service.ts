import prisma from '../../config/database';
import { AppError } from '../../shared/utils/apiError';
import { parsePagination, buildPaginationMeta } from '../../shared/utils/pagination';
import type { CreateScheduleInput, UpdateScheduleInput, ListSchedulesQuery } from './schedules.schema';

const scheduleInclude = {
  screen: { select: { id: true, screenName: true, screenCode: true } },
  playlist: { select: { id: true, name: true, status: true, version: true } },
};

export async function list(query: ListSchedulesQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where: any = {};

  if (query.screenId) where.screenId = query.screenId;
  if (query.playlistId) where.playlistId = query.playlistId;
  if (query.isActive !== undefined) where.isActive = query.isActive;

  if (query.dateFrom || query.dateTo) {
    where.startDate = {};
    if (query.dateTo) where.startDate.lte = query.dateTo;
    if (query.dateFrom) {
      where.OR = [
        { endDate: null },
        { endDate: { gte: query.dateFrom } },
      ];
    }
  }

  const [schedules, total] = await Promise.all([
    prisma.schedule.findMany({
      where, skip, take: limit,
      orderBy: [{ startDate: 'desc' }, { startTime: 'asc' }],
      include: scheduleInclude,
    }),
    prisma.schedule.count({ where }),
  ]);

  return { schedules, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getById(id: string) {
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: {
      screen: { select: { id: true, screenName: true, screenCode: true, locationId: true } },
      playlist: {
        select: { id: true, name: true, status: true, version: true },
        include: { _count: { select: { items: true } } } as any,
      },
    },
  });
  if (!schedule) throw AppError.notFound('Schedule not found');
  return schedule;
}

export async function create(data: CreateScheduleInput) {
  const screen = await prisma.screen.findUnique({ where: { id: data.screenId } });
  if (!screen || !screen.isActive) throw AppError.notFound('Screen not found or inactive');

  const playlist = await prisma.playlist.findUnique({ where: { id: data.playlistId } });
  if (!playlist || !playlist.isActive) throw AppError.notFound('Playlist not found or inactive');

  const conflicts = await validateOverlap(
    data.screenId, data.startDate, data.endDate || null,
    data.startTime, data.endTime, data.recurrenceType,
    data.daysOfWeek || null
  );

  const schedule = await prisma.schedule.create({
    data: {
      screenId: data.screenId,
      playlistId: data.playlistId,
      startDate: data.startDate,
      endDate: data.endDate || null,
      startTime: data.startTime,
      endTime: data.endTime,
      recurrenceType: data.recurrenceType || 'daily',
      daysOfWeek: data.daysOfWeek as any || null,
      priority: data.priority ?? 0,
    },
    include: scheduleInclude,
  });

  return { schedule, conflicts };
}

export async function update(id: string, data: UpdateScheduleInput) {
  const existing = await prisma.schedule.findUnique({ where: { id }, include: scheduleInclude });
  if (!existing) throw AppError.notFound('Schedule not found');

  if (data.playlistId) {
    const playlist = await prisma.playlist.findUnique({ where: { id: data.playlistId } });
    if (!playlist || !playlist.isActive) throw AppError.notFound('Playlist not found or inactive');
  }

  let conflicts: any = { hasConflict: false, conflicts: [] };
  const screenId = existing.screenId;
  const startDate = data.startDate || existing.startDate;
  const endDate = data.endDate !== undefined ? data.endDate : existing.endDate;
  const startTime = data.startTime || existing.startTime;
  const endTime = data.endTime || existing.endTime;
  const recurrenceType = data.recurrenceType || existing.recurrenceType;
  const daysOfWeek = data.daysOfWeek !== undefined ? data.daysOfWeek : existing.daysOfWeek;

  if (data.startTime || data.endTime || data.startDate || data.endDate || data.recurrenceType) {
    conflicts = await validateOverlap(
      screenId, startDate, endDate,
      startTime, endTime, recurrenceType,
      daysOfWeek as number[] | null, id
    );
  }

  const updateData: any = {};
  if (data.playlistId !== undefined) updateData.playlist = { connect: { id: data.playlistId } };
  if (data.startDate !== undefined) updateData.startDate = data.startDate;
  if (data.endDate !== undefined) updateData.endDate = data.endDate;
  if (data.startTime !== undefined) updateData.startTime = data.startTime;
  if (data.endTime !== undefined) updateData.endTime = data.endTime;
  if (data.recurrenceType !== undefined) updateData.recurrenceType = data.recurrenceType;
  if (data.daysOfWeek !== undefined) updateData.daysOfWeek = data.daysOfWeek;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const schedule = await prisma.schedule.update({
    where: { id },
    data: updateData,
    include: scheduleInclude,
  });

  return { schedule, conflicts };
}

export async function remove(id: string) {
  const existing = await prisma.schedule.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Schedule not found');
  await prisma.schedule.delete({ where: { id } });
}

export async function getScreenSchedules(screenId: string, dateFrom?: Date, dateTo?: Date) {
  const where: any = { screenId, isActive: true };

  if (dateFrom || dateTo) {
    if (dateTo) {
      where.startDate = { lte: dateTo };
    }
    if (dateFrom) {
      where.OR = [
        { endDate: null },
        { endDate: { gte: dateFrom } },
      ];
    }
  }

  return prisma.schedule.findMany({
    where,
    orderBy: { startTime: 'asc' },
    include: {
      playlist: { select: { id: true, name: true, status: true, version: true } },
    },
  });
}

export async function getActiveSchedule(screenId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const dayOfWeek = now.getDay(); // 0=Sun..6=Sat

  const schedules = await prisma.schedule.findMany({
    where: {
      screenId,
      isActive: true,
      startDate: { lte: now },
      startTime: { lte: currentTime },
      endTime: { gt: currentTime },
    },
    include: {
      playlist: { select: { id: true, name: true, status: true, version: true } },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });

  // Filter by recurrence and date range
  for (const schedule of schedules) {
    // Check end date
    if (schedule.endDate && schedule.endDate < today) continue;

    if (schedule.recurrenceType === 'once') {
      const schedDate = new Date(schedule.startDate);
      if (
        schedDate.getFullYear() === today.getFullYear() &&
        schedDate.getMonth() === today.getMonth() &&
        schedDate.getDate() === today.getDate()
      ) {
        return schedule;
      }
      continue;
    }

    if (schedule.recurrenceType === 'daily') {
      return schedule;
    }

    if (schedule.recurrenceType === 'weekly') {
      const days = schedule.daysOfWeek as number[] | null;
      if (days && days.includes(dayOfWeek)) {
        return schedule;
      }
      continue;
    }
  }

  return null;
}

export async function validateOverlap(
  screenId: string,
  startDate: Date,
  endDate: Date | null,
  startTime: string,
  endTime: string,
  recurrenceType: string,
  daysOfWeek: number[] | null,
  excludeId?: string
) {
  const where: any = {
    screenId,
    isActive: true,
    startTime: { lt: endTime },
    endTime: { gt: startTime },
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existing = await prisma.schedule.findMany({
    where,
    include: {
      screen: { select: { screenName: true } },
      playlist: { select: { name: true } },
    },
  });

  const conflicts: { scheduleId: string; screenName: string; playlistName: string; startTime: string; endTime: string }[] = [];

  for (const sched of existing) {
    // Check date overlap
    const schedEndDate = sched.endDate || new Date('2099-12-31');
    const newEndDate = endDate || new Date('2099-12-31');
    if (sched.startDate > newEndDate || schedEndDate < startDate) continue;

    // Check recurrence overlap
    let recurrenceOverlaps = false;

    if (recurrenceType === 'daily' || sched.recurrenceType === 'daily') {
      recurrenceOverlaps = true;
    } else if (recurrenceType === 'weekly' && sched.recurrenceType === 'weekly') {
      const existingDays = (sched.daysOfWeek as number[]) || [];
      const newDays = daysOfWeek || [];
      recurrenceOverlaps = existingDays.some((d) => newDays.includes(d));
    } else if (recurrenceType === 'once' || sched.recurrenceType === 'once') {
      recurrenceOverlaps = true; // Simplified — once on any overlapping date
    } else {
      recurrenceOverlaps = true;
    }

    if (recurrenceOverlaps) {
      conflicts.push({
        scheduleId: sched.id,
        screenName: sched.screen.screenName,
        playlistName: sched.playlist.name,
        startTime: sched.startTime,
        endTime: sched.endTime,
      });
    }
  }

  return { hasConflict: conflicts.length > 0, conflicts };
}

export async function getScheduleCalendar(screenId: string, month: number, year: number) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const schedules = await prisma.schedule.findMany({
    where: {
      screenId,
      isActive: true,
      startDate: { lte: endOfMonth },
      OR: [
        { endDate: null },
        { endDate: { gte: startOfMonth } },
      ],
    },
    include: {
      playlist: { select: { id: true, name: true } },
    },
    orderBy: { startTime: 'asc' },
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const calendar: { date: string; schedules: any[] }[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    const daySchedules: any[] = [];

    for (const sched of schedules) {
      // Check if this schedule is active on this day
      if (sched.startDate > date) continue;
      if (sched.endDate && sched.endDate < date) continue;

      let active = false;
      if (sched.recurrenceType === 'daily') active = true;
      else if (sched.recurrenceType === 'once') {
        const sd = new Date(sched.startDate);
        active = sd.getFullYear() === year && sd.getMonth() === month - 1 && sd.getDate() === day;
      } else if (sched.recurrenceType === 'weekly') {
        const days = (sched.daysOfWeek as number[]) || [];
        active = days.includes(dayOfWeek);
      }

      if (active) {
        daySchedules.push({
          id: sched.id,
          playlistName: sched.playlist.name,
          playlistId: sched.playlistId,
          startTime: sched.startTime,
          endTime: sched.endTime,
          priority: sched.priority,
          recurrenceType: sched.recurrenceType,
        });
      }
    }

    calendar.push({ date: dateStr, schedules: daySchedules });
  }

  return calendar;
}
