import type { OperationalErrorOptions } from "~/common";
import { OperationalError } from "~/common";

class InterlocutorNotFoundError extends OperationalError {
  constructor(options?: OperationalErrorOptions) {
    super(options);
    this.message = "Could not find interlocutor.";
  }
}

export { InterlocutorNotFoundError };
