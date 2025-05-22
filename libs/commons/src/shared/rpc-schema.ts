import type { RegistrationToken } from '@prisma/client';

export type IRpcSchema = {
  [entity: string]: {
    [operation: string]: (params: any) => Promise<any>;
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
    }) => Promise<{ agentId: string }>;
  };
  registrationToken: {
    create: (params: { hostname: string; validForMinutes: number }) => Promise<RegistrationToken>;
  };
};
