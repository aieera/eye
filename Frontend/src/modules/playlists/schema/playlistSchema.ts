import { z } from "zod";

export const playlistSchema = z.object({
  name: z.string().min(2, "Playlist name required"),
  products: z.array(z.string()).min(1, "Select at least one product"),
});

export type PlaylistFormData = z.infer<typeof playlistSchema>;