import { EMPTY } from "./constants";

function stringify2(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function capitalize<T extends string>(value: T) {
  return [value.charAt(0)?.toLocaleUpperCase(), value.slice(1)].join(EMPTY) as Capitalize<T>;
}

export { capitalize, stringify2 };
