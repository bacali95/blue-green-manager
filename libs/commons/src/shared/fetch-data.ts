import { UNSAFE_decodeViaTurboStream, UNSAFE_invariant } from 'react-router';

import { FetchError } from '../shared';

export async function fetchData<T>(
  url: string,
  method = 'GET',
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(
    `${url}?${typeof body === 'object' && body && 'operation' in body ? body.operation : ''}`,
    {
      method,
      body: body
        ? typeof body === 'string' || body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
      headers:
        body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined,
      signal,
    },
  );

  if (!response.ok) {
    throw new FetchError(await response.text(), response.status);
  }

  return response.json();
}

export async function fetchEncodedData<T>(
  url: string,
  method = 'GET',
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(
    `${url}?${typeof body === 'object' && body && 'operation' in body ? body.operation : ''}`,
    {
      method,
      body: body
        ? typeof body === 'string' || body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
      headers:
        body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined,
      signal,
    },
  );

  if (!response.ok) {
    throw new FetchError(await response.text(), response.status);
  }
  UNSAFE_invariant(response.body, 'No response body to decode');

  const decoded = await UNSAFE_decodeViaTurboStream(response.body, window);

  return extractDataFromResponse<T>(url, decoded.value);
}

function extractDataFromResponse<T>(url: string, value: unknown): T {
  if (typeof value !== 'object') {
    throw new Error('Unexpected response');
  }

  if (value === null) {
    throw new Error('Unexpected response');
  }

  if ('data' in value) return value.data as T;

  const route = `routes${url.replace(/\.data.*/, '')}`;

  if (route in value) return (value as { [key: typeof route]: { data: T } })[route].data;

  throw new Error('Unexpected response');
}
