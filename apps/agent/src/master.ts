import { type RpcSchema, createRpcClient } from '@commons/shared';

export const api = createRpcClient<RpcSchema>('/rpc');
