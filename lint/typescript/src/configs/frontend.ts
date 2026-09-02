import { defineConfig } from "oxlint";

/** React/browser projects. */
export const frontend = defineConfig({
	rules: { "niwoerner/no-use-effect": "error" },
});
