import type { OperationalErrorOptions } from "~/common";
import { OperationalError } from "~/common";

class ExpirationError extends OperationalError {
  constructor(
    readonly expiredAt: Date,
    options?: OperationalErrorOptions,
  ) {
    super(options);
    this.message = `Token expired on ${this.expiredAt.toString()}`;
  }
}

export { ExpirationError };
