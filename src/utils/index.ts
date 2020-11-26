export * from './oca';
export * from './did';

export function tryGet(obj: any, ...path: string[]) {
  path = path || [];
  return path.reduce((prev, curr) => {
    if (!prev)
      return undefined;

    return prev[curr];
  }, obj);
}