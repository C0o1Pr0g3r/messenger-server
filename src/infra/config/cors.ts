import { z } from "zod";

import { Zod } from "~/common";

const zCorsConfig = z
  .object({
    CORS_ORIGIN: z.string().url(),
    CORS_CREDENTIALS: Zod.zBooleanishString,
  })
  .transform(({ CORS_ORIGIN, CORS_CREDENTIALS }) => ({
    origin: CORS_ORIGIN,
    credentials: CORS_CREDENTIALS,
  }));
type CorsConfig = z.infer<typeof zCorsConfig>;

export { zCorsConfig };
export type { CorsConfig };
