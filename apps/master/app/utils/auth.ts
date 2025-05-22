import { verifyAccessToken } from './jwt';

export async function assertAgentAuthorized(request: Request, agentId: string) {
  const auth = request.headers.get('Authorization');

  if (!auth?.startsWith('Bearer ')) {
    throw new Response('Missing or invalid token', { status: 401 });
  }

  const token = auth.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (decoded.sub !== agentId || decoded.type !== 'agent') {
    throw new Response('Agent ID mismatch', { status: 403 });
  }
}
