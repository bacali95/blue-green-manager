import { RpcSchema } from '@commons/shared';

import { prisma } from '../services';
import { assertAgentAuthorized } from '../utils';

export const commandHandlers: RpcSchema['command'] = {
  submitResult: async (
    { commandId, status, stdoutEnc, stderrEnc, durationMs, metadata },
    request,
  ) => {
    const existing = await prisma.commandExecutionLog.findUnique({
      where: { id: commandId },
    });

    if (!existing) {
      throw new Response('Command not found', { status: 404 });
    }

    await assertAgentAuthorized(request, existing.agentId);

    await prisma.commandExecutionLog.update({
      where: { id: commandId },
      data: {
        status,
        stdoutEnc,
        stderrEnc,
        durationMs,
        metadata,
      },
    });
  },
};
