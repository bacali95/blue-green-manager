import type { SessionIdStorageStrategy } from 'react-router';
import { createMemorySessionStorage } from 'react-router';

import { config } from './config';
import { createRedisSessionStorage, genRandomID } from './helpers';

const cookie: SessionIdStorageStrategy['cookie'] = {
  name: 'session',
  secure: config.environment === 'production',
  sameSite: 'lax',
  secrets: [config.sessionSecret ?? genRandomID(32)],
  path: '/',
  httpOnly: true,
  maxAge: 60 * 60, // 1 hour
};

export const { getSession, commitSession, destroySession } = config.redisUrl
  ? createRedisSessionStorage({ cookie, redisUrl: config.redisUrl })
  : createMemorySessionStorage({ cookie });
