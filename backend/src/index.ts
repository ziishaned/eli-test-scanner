import path from "path";
import pinoHTTP from "pino-http";
import express, { Request, Response } from "express";
import { appConfig } from "./config";
import { logger } from "./utils/logger";
import testStripRoutes from "./routes/test-strip-routes";

const app = express();

app.use(pinoHTTP({ logger }));

app.use("/uploads", express.static(path.resolve("../uploads")));

app.use("/api/test-strips", testStripRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

app.listen(appConfig.port, () => {
  logger.info(`Server is running on port ${appConfig.port}`);
});
