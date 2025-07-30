import type { NonOperationalErrorOptions } from "./non-operational";
import { NonOperationalError } from "./non-operational";

class ImpossibleError extends NonOperationalError {
  constructor(message: string, cause?: NonOperationalErrorOptions["cause"]) {
    super({
      message,
      cause,
    });
  }
}

export { ImpossibleError };
