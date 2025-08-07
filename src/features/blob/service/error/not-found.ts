import type { OperationalErrorOptions } from "~/common";
import { OperationalError } from "~/common";

class NotFoundError extends OperationalError {
  constructor(
    readonly url: string,
    options?: OperationalErrorOptions,
  ) {
    super(options);
    this.message = `BLOB at "${this.url}" not found.`;
  }
}

export { NotFoundError };
