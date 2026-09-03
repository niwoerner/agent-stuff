import { eslintCompatPlugin } from "@oxlint/plugins";

import { noConditionalObjectSpreadRule } from "./rules/no-conditional-object-spread.ts";
import { noDirectDbOperationsRule } from "./rules/no-direct-db-operations.ts";
import { noRawHonoRequestInputRule } from "./rules/no-raw-hono-request-input.ts";
import { noUseEffectRule } from "./rules/no-use-effect.ts";
import { staticHonoRoutesBeforeDynamicRule } from "./rules/static-hono-routes-before-dynamic.ts";

/** Opinionated rules. Enable them directly or through the presets in `./configs`. */
const plugin = eslintCompatPlugin({
	meta: { name: "niwoerner" },
	rules: {
		"no-conditional-object-spread": noConditionalObjectSpreadRule,
		"no-direct-db-operations": noDirectDbOperationsRule,
		"no-raw-hono-request-input": noRawHonoRequestInputRule,
		"no-use-effect": noUseEffectRule,
		"static-hono-routes-before-dynamic": staticHonoRoutesBeforeDynamicRule,
	},
});

export default plugin;
