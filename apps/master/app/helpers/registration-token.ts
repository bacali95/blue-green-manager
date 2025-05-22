import crypto from 'crypto';

import { prisma } from '../services';

export async function validateAndConsumeRegistrationToken(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const existingToken = await prisma.registrationToken.findUnique({
    where: { token: tokenHash, used: false, validUntil: { gt: new Date() } },
  });

  if (!existingToken) {
    throw new Response('Invalid or expired registration token', { status: 400 });
  }

  await prisma.registrationToken.update({
    where: { id: existingToken.id },
    data: { used: true },
  });

  return existingToken;
}
