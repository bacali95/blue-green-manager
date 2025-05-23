import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import ms, { StringValue } from 'ms';

import type { JwtPayload } from '~/types';

const JWT_SECRET = process.env.JWT_SECRET ?? '';
const ACCESS_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRY ?? '15m') as StringValue;
const REFRESH_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRY ?? '7d') as StringValue;

export function generateAccessToken(agentId: string): string {
  return jwt.sign({ sub: agentId, type: 'agent' }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function generateRefreshToken(): string {
  return randomBytes(64).toString('hex');
}

export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + ms(REFRESH_EXPIRES_IN));
}
