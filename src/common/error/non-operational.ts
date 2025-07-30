import type { BaseErrorOptions } from "./base";
import { BaseError } from "./base";

type NonOperationalErrorOptions = BaseErrorOptions;

const IS_OPERATIONAL = false;

abstract class NonOperationalError extends BaseError<typeof IS_OPERATIONAL> {
  constructor(options?: NonOperationalErrorOptions) {
    super(IS_OPERATIONAL, options);
    this.message = `A non-operational error occurred, that is, a semantic (logical) error was made when writing the code.`;
  }
}

export { NonOperationalError };
export type { NonOperationalErrorOptions };
