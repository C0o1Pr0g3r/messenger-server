import { z } from "zod";

import { Zod } from "~/common";

const zDatabaseConfig = z
  .object({
    DATABASE_HOST: z.string().nonempty(),
    DATABASE_PORT: z.coerce.number().positive(),
    DATABASE_USERNAME: z.string().nonempty(),
    DATABASE_PASSWORD: z.string().nonempty(),
    DATABASE_NAME: z.string().nonempty(),
    DATABASE_SYNCHRONIZE: Zod.zBooleanishString,
    DATABASE_SSL: Zod.zBooleanishString,
  })
  .transform(
    ({
      DATABASE_HOST,
      DATABASE_PORT,
      DATABASE_USERNAME,
      DATABASE_PASSWORD,
      DATABASE_NAME,
      DATABASE_SYNCHRONIZE,
      DATABASE_SSL,
    }) => ({
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      username: DATABASE_USERNAME,
      password: DATABASE_PASSWORD,
      name: DATABASE_NAME,
      synchronize: DATABASE_SYNCHRONIZE,
      ssl: DATABASE_SSL,
    }),
  );
type DatabaseConfig = z.infer<typeof zDatabaseConfig>;

export { zDatabaseConfig };
export type { DatabaseConfig };
