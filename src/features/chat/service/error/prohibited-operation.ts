import type { OperationalErrorOptions } from "~/common";
import { OperationalError } from "~/common";

class ProhibitedOperationError extends OperationalError {
  constructor(
    readonly explanation: string,
    options?: OperationalErrorOptions,
  ) {
    super(options);
    this.message = "There is an attempt to carry out an illegal operation.";
  }
}

export { ProhibitedOperationError };
