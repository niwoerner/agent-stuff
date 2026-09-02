import { defineConfig } from "oxlint";

/** Relaxations for test files. Nothing yet; add overrides here as they earn their place. */
export const testing = defineConfig({
	overrides: [{ files: ["**/*.test.{ts,tsx}"], rules: {} }],
});
