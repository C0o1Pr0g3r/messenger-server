import { either } from "fp-ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fn<Args extends any[] = any[], Ret = any> = (...args: Args) => Ret;
type UnknownFn = Fn<unknown[], unknown>;

function throwify<E extends Error, A>(value: either.Either<E, A>) {
  if (either.isLeft(value)) throw value.left;

  return value.right;
}

function iife<T extends unknown[], U>(fn: Fn<T, U>, ...args: T): U {
  return fn(...args);
}

export { iife, throwify };
export type { Fn, UnknownFn };
