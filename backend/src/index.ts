import pinoHTTP from "pino-http";
import express, { NextFunction, Request, Response } from "express";
import { appConfig, uploadsDirectoryPath } from "./config";
import { logger } from "./utils/logger";
import testStripRoutes from "./routes/test-strip-routes";
import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "./errors/application-error";
import { NotFoundError } from "./errors/not-found-error";

const app = express();

app.use(pinoHTTP({ logger }));

app.use("/uploads", express.static(uploadsDirectoryPath));

app.use("/api/test-strips", testStripRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

app.use((req: Request, res: Response) => {
  throw new NotFoundError("Route not found");
});

app.use(
  (
    error: ApplicationError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.error(error);
    res.status(error.status ?? StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
);

app.listen(appConfig.port, () => {
  logger.info(`Server is running on port ${appConfig.port}`);
});
