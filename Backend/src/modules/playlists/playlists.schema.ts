import { z } from 'zod';

export const createPlaylistSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  locationId: z.string().uuid().optional().nullable(),
  transitionType: z.enum(['fade', 'slide', 'zoom', 'dissolve', 'none']).default('fade'),
  transitionDurationMs: z.coerce.number().int().min(0).max(5000).default(500),
  defaultDurationSec: z.coerce.number().int().min(1).max(120).default(5),
});

export const updatePlaylistSchema = createPlaylistSchema.partial();

export const listPlaylistsSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  locationId: z.string().uuid().optional(),
  isActive: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
});

export const addPlaylistItemSchema = z.object({
  itemType: z.enum(['product', 'offer', 'custom', 'media']),
  productId: z.string().uuid().optional().nullable(),
  offerId: z.string().uuid().optional().nullable(),
  mediaUrl: z.string().optional().nullable(),
  customText: z.string().optional().nullable(),
  customStyle: z.object({
    bgColor: z.string().optional(),
    textColor: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: z.string().optional(),
    textAlign: z.enum(['left', 'center', 'right']).optional(),
    bgImage: z.string().optional(),
  }).optional().nullable(),
  displayDurationSeconds: z.coerce.number().int().min(1).max(300).default(10),
  displayOrder: z.coerce.number().int().min(0),
});

export const updatePlaylistItemSchema = z.object({
  customText: z.string().optional().nullable(),
  customStyle: z.object({
    bgColor: z.string().optional(),
    textColor: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: z.string().optional(),
    textAlign: z.enum(['left', 'center', 'right']).optional(),
    bgImage: z.string().optional(),
  }).optional().nullable(),
  displayDurationSeconds: z.coerce.number().int().min(1).max(300).optional(),
  isActive: z.boolean().optional(),
});

export const reorderItemsSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    displayOrder: z.coerce.number().int().min(0),
  })).min(1),
});

export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>;
export type ListPlaylistsQuery = z.infer<typeof listPlaylistsSchema>;
export type AddPlaylistItemInput = z.infer<typeof addPlaylistItemSchema>;
export type UpdatePlaylistItemInput = z.infer<typeof updatePlaylistItemSchema>;
export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>;
