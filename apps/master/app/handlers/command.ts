import { decryptWithPrivateKey } from '@commons/server';
import { RpcSchema } from '@commons/shared';

import { config } from '~/config';
import { prisma } from '~/services';
import { assertAgentAuthorized } from '~/utils';

export const commandHandlers: RpcSchema['command'] = {
  submitResult: async ({ commandId, status, stdoutEnc, stderrEnc, duration }, request) => {
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
        stdout: decryptWithPrivateKey(stdoutEnc, config.keyPair.privateKey),
        stderr: decryptWithPrivateKey(stderrEnc, config.keyPair.privateKey),
        duration,
      },
    });
  },
};
