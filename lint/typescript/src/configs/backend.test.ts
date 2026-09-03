import assert from "node:assert/strict";
import test from "node:test";

import { backend } from "./backend.ts";

test("backend enables Hono route safety rules", () => {
	assert.deepEqual(backend.rules, {
		"niwoerner/no-raw-hono-request-input": "error",
		"niwoerner/static-hono-routes-before-dynamic": "error",
	});
});
