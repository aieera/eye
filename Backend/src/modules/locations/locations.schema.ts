import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  oracleLocationId: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().default('Asia/Dubai'),
});

export const updateLocationSchema = createLocationSchema.partial();

export const listLocationsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  isActive: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : undefined,
    z.boolean().optional()
  ),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type ListLocationsQuery = z.infer<typeof listLocationsSchema>;
