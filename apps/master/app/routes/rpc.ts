import { createRpcHandler } from '@commons/server';

import { agentHandlers, registrationTokenHandlers } from '../handlers';
import type { Route } from './+types/rpc';

export async function action({ request }: Route.ActionArgs) {
  return createRpcHandler(request, {
    agent: agentHandlers,
    registrationToken: registrationTokenHandlers,
  });
}
