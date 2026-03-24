import { z } from 'zod';

export const screenLogsSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  screenId: z.string().uuid().optional(),
  eventType: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const systemLogsSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  level: z.enum(['info', 'warn', 'error']).optional(),
  module: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().optional(),
});

export const ingestionLogsSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  connectionId: z.string().uuid().optional(),
  status: z.enum(['running', 'success', 'failed']).optional(),
  syncType: z.enum(['full', 'incremental', 'price-only']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type ScreenLogsQuery = z.infer<typeof screenLogsSchema>;
export type SystemLogsQuery = z.infer<typeof systemLogsSchema>;
export type IngestionLogsQuery = z.infer<typeof ingestionLogsSchema>;
