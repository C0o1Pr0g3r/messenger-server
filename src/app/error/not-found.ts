import type { OperationalErrorOptions } from "~/common";
import { OperationalError } from "~/common";

class NotFoundError extends OperationalError {
  constructor(options?: OperationalErrorOptions) {
    super(options);
    this.message = "Object not found.";
  }
}

export { NotFoundError };
