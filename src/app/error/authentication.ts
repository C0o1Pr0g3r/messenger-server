import type { OperationalErrorOptions } from "~/common";
import { OperationalError } from "~/common";

class AuthenticationError extends OperationalError {
  constructor(options?: OperationalErrorOptions) {
    super(options);
    this.message = "You are not authenticated.";
  }
}

export { AuthenticationError };
