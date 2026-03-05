import { z } from "zod";

/* LOGIN */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/* FORGOT PASSWORD */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotFormData = z.infer<typeof forgotPasswordSchema>;