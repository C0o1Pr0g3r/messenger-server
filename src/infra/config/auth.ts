import * as ms from "ms";
import { z } from "zod";

const zAuthConfig = z
  .object({
    AUTH_ACCESS_TOKEN_SECRET: z.string().nonempty(),
    AUTH_ACCESS_TOKEN_LIFETIME: z.string().nonempty(),
  })
  .superRefine((value, ctx) => {
    const { AUTH_ACCESS_TOKEN_LIFETIME } = value;
    refine({ AUTH_ACCESS_TOKEN_LIFETIME }, ctx);
  })
  .transform(({ AUTH_ACCESS_TOKEN_SECRET, AUTH_ACCESS_TOKEN_LIFETIME }) => ({
    secret: AUTH_ACCESS_TOKEN_SECRET,
    lifetime: AUTH_ACCESS_TOKEN_LIFETIME as ms.StringValue,
  }));
type AuthConfig = z.infer<typeof zAuthConfig>;

function refine(
  obj: Record<"AUTH_ACCESS_TOKEN_LIFETIME", string> | Record<"AUTH_REFRESH_TOKEN_LIFETIME", string>,
  ctx: z.RefinementCtx,
) {
  const [key, value] = Object.entries(obj).at(0)!;

  const code = z.ZodIssueCode.custom;
  const path = [key];
  try {
    const valueAsMs = ms(value as ms.StringValue);
    if (isNaN(valueAsMs)) {
      ctx.addIssue({
        code,
        message: "The value does not match the format",
        path,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      ctx.addIssue({
        code,
        message:
          error.message ===
          "Value provided to ms.parse() must be a string with length between 1 and 99."
            ? "The value length must be between 1 and 99."
            : error.message,
        path,
      });
    }
  }
}

export { zAuthConfig };
export type { AuthConfig };
