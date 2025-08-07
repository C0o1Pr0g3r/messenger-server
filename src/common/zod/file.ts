import { z } from "zod";

import { isObject } from "../type-guard";

const INVALID_MIME_TYPE = "invalid_mime_type";
const CUSTOM_CODE = "customCode";

type MimeTypeIssue = Omit<z.ZodCustomIssue, "params"> & {
  params: {
    [CUSTOM_CODE]: typeof INVALID_MIME_TYPE;
    cause: z.ZodIssue;
  };
};

function isMimeTypeIssue(value: z.ZodIssueOptionalMessage): value is MimeTypeIssue {
  return (
    value.code === z.ZodIssueCode.custom &&
    isObject(value.params) &&
    value.params[CUSTOM_CODE] === INVALID_MIME_TYPE
  );
}

function refineMimeType<T extends z.ZodSchema>(schema: T) {
  return (({ type }, ctx) => {
    const { success, error } = schema.safeParse(type);

    if (success) {
      return;
    }

    const [cause] = error.issues;

    if (!cause) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      params: {
        customCode: INVALID_MIME_TYPE,
        cause,
      } satisfies MimeTypeIssue["params"],
    });
  }) as Parameters<ReturnType<typeof z.instanceof<typeof File>>["superRefine"]>[0];
}

const REFINEMENTS = {
  isOneOf: <U extends string, T extends [U, ...U[]]>(values: T) => refineMimeType(z.enum(values)),
};

export { isMimeTypeIssue, REFINEMENTS, refineMimeType };
export type { MimeTypeIssue };
