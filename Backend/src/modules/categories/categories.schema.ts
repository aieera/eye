import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  oracleDept: z.string().optional().nullable(),
  oracleClass: z.string().optional().nullable(),
  oracleSubclass: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  level: z.enum(['dept', 'class', 'subclass']).default('dept'),
  displayOrder: z.coerce.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const listCategoriesSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
  level: z.enum(['dept', 'class', 'subclass']).optional(),
  parentId: z.string().uuid().optional().nullable(),
  isActive: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesSchema>;
