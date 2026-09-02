import type { OxlintConfig } from "oxlint";

/** React/browser projects. */
export const frontend = {
	rules: { "niwoerner/no-use-effect": "error" },
} satisfies OxlintConfig;
