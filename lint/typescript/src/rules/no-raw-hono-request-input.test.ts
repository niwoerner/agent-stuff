import { RuleTester } from "oxlint/plugins-dev";

import { noRawHonoRequestInputRule } from "./no-raw-hono-request-input.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "useValidatedInput" };

tester.run("niwoerner/no-raw-hono-request-input", noRawHonoRequestInputRule, {
	valid: [
		'const body = c.req.valid("json");',
		'const id = c.req.valid("param").id;',
		"const form = await c.req.parseBody();",
		"const body = await request.json();",
		'const value = service.query("key");',
		'const value = c.req["query"]("key");',
		"const body = this.req.json();",
		"const body = state.context.req.json();",
	],
	invalid: [
		{ name: "JSON body", code: "const body = await c.req.json();", errors: [error] },
		{
			name: "route parameter",
			code: 'const id = context.req.param("id");',
			errors: [error],
		},
		{ name: "query parameter", code: 'const q = ctx.req.query("q");', errors: [error] },
		{ name: "all query parameters", code: "const q = c.req.queries();", errors: [error] },
	],
});
