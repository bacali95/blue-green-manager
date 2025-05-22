import { AgentStatus, CommandStatus } from '@prisma/client';

import { RpcSchema } from '@commons/shared';

import { prisma } from '../services';
import {
  assertAgentAuthorized,
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  validateAndConsumeRegistrationToken,
} from '../utils';

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

      const refreshToken = generateRefreshToken();
      const refreshTokenExpiresAt = getRefreshTokenExpiry();

      await prisma.refreshToken.create({
        data: {
          agentId: agent.id,
          token: refreshToken,
          expiresAt: refreshTokenExpiresAt,
        },
      });

      const accessToken = generateAccessToken(agent.id);

      return {
        agentId: agent.id,
        accessToken,
        refreshToken,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY ?? '15m',
      };
    } catch (error: any) {
      throw new Response(error.message, { status: 400 });
    }
  },
  refresh: async ({ refreshToken }) => {
    if (!refreshToken) {
      throw new Response('Refresh token is required', { status: 400 });
    }

    const existingRefreshToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!existingRefreshToken || existingRefreshToken.expiresAt < new Date()) {
      throw new Response('Invalid or expired refresh token', { status: 401 });
    }

    const newToken = generateRefreshToken();
    const newTokenExpiresAt = getRefreshTokenExpiry();

    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { token: refreshToken },
      }),
      prisma.refreshToken.create({
        data: {
          token: newToken,
          expiresAt: newTokenExpiresAt,
          agentId: existingRefreshToken.agentId,
        },
      }),
    ]);

    const accessToken = generateAccessToken(existingRefreshToken.agentId);

    return {
      accessToken,
      refreshToken: newToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY ?? '15m',
    };
  },
  poll: async ({ agentId }, request) => {
    await assertAgentAuthorized(request, agentId);

    const command = await prisma.commandExecutionLog.findFirst({
      where: { agentId, status: CommandStatus.QUEUED },
      orderBy: { createdAt: 'asc' },
    });

    if (!command) throw new Response('Queue is empty!', { status: 204 });

    await prisma.commandExecutionLog.update({
      where: { id: command.id },
      data: { status: CommandStatus.RUNNING, executedAt: new Date() },
    });

    return {
      commandId: command.id,
      command: command.command,
      applicationId: command.applicationId,
      deploymentId: command.deploymentId,
      metadata: command.metadata,
    };
  },
};
