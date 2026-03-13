import { z } from "zod";

export const screenSchema = z.object({
  screenName: z.string().min(2, "Screen name required"),
  screenCode: z.string().min(5),
  location: z.string().min(2),
  locationId: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  address: z.string()
});

export type ScreenFormData = z.infer<typeof screenSchema>;