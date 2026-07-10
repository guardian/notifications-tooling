import { z } from "zod";

export const notificationPushRequestBodySchema = {
  subject: z
    .string()
    .min(2, "Subject must be at least 2 characters")
    .max(100, "Subject must be at most 100 characters"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .max(500, "Description must be at most 500 characters"),
};

// Infer types to use inside your controllers if needed
export type notificationPushRequestInput = z.infer<
  typeof notificationPushRequestBodySchema
>;
