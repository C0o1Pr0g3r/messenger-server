function isNullish(value: unknown) {
  return value === null || value === undefined;
}

function isObject(value: unknown) {
  return typeof value === "object" && value !== null;
}

function hasMethod<T extends string>(
  value: unknown,
  name: T,
): value is Record<T, (...args: unknown[]) => unknown> {
  return (
    isObject(value) &&
    name in value &&
    typeof (value as Record<string, unknown>)[name] === "function"
  );
}

function isOneOf<T extends unknown[]>(value: unknown, values: T): value is T[number] {
  return values.includes(value);
}

export { hasMethod, isNullish, isObject, isOneOf };
