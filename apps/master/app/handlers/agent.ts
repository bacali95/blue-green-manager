import crypto from 'crypto';
import yaml from 'yaml';

import { AgentStatus, CommandStatus, type Prisma } from '@prisma/client';

import { encryptWithPublicKey } from '@commons/server';
import { type AgentPollResult, RpcSchema } from '@commons/shared';

import { config } from '~/config';
import { prisma } from '~/services';
import {
  agentMiddleware,
  errors,
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from '~/utils';

export const agentHandlers: RpcSchema['agent'] = {
  register: async ({ ip, hostname, publicKey, registrationToken }) => {
    await validateAndConsumeRegistrationToken(registrationToken);

    // Validate format of public key
    if (!publicKey.includes('BEGIN PUBLIC KEY')) {
      throw new Response('Invalid public key format', { status: 400 });
    }

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
      masterPublicKey: config.keyPair.publicKey,
    };
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
  poll: agentMiddleware(async ({ agentId }) => {
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });

    if (!agent || !agent.publicKey) {
      throw new Response('Agent public key not found', { status: 400 });
    }

    const command = await prisma.commandExecutionLog.findFirst({
      where: { agentId, status: CommandStatus.QUEUED },
      orderBy: { createdAt: 'asc' },
    });

    if (!command) return null;

    const deployment = await prisma.deployment.findUnique({
      where: { id: command.deploymentId },
      include: {
        application: { include: { services: true } },
        extraFiles: { include: { file: true } },
      },
    });

    if (!deployment) throw errors.NotFound('Deployment not found');

    let result: AgentPollResult | undefined = undefined;
    try {
      result = {
        commandLogId: command.id,
        applicationName: deployment.application.name,
        deploymentId: deployment.id,
        dockerCompose: encryptWithPublicKey(
          generateDockerCompose(deployment.application, deployment.variables),
          agent.publicKey,
        ),
        extraFiles: deployment.extraFiles.map(({ file }) => ({
          name: file.name,
          content: encryptWithPublicKey(file.content, agent.publicKey),
        })),
      };
    } catch {
      throw errors.InternalServerError('Failed to encrypt command payload');
    }

    await prisma.commandExecutionLog.update({
      where: { id: command.id },
      data: { status: CommandStatus.SENT, executedAt: new Date() },
    });

    return result;
  }),
};

async function validateAndConsumeRegistrationToken(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const existingToken = await prisma.agentRegistrationToken.findUnique({
    where: { token: tokenHash, used: false, expiresAt: { gt: new Date() } },
  });

  if (!existingToken) {
    throw new Response('Invalid or expired registration token', { status: 400 });
  }

  await prisma.agentRegistrationToken.update({
    where: { id: existingToken.id },
    data: { used: true },
  });

  return existingToken;
}

function generateDockerCompose(
  application: Prisma.ApplicationGetPayload<{ include: { services: true } }>,
  variables: any,
) {
  const replaceVariables = (
    str: string | string[] | Record<string, any>,
  ): string | string[] | Record<string, any> =>
    typeof str === 'string'
      ? str.replace(/\${(.*)}/g, (match, p1) => variables[p1] ?? match)
      : Array.isArray(str)
        ? str.map((item) => replaceVariables(item))
        : Object.fromEntries(
            Object.entries(str).map(([key, value]) => [
              replaceVariables(key),
              replaceVariables(value),
            ]),
          );

  const dockerCompose = {
    services: application.services.reduce(
      (acc, service) => {
        acc[service.name] = {
          image: replaceVariables(service.image),
          hostname: replaceVariables(service.hostname),
          restart: replaceVariables(service.restart),
          environment: replaceVariables(service.environment as Record<string, any>),
          ports: replaceVariables(service.ports),
          volumes: replaceVariables(service.volumes),
          depends_on: replaceVariables(service.dependsOn),
          healthcheck: replaceVariables(service.healthCheck as Record<string, any>),
        };

        return acc;
      },
      {} as Record<string, any>,
    ),
  };

  return yaml.stringify(dockerCompose);
}
