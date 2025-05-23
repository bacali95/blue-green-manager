import { fetchData } from './fetch-data';
import type { RpcClient, RpcSchema } from './rpc-schema';

const callbackCache = new Map<
  string,
  Map<string, (params: any, signal?: AbortSignal) => Promise<any>>
>();

export function createRpcClient<T extends RpcSchema>(endpoint: string): RpcClient<T> {
  return new Proxy(
    {},
    {
      get: (_, entity: string) =>
        new Proxy(
          {},
          {
            get: (_, operation: string) => {
              const cache = callbackCache.get(entity) ?? new Map();

              callbackCache.set(entity, cache);

              if (!cache.has(operation)) {
                cache.set(operation, (params: any, signal?: AbortSignal) =>
                  fetchData(
                    `${endpoint}#${entity}:${operation}`,
                    'POST',
                    {
                      operation,
                      params,
                    },
                    signal,
                  ),
                );
              }

              return cache.get(operation);
            },
          },
        ),
    },
  ) as RpcClient<T>;
}
