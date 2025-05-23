import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const config = {
  environment: process.env['ENVIRONMENT'] ?? 'development',
  sessionSecret: process.env['SESSION_SECRET'],
  redisUrl: process.env['REDIS_URL'],
};
