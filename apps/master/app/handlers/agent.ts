import { AgentStatus } from '@prisma/client';

import { RpcSchema } from '@commons/shared';

import { validateAndConsumeRegistrationToken } from '../helpers';
import { prisma } from '../services';

export const agentHandlers: RpcSchema['agent'] = {
  register: async ({ ip, hostname, publicKey, registrationToken }) => {
    try {
      await validateAndConsumeRegistrationToken(registrationToken);

      const agent = await prisma.agent.create({
        data: {
          ip,
          hostname,
          publicKey,
          status: AgentStatus.ONLINE,
          lastSeenAt: new Date(),
        },
      });

      return { agentId: agent.id };
    } catch (error: any) {
      throw new Response(error.message, { status: 400 });
    }
  },
};
