import { DatabaseError } from "pg";
import type { TypeORMError } from "typeorm";

import { isTypeormError } from "./base";

const DRIVER_ERROR_KEY = "driverError";

const UNIQUE_KEY_VIOLATION_ERROR_CODE = "23505";
type UniqueKeyViolationError = {
  [DRIVER_ERROR_KEY]: DatabaseError & {
    code: typeof UNIQUE_KEY_VIOLATION_ERROR_CODE;
  };
};

function isUniqueKeyViolationError(
  error: unknown,
): error is TypeORMError & UniqueKeyViolationError {
  return (
    isTypeormError(error) &&
    DRIVER_ERROR_KEY in error &&
    error[DRIVER_ERROR_KEY] instanceof DatabaseError &&
    error[DRIVER_ERROR_KEY].code === UNIQUE_KEY_VIOLATION_ERROR_CODE
  );
}

const FOREIGN_KEY_VIOLATION_ERROR_CODE = "23503";
type ForeignKeyViolationError = {
  [DRIVER_ERROR_KEY]: DatabaseError & {
    code: typeof FOREIGN_KEY_VIOLATION_ERROR_CODE;
  };
};

function isForeignKeyViolationError(
  error: unknown,
): error is TypeORMError & ForeignKeyViolationError {
  return (
    isTypeormError(error) &&
    DRIVER_ERROR_KEY in error &&
    error[DRIVER_ERROR_KEY] instanceof DatabaseError &&
    error[DRIVER_ERROR_KEY].code === FOREIGN_KEY_VIOLATION_ERROR_CODE
  );
}

export { isForeignKeyViolationError, isUniqueKeyViolationError };
