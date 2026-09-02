import type { OxlintConfig } from "oxlint";

/** Relaxations for test files. Nothing yet; add overrides here as they earn their place. */
export const testing = {
	overrides: [{ files: ["**/*.test.{ts,tsx}"], rules: {} }],
} satisfies OxlintConfig;
