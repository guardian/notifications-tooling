import app from "./app";
import { logger } from "./utils/logger";

// --- Start Server ---
const PORT = Number(process.env["PORT"]) || 3000;
const HOST = process.env["HOST"] || "0.0.0.0";

app.listen(PORT, HOST, () => {
  logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
});
