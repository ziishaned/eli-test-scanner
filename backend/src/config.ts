import "dotenv/config";
import path from "path";

export const uploadsDirectoryPath = path.resolve("../uploads");

type AppConfig = {
  port: number;
  isDevelopment: boolean;
  postgres: {
    user: string;
    password: string;
    database: string;
    host: string;
    port: number;
  };
};

export const appConfig: AppConfig = {
  port: Number(process.env.PORT ?? 3000),
  isDevelopment: process.env.NODE_ENV === "development",
  postgres: {
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "eli_test_strips",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
  },
};
