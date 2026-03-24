import { z } from 'zod';

export const createOfferSchema = z.object({
  name: z.string().min(1).max(255),
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  productId: z.string().uuid().optional().nullable(),
  locationId: z.string().uuid().optional().nullable(),
  originalPrice: z.coerce.number().nonnegative().optional().nullable(),
  offerPrice: z.coerce.number().nonnegative().optional().nullable(),
  discountPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  source: z.enum(['manual', 'oracle']).default('manual'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

const baseOfferFields = z.object({
  name: z.string().min(1).max(255).optional(),
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  productId: z.string().uuid().optional().nullable(),
  locationId: z.string().uuid().optional().nullable(),
  originalPrice: z.coerce.number().nonnegative().optional().nullable(),
  offerPrice: z.coerce.number().nonnegative().optional().nullable(),
  discountPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  source: z.enum(['manual', 'oracle']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export const updateOfferSchema = baseOfferFields;

export const listOffersSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
  isActive: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
  productId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  source: z.enum(['manual', 'oracle']).optional(),
  status: z.enum(['active', 'expired', 'upcoming']).optional(),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type ListOffersQuery = z.infer<typeof listOffersSchema>;
