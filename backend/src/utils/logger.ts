import pino from 'pino';
import { appConfig } from '../config';

export const logger = pino({
  transport: appConfig.isDevelopment ? { target: 'pino-pretty' } : undefined,
});
