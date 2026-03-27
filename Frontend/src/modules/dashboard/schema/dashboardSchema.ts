import { z } from "zod";

export const dashboardSchema = z.object({
  activeScreens: z.number(),
  totalOffers: z.number(),
  totalProducts: z.number()
});

export type DashboardFormData = z.infer<typeof dashboardSchema>;