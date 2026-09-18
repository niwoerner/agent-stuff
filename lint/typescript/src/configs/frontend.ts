import type { OxlintConfig } from "oxlint";

/** React/browser projects. */
export const frontend = {
	rules: {
		"niwoerner/no-raw-error-message": "error",
		"niwoerner/no-use-effect": "error",
	},
} satisfies OxlintConfig;
