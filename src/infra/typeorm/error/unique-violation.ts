import { DatabaseError } from "pg";
import type { TypeORMError } from "typeorm";

import { isTypeormError } from "./base";

const DRIVER_ERROR_KEY = "driverError";

type UniqueViolationError = {
  [DRIVER_ERROR_KEY]: DatabaseError & {
    code: "23505";
  };
};

function isUniqueViolationError(error: unknown): error is TypeORMError & UniqueViolationError {
  return (
    isTypeormError(error) &&
    DRIVER_ERROR_KEY in error &&
    error[DRIVER_ERROR_KEY] instanceof DatabaseError &&
    error[DRIVER_ERROR_KEY].code === "23505"
  );
}

export { isUniqueViolationError };
