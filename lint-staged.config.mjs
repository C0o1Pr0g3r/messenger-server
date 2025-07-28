// @ts-check
import { runEslint, runPrettier, runSyncpackFormat } from "./lint-staged/commands.mjs";
import { setUpTasksForTypescriptFiles } from "./lint-staged/helpers.mjs";

/** @type {import("lint-staged").Configuration} */
export default {
  "*.{json,md,yaml,yml,sql}": [runPrettier()],
  "*.{js,mjs,cjs}": [runEslint(), runPrettier()],
  "**/package.json": async (files) => [await runSyncpackFormat(files)],
  ...setUpTasksForTypescriptFiles([
    {
      glob: "src/**/*.{ts,mts,cts}",
      pathToConfigFile: "tsconfig.json",
    },
  ]),
};
