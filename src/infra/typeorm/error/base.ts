import { TypeORMError } from "typeorm";

function isTypeormError(error: unknown) {
  return error instanceof TypeORMError;
}

export { isTypeormError };
