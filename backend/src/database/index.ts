import { Pool } from 'pg';
import { appConfig } from '../config';
import { logger } from '../utils/logger';

export const pool = new Pool({
  user: appConfig.postgres.user,
  host: appConfig.postgres.host,
  database: appConfig.postgres.database,
  password: appConfig.postgres.password,
  port: appConfig.postgres.port,
});

pool.on('remove', () => {
  logger.info('Database client removed');
});

pool.on('acquire', () => {
  logger.info('Database connection acquired');
});

pool.on('connect', () => {
  logger.info('Database connection established');
});

pool.on('release', () => {
  logger.info('Database connection released');
});

pool.on('error', (error: Error) => {
  logger.error(`Database connection error ${error.message} ${error.stack}`);
});
