import "dotenv/config";

type AppConfig = {
  isTesting: boolean;
  isProduction: boolean;
  isDevelopment: boolean;
  port: number;
  postgres: {
    user: string;
    password: string;
    database: string;
    host: string;
    port: number;
  };
};

type NodeEnv = "development" | "production" | "test";
const nodeEnv = (process.env.NODE_ENV ?? "development") as NodeEnv;

const isTesting = nodeEnv === "test";
const isProduction = nodeEnv === "production";
const isDevelopment = nodeEnv === "development";

const development: AppConfig = {
  isTesting,
  isProduction,
  isDevelopment,
  port: Number(process.env.PORT ?? 3000),
  postgres: {
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "eli_test_strips",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
  },
};

const production: AppConfig = {
  isTesting,
  isProduction,
  isDevelopment,
  port: Number(process.env.PORT ?? 3000),
  postgres: {
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "eli_test_strips",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
  },
};

const test: AppConfig = {
  isTesting,
  isProduction,
  isDevelopment,
  port: Number(process.env.PORT ?? 3000),
  postgres: {
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME_TEST ?? "eli_test_strips_test",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
  },
};

const configMap: Record<string, AppConfig> = {
  test,
  development,
  production,
};

export const appConfig = configMap[nodeEnv];
