import { defineConfig } from "oxlint";

/** Every project: load the plugin, correctness as warnings, unused code as errors. */
export const base = defineConfig({
	jsPlugins: ["@niwoerner/oxlint-rules"],
	categories: { correctness: "warn" },
	rules: { "eslint/no-unused-vars": "error" },
});
