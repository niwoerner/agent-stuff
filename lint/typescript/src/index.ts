import { eslintCompatPlugin } from "@oxlint/plugins";

import { noUseEffectRule } from "./rules/no-use-effect.ts";

/** Opinionated rules. Enable them through the presets in `./configs`. */
const plugin = eslintCompatPlugin({
	meta: { name: "niwoerner" },
	rules: {
		"no-use-effect": noUseEffectRule,
	},
});

export default plugin;
