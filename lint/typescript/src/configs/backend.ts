import type { OxlintConfig } from "oxlint";

/** Server and CLI projects with Hono route safety rules. */
export const backend = {
	rules: {
		"niwoerner/no-raw-hono-request-input": "error",
		"niwoerner/static-hono-routes-before-dynamic": "error",
	},
} satisfies OxlintConfig;
