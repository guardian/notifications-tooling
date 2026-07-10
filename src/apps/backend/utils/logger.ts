import { env } from "@config";
import pino from "pino";

const isProduction = env.NODE_ENV === "production";

export const logger = pino({
  level: env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  // Pretty, colorized output in development; structured JSON in production.
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss.l",
          ignore: "pid,hostname",
        },
      },
});
