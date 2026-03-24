import { z } from 'zod';

export const createScreenSchema = z.object({
  screenName: z.string().min(1).max(255),
  locationId: z.string().uuid(),
  orientation: z.enum(['landscape', 'portrait']).default('landscape'),
  resolution: z.string().optional(),
});

export const updateScreenSchema = createScreenSchema.partial();

export const listScreensSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
  status: z.enum(['online', 'offline', 'error']).optional(),
  locationId: z.string().uuid().optional(),
  isActive: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
});

export const registerDeviceSchema = z.object({
  screenCode: z.string().min(1),
});

export const heartbeatSchema = z.object({
  appVersion: z.string().optional(),
  resolution: z.string().optional(),
  memoryUsage: z.number().optional(),
  currentPlaylistId: z.string().uuid().optional(),
  currentItemIndex: z.number().optional(),
});

export type CreateScreenInput = z.infer<typeof createScreenSchema>;
export type UpdateScreenInput = z.infer<typeof updateScreenSchema>;
export type ListScreensQuery = z.infer<typeof listScreensSchema>;
export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
export type HeartbeatInput = z.infer<typeof heartbeatSchema>;
