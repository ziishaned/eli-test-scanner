import { Pool } from "pg";
import { logger } from "./utils/logger";

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "", 10),
});

pool.on("remove", () => {
  logger.info("Database client removed");
});

pool.on("acquire", () => {
  logger.info("Database connection acquired");
});

pool.on("connect", () => {
  logger.info("Database connection established");
});

pool.on("release", () => {
  logger.info("Database connection released");
});

pool.on("error", (client) => {
  logger.error(`Database connection error ${client.message}`);
});
