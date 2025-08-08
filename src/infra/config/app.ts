import { z } from "zod";

const zAppConfig = z
  .object({
    APP_HOSTNAME: z.string().nonempty(),
  })
  .transform(({ APP_HOSTNAME }) => ({
    hostname: APP_HOSTNAME,
  }));
type AppConfig = z.infer<typeof zAppConfig>;

export { zAppConfig };
export type { AppConfig };
