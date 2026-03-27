import { z } from "zod";

export const offerSchema = z.object({
  name: z.string().min(2, "Offer name required"),

  offerType: z.enum(["percentage", "flat"], {
    required_error: "Offer type is required"
  }),

  offerValue: z
    .number({
      required_error: "Offer value is required"
    })
    .min(1, "Offer value must be greater than 0"),

  offerStartDate: z.string().min(1, "Start date required"),

  offerEndDate: z.string().min(1, "End date required"),

  status: z.enum(["active", "inactive"]).default("active")
});

export type OfferFormData = z.infer<typeof offerSchema>;