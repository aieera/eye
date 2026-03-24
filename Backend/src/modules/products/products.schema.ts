import { z } from 'zod';

export const createProductSchema = z.object({
  externalItemCode: z.string().min(1).max(25),
  name: z.string().min(1).max(255),
  shortName: z.string().max(120).optional(),
  description: z.string().optional(),
  dept: z.string().optional(),
  classCode: z.string().optional(),
  subclass: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  uom: z.string().max(10).optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.string().optional(),
  hasImage: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
  locationId: z.string().uuid().optional(),
  isActive: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
});

export const updatePricesSchema = z.object({
  prices: z.array(
    z.object({
      locationId: z.string().uuid(),
      unitRetail: z.coerce.number().nonnegative(),
      sellingUnitRetail: z.coerce.number().nonnegative().optional(),
      sellingUom: z.string().optional(),
      currency: z.string().default('AED'),
    })
  ),
});

export const bulkCreateSchema = z.object({
  products: z.array(createProductSchema).min(1).max(500),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsSchema>;
export type UpdatePricesInput = z.infer<typeof updatePricesSchema>;
export type BulkCreateInput = z.infer<typeof bulkCreateSchema>;
