import type { OperationalErrorOptions } from "~/common";
import { OperationalError } from "~/common";

type KeyType = "foreign" | "unique";

abstract class KeyViolationError<T extends KeyType> extends OperationalError {
  constructor(
    readonly type: T,
    readonly constraintName: string,
    options?: OperationalErrorOptions,
  ) {
    super(options);
    this.message = `The ${this.type} key constraint named '${this.constraintName}' was violated.`;
  }
}

export { KeyViolationError };
export type { KeyType };
