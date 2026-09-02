import { defineConfig } from "oxfmt";

/** Shared oxfmt settings. Spread into a project's `oxfmt.config.ts` and extend `ignorePatterns`. */
export const fmt = defineConfig({
	useTabs: true,
	ignorePatterns: ["**/*.md"],
});
