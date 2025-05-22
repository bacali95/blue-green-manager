import type { CommandStatus, Prisma, RegistrationToken } from '@prisma/client';
import type { InputJsonValue, JsonValue } from '@prisma/client/runtime/library';

export type IRpcSchema = {
  [entity: string]: {
    [operation: string]: (params: any, request: Request) => Promise<any>;
  };
};

export type RpcClient<T extends IRpcSchema> = {
  [K in keyof T]: {
    [L in keyof T[K]]: (
      params: Parameters<T[K][L]>[0],
      signal?: AbortSignal,
    ) => ReturnType<T[K][L]>;
  };
};

export type RpcSchema = {
  agent: {
    register: (params: {
      ip: string;
      registrationToken: string;
      hostname: string;
      publicKey: string;
    }) => Promise<{
      agentId: string;
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    }>;
    refresh: (params: { refreshToken: string }) => Promise<{
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    }>;
    poll: (
      params: { agentId: string },
      request: Request,
    ) => Promise<{
      commandId: string;
      command: string;
      applicationId: string;
      deploymentId: string | null;
      metadata: JsonValue;
    }>;
  };
  command: {
    submitResult: (
      params: {
        commandId: string;
        status: CommandStatus;
        stdoutEnc: string;
        stderrEnc: string;
        durationMs: number;
        metadata: Prisma.NullableJsonNullValueInput | InputJsonValue;
      },
      request: Request,
    ) => Promise<void>;
  };
  registrationToken: {
    create: (params: { hostname: string; validForMinutes: number }) => Promise<RegistrationToken>;
  };
};
