export function getValueFromCookie<T extends string | number | boolean | object>(
  cookie: string,
  key: string,
  _default: T,
): T {
  const transformers = {
    string: (value: string) => String(value),
    number: (value: string) => parseInt(value),
    boolean: (value: string) => (value === 'true') as boolean,
    object: (value: string) => JSON.parse(value),
  } as const;

  try {
    return transformers[typeof _default as keyof typeof transformers](
      cookie
        .split('; ')
        .find((row) => row.startsWith(key))
        ?.split('=')[1] ??
        (typeof _default === 'object' ? JSON.stringify(_default) : String(_default)),
    ) as T;
  } catch {
    return _default;
  }
}
