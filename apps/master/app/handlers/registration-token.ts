import crypto from 'crypto';

import { RpcSchema } from '@commons/shared';

import { prisma } from '../services';

export const registrationTokenHandlers: RpcSchema['registrationToken'] = {
  create: ({ hostname, validForMinutes }) => {
    const token = crypto.randomBytes(32).toString('hex');
    const validUntil = new Date(Date.now() + validForMinutes * 60 * 1000);

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    return prisma.registrationToken.create({
      data: {
        hostname,
        token: tokenHash,
        validUntil,
      },
    });
  },
};
