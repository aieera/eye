import { z } from "zod";

export const brandSchema = z.object({

  name: z.string().min(2, "Brand name required"),

  logoUrl: z.string().url("Valid logo url required"),

  status: z.enum(["active", "inactive"]),

  offer: z.string().min(1),

  offerStatus: z.enum(["active", "inactive"])

});

export type BrandFormData = z.infer<typeof brandSchema>;