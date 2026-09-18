import assert from "node:assert/strict";
import test from "node:test";

import { frontend } from "./frontend.ts";

test("frontend enables UI safety rules", () => {
	assert.deepEqual(frontend.rules, {
		"niwoerner/no-raw-error-message": "error",
		"niwoerner/no-use-effect": "error",
	});
});
