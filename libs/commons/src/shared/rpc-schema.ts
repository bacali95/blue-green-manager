import type { AgentRegistrationToken, CommandStatus } from '@prisma/client';

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
    register: (params: AgentRegisterParams) => Promise<AgentRegisterResult>;
    refresh: (params: AgentRefreshParams) => Promise<AgentRefreshResult>;
    poll: (params: AgentPollParams) => Promise<AgentPollResult | null>;
  };
  command: {
    submitResult: (params: CommandSubmitResultParams, request: Request) => Promise<void>;
  };
  agentRegistrationToken: {
    create: (
      params: AgentRegistrationTokenCreateParams,
    ) => Promise<AgentRegistrationTokenCreateResult>;
  };
};

export type AgentRegisterParams = {
  ip: string;
  hostname: string;
  publicKey: string;
  registrationToken: string;
};
export type AgentRegisterResult = {
  agentId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  masterPublicKey: string;
};

export type AgentRefreshParams = {
  refreshToken: string;
};
export type AgentRefreshResult = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

export type AgentPollParams = {
  agentId: string;
};
export type AgentPollResult = {
  commandLogId: string;
  applicationName: string;
  deploymentId: string;
  dockerCompose: string;
  extraFiles: { name: string; content: string }[];
};

export type CommandSubmitResultParams = {
  commandId: string;
  status: CommandStatus;
  stdoutEnc: string;
  stderrEnc: string;
  duration: number;
};

export type AgentRegistrationTokenCreateParams = {
  agentId: string;
  validForMinutes: number;
};
export type AgentRegistrationTokenCreateResult = AgentRegistrationToken;
