import type { KeyType } from "./base";
import { KeyViolationError } from "./base";

import type { OperationalErrorOptions } from "~/common";

const KEY_TYPE = "foreign";

class ForeignKeyViolationError extends KeyViolationError<typeof KEY_TYPE> {
  constructor(constraintName: string, options?: OperationalErrorOptions) {
    super(KEY_TYPE, constraintName, options);
  }
}

export { ForeignKeyViolationError };
export type { KeyType };
