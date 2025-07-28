import path from "node:path";

import micromatch from "micromatch";

import { runEslint, runPrettier, runTsc } from "./commands.mjs";

/**
 * @template {string} TaskName
 * @typedef {object} Option
 * @property {string} [program="tsc"] Default is `"tsc"`
 * @property {string} glob
 * @property {Ignore} [ignore]
 * @property {string} pathToConfigFile
 * @property {Record<TaskName, string | ((files: string[]) => string)>} [additionalTasks]
 * @property {Partial<LaunchOptions<TaskName>>} [launchOptions]
 */

/**
 * @typedef {object} Ignore
 * @property {string} baseUrl
 * @property {string} glob
 */

/** @typedef {"prettier" | "eslint" | "tsc"} DefaultTaskName */

/**
 * @template {string} TaskName
 * @typedef {Record<DefaultTaskName | TaskName, boolean>} LaunchOptions
 */

/**
 * @template {string} [TaskName=string] Default is `string`
 * @param {Option<TaskName>[]} options
 */
function setUpTasksForTypescriptFiles(options) {
  return Object.fromEntries(
    options
      .map(({ program, glob, ignore, pathToConfigFile, additionalTasks, launchOptions }) => [
        glob,
        /** @param {string[]} files */
        (files) => {
          const filteredFiles = ignore
            ? micromatch.not(files, path.resolve(ignore.baseUrl, ignore.glob))
            : files;
          if (filteredFiles.length === 0) return [];

          const listOfFiles = filteredFiles.join(" ");

          const defaultTasks = Object.entries({
            tsc: runTsc(pathToConfigFile, program),
            eslint: runEslint(listOfFiles),
            prettier: runPrettier(listOfFiles),
          });

          /** @type {[string, string][]} */
          const additionalTasks2 = Object.entries(additionalTasks ?? {}).map(([name, command]) => [
            name,
            typeof command === "string" ? command : command(filteredFiles),
          ]);

          return getTasksToRun(
            [...defaultTasks, ...additionalTasks2],
            Object.entries(launchOptions ?? {}),
          ).map(([, command]) => command);
        },
      ])
      .filter(([, commands]) => commands.length > 0),
  );
}

/**
 * @template {string} [TaskName=string] Default is `string`
 * @param {[DefaultTaskName | TaskName, string][]} tasks
 * @param {[DefaultTaskName | TaskName, boolean][]} launchOptions
 * @returns {[DefaultTaskName | TaskName, string][]}
 */
function getTasksToRun(tasks, launchOptions) {
  const unspecifiedTasks = tasks.filter(([name]) =>
    launchOptions.every(([name2]) => name !== name2),
  );

  return [
    ...launchOptions
      .filter(([, execute]) => execute)
      .map(([name]) => [name, tasks.find((task) => task.at(0) === name).at(1)]),
    ...unspecifiedTasks,
  ];
}

export { setUpTasksForTypescriptFiles };
