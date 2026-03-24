import { z } from 'zod';

export const createScheduleSchema = z.object({
  screenId: z.string().uuid(),
  playlistId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be HH:mm format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be HH:mm format'),
  recurrenceType: z.enum(['once', 'daily', 'weekly']).default('daily'),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional().nullable(),
  priority: z.coerce.number().int().min(0).max(100).default(0),
}).refine((data) => data.startTime < data.endTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
}).refine((data) => {
  if (data.recurrenceType === 'weekly' && (!data.daysOfWeek || data.daysOfWeek.length === 0)) return false;
  return true;
}, { message: 'Weekly recurrence requires at least one day selected', path: ['daysOfWeek'] });

export const updateScheduleSchema = z.object({
  playlistId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  recurrenceType: z.enum(['once', 'daily', 'weekly']).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional().nullable(),
  priority: z.coerce.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

export const listSchedulesSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  screenId: z.string().uuid().optional(),
  playlistId: z.string().uuid().optional(),
  isActive: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const calendarSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type ListSchedulesQuery = z.infer<typeof listSchedulesSchema>;
export type CalendarQuery = z.infer<typeof calendarSchema>;
