import type { OxlintConfig } from "oxlint";

/**
 * Every project: load the plugin, correctness as warnings, unused code as errors.
 * No `ignorePatterns` here: oxlint drops them when extending an imported object. Keep ignores project-level.
 * Type-only import: consumers may not have `oxlint` hoisted next to this package.
 */
export const base = {
	jsPlugins: ["@niwoerner/oxlint-rules"],
	categories: { correctness: "warn" },
	rules: { "eslint/no-unused-vars": "error" },
} satisfies OxlintConfig;
