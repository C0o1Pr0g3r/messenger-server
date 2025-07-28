// @ts-check
/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  plugins: ["prettier-plugin-jsdoc"],
  overrides: [
    {
      files: "*.{sql,js,mjs,cjs,ts,mts,cts}",
      options: {
        plugins: ["prettier-plugin-sql", "prettier-plugin-embed"],
        language: "postgresql",
        keywordCase: "upper",
        dataTypeCase: "upper",
        functionCase: "lower",
        identifierCase: "lower",
      },
    },
  ],
};
