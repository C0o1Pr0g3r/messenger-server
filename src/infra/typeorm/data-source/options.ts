import * as path from "node:path";

import type { DataSourceOptions } from "typeorm";

import type { Config } from "../../config";

const RELATIVE_PATH_TO_TYPEORM_ROOT_DIRECTORY = "..";
const JS_TS_GLOB = "**/*.{js,ts}";
const ENTITIES_GLOB = path.join(
  __dirname,
  RELATIVE_PATH_TO_TYPEORM_ROOT_DIRECTORY,
  "models",
  JS_TS_GLOB,
);
const MIGRATIONS_GLOB = path.join(
  __dirname,
  RELATIVE_PATH_TO_TYPEORM_ROOT_DIRECTORY,
  "migrations",
  JS_TS_GLOB,
);

function defineOptions({ name, ...rest }: Config["database"]): DataSourceOptions {
  return {
    ...rest,
    type: "postgres",
    database: name,
    entities: [ENTITIES_GLOB],
    migrations: [MIGRATIONS_GLOB],
  };
}

export { defineOptions };
