import { z } from "zod";

export const notificationPushRequestSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
};

// Infer types to use inside your controllers if needed
export type notificationPushRequestInput = z.infer<
  typeof notificationPushRequestSchema.body
>;
