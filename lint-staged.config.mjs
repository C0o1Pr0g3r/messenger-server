// @ts-check
import { runEslint, runPrettier } from "./lint-staged/commands.mjs";
import { setUpTasksForTypescriptFiles } from "./lint-staged/helpers.mjs";

/** @type {import("lint-staged").Configuration} */
export default {
  "*.{json,md,yaml,yml,sql}": [runPrettier()],
  "*.{js,mjs,cjs}": [runEslint(), runPrettier()],
  ...setUpTasksForTypescriptFiles([
    {
      glob: "src/**/*.{ts,mts,cts}",
      pathToConfigFile: "tsconfig.json",
    },
  ]),
};
