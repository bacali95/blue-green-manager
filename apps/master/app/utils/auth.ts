import { redirect } from 'react-router';

import { getSession } from '@commons/server';

import { errors } from './errors';
import { verifyAccessToken } from './jwt';

export async function assertAgentAuthorized(request: Request, agentId: string) {
  const auth = request.headers.get('Authorization');

  if (!auth?.startsWith('Bearer ')) {
    throw errors.Unauthorized('Missing or invalid token');
  }

  const token = auth.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (decoded.sub !== agentId || decoded.type !== 'agent') {
    throw errors.Forbidden('Agent ID mismatch');
  }
}

export function agentMiddleware<Fn extends (params: any, request: Request) => Promise<any>>(
  fn: Fn,
): Fn {
  return (async (params: Parameters<Fn>[0], request: Request) => {
    await assertAgentAuthorized(request, params.agentId);

    return fn(params, request);
  }) as Fn;
}

export async function assertAdminAuthorized(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  const url = new URL(request.url);

  if (!session.has('user')) {
    throw redirect(`/login?returnUrl=${url.pathname}${url.search}${url.hash}`);
  }

  const user = session.get('user') as { type: 'admin' };

  if (user.type !== 'admin') {
    throw errors.Forbidden('Admin access required');
  }
}
