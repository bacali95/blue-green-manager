import { randomBytes as crypto_randomBytes } from 'crypto';
import Redis from 'ioredis';
import type { SessionIdStorageStrategy, SessionStorage } from 'react-router';
import { createSessionStorage } from 'react-router';

export function genRandomID(size = 8): string {
  const randomBytes = crypto_randomBytes(size);
  return Buffer.from(randomBytes).toString('hex');
}

const expiresToSeconds = (expires: Date) => {
  const now = new Date();
  const expiresDate = new Date(expires);
  const secondsDelta = Math.round((expiresDate.getTime() - now.getTime()) / 1000);
  return secondsDelta < 0 ? 0 : secondsDelta;
};

export function createRedisSessionStorage({
  cookie,
  redisUrl,
}: {
  cookie: SessionIdStorageStrategy['cookie'];
  redisUrl: string;
}): SessionStorage {
  const redis = new Redis(redisUrl);

  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      const id = genRandomID();
      if (expires) {
        await redis.setex(id, expiresToSeconds(expires), JSON.stringify(data));
      } else {
        await redis.set(id, JSON.stringify(data));
      }
      return id;
    },
    async readData(id) {
      const data = await redis.get(id);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    },
    async updateData(id, data, expires) {
      if (expires) {
        await redis.setex(id, expiresToSeconds(expires), JSON.stringify(data));
      } else {
        await redis.set(id, JSON.stringify(data));
      }
    },
    async deleteData(id) {
      await redis.del(id);
    },
  });
}
