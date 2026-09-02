import { defineConfig } from "oxlint";

/**
 * Every project: load the plugin, correctness as warnings, unused code as errors.
 * No `ignorePatterns` here: oxlint drops them when extending an imported object. Keep ignores project-level.
 */
export const base = defineConfig({
	jsPlugins: ["@niwoerner/oxlint-rules"],
	categories: { correctness: "warn" },
	rules: { "eslint/no-unused-vars": "error" },
});
