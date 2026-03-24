import { z } from 'zod';

export const createConnectionSchema = z.object({
  name: z.string().min(1).max(255),
  host: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535).default(1521),
  serviceName: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  syncIntervalMinutes: z.coerce.number().int().min(5).max(1440).default(60),
});

export const updateConnectionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  host: z.string().min(1).optional(),
  port: z.coerce.number().int().min(1).max(65535).optional(),
  serviceName: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  syncIntervalMinutes: z.coerce.number().int().min(5).max(1440).optional(),
  isActive: z.boolean().optional(),
});

export const testConnectionSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535).default(1521),
  serviceName: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
});

export const triggerSyncSchema = z.object({
  syncType: z.enum(['full', 'incremental', 'price-only']),
});

export const createFieldMappingSchema = z.object({
  entityType: z.enum(['product', 'price']),
  externalField: z.string().min(1),
  internalField: z.string().min(1),
  transformRule: z.string().optional().nullable(),
  isRequired: z.boolean().default(false),
});

export const updateFieldMappingSchema = createFieldMappingSchema.partial();

export const listLogsSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  status: z.enum(['running', 'success', 'failed']).optional(),
  syncType: z.enum(['full', 'incremental', 'price-only']).optional(),
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;
export type UpdateConnectionInput = z.infer<typeof updateConnectionSchema>;
export type TestConnectionInput = z.infer<typeof testConnectionSchema>;
export type TriggerSyncInput = z.infer<typeof triggerSyncSchema>;
export type CreateFieldMappingInput = z.infer<typeof createFieldMappingSchema>;
export type UpdateFieldMappingInput = z.infer<typeof updateFieldMappingSchema>;
export type ListLogsQuery = z.infer<typeof listLogsSchema>;
