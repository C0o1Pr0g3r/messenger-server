import type { OperationalErrorOptions } from "./operational";
import { OperationalError } from "./operational";

class UnexpectedError extends OperationalError {
  constructor(
    cause: OperationalErrorOptions["cause"],
    message?: OperationalErrorOptions["message"],
  ) {
    super({
      message,
      cause,
    });

    if (typeof message !== "string") {
      this.message =
        "An unexpected error occurred. Either something went wrong, or you forgot to handle the error.";
    }
  }
}

export { UnexpectedError };
