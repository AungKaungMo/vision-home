import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    // next.config.js runs in Node at build time, so it uses Node globals
    // (`process`) the browser-oriented shared config doesn't declare.
    files: ["*.config.{js,mjs,ts}"],
    languageOptions: { globals: { process: "readonly" } },
  },
];
