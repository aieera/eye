import { z } from 'zod';

export const assignImageSchema = z.object({
  url: z.string().url(),
  entityType: z.enum(['product', 'screen', 'offer']),
  entityId: z.string().uuid(),
});

export type AssignImageInput = z.infer<typeof assignImageSchema>;
