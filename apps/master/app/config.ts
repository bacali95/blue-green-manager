import { generateKeyPair } from '@commons/server';

export const config = {
  keyPair: generateKeyPair(),
  adminToken: process.env.ADMIN_TOKEN ?? 'admin',
};
