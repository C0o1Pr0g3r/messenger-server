import { z } from "zod";

import type { OperationalErrorOptions } from "~/common";
import { OperationalError } from "~/common";

const zVerificationErrorReason = z.enum(["SYNTACTICALLY_INCORRECT", "CRYPTOGRAPHICALLY_INVALID"]);
type VerificationErrorReason = z.infer<typeof zVerificationErrorReason>;

class VerificationError extends OperationalError {
  constructor(
    readonly reason: VerificationErrorReason,
    options?: OperationalErrorOptions,
  ) {
    super(options);
    switch (this.reason) {
      case "SYNTACTICALLY_INCORRECT":
        this.message = "Token does not match jwt format.";
        break;
      case "CRYPTOGRAPHICALLY_INVALID":
        this.message = "The token complies with the jwt format, but is cryptographically invalid.";
        break;
    }
  }
}

export { VerificationError, zVerificationErrorReason };
export type { VerificationErrorReason };
