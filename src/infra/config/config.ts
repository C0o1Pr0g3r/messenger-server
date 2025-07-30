import { registerAs } from "@nestjs/config";
import { either, function as function_ } from "fp-ts";
import { z } from "zod";

import { zAuthConfig } from "./auth";
import { zBcryptConfig } from "./bcrypt";
import { zCorsConfig } from "./cors";
import { zDatabaseConfig } from "./database";
import { zNodeConfig } from "./node";

const zConfig = z.object({
  auth: zAuthConfig,
  bcrypt: zBcryptConfig,
  cors: zCorsConfig,
  database: zDatabaseConfig,
  node: zNodeConfig,
});
type Config = z.infer<typeof zConfig>;

function createConfig(variables: Record<string, unknown>) {
  return function_.pipe(
    zConfig.safeParse(
      Object.fromEntries(Object.keys(zConfig.keyof().enum).map((key) => [key, variables])),
    ),
    ({ success, data, error }) =>
      success
        ? either.right(data)
        : either.left(
            new Error("Failed to create application configuration.", {
              cause: error,
            }),
          ),
  );
}

function createNestjsConfig(variables: Record<string, unknown>) {
  const eitherConfig = createConfig(variables);
  if (either.isLeft(eitherConfig)) throw eitherConfig.left;

  return Object.entries(eitherConfig.right).map(([key, value]) => registerAs(key, () => value));
}

export { createConfig, createNestjsConfig, zConfig };
export type { Config };
