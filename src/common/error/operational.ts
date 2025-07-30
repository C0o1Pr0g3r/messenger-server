import type { BaseErrorOptions } from "./base";
import { BaseError } from "./base";

type OperationalErrorOptions = BaseErrorOptions;

const IS_OPERATIONAL = true;

abstract class OperationalError extends BaseError<typeof IS_OPERATIONAL> {
  constructor(options?: OperationalErrorOptions) {
    super(IS_OPERATIONAL, options);
    this.message = `An operational error occurred, that is, an error during execution that could have been foreseen and corrected.`;
  }
}

export { OperationalError };
export type { OperationalErrorOptions };
