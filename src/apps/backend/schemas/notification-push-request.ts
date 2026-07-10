import type { ValidatedRequest } from "express-zod-safe";
import { z } from "zod";

export const bodySchema = {
  subject: z
    .string()
    .min(2, "Subject must be at least 2 characters")
    .max(100, "Subject must be at most 100 characters"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .max(500, "Description must be at most 500 characters"),
};

export type NotificationPushRequest = ValidatedRequest<{
  body: typeof bodySchema;
}>;
