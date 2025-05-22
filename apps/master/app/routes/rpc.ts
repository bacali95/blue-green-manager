import { createRpcHandler } from '@commons/server';

import { agentHandlers, commandHandlers, registrationTokenHandlers } from '../handlers';
import type { Route } from './+types/rpc';

export async function action({ request }: Route.ActionArgs) {
  return createRpcHandler(request, {
    agent: agentHandlers,
    command: commandHandlers,
    registrationToken: registrationTokenHandlers,
  });
}
