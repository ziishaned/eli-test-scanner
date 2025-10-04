import 'dotenv/config';
import path from 'path';
import { AppConfig } from './types';

export const appConfig: AppConfig = {
  port: Number(process.env.PORT ?? 3000),
  uploadsDirPath: path.resolve('../uploads'),
  isDevelopment: process.env.NODE_ENV === 'development',
  postgres: {
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'eli_test_strips',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
  },
};
