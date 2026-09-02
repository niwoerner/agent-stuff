import type { OxfmtConfig } from "oxfmt";

/** Shared oxfmt settings. Spread into a project's `oxfmt.config.ts` and extend `ignorePatterns`. */
export const fmt = {
	useTabs: true,
	ignorePatterns: ["**/*.md"],
} satisfies OxfmtConfig;
