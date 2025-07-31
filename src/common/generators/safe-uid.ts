import { taskEither } from "fp-ts";
import * as uidSafe from "uid-safe";

import { UnexpectedError } from "../error";

function safeUid(lengthInBytes: number) {
  return taskEither.tryCatch(
    () => uidSafe(lengthInBytes),
    (reason) => new UnexpectedError(reason),
  );
}

export { safeUid };
