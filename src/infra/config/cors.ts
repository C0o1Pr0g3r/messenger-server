import { z } from "zod";

const zCorsConfig = z
  .object({
    CORS_ORIGIN: z.url(),
    CORS_CREDENTIALS: z.stringbool(),
  })
  .transform(({ CORS_ORIGIN, CORS_CREDENTIALS }) => ({
    origin: CORS_ORIGIN,
    credentials: CORS_CREDENTIALS,
  }));
type CorsConfig = z.infer<typeof zCorsConfig>;

export { zCorsConfig };
export type { CorsConfig };
