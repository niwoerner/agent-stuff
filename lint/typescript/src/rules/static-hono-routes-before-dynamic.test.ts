import { RuleTester } from "oxlint/plugins-dev";

import { staticHonoRoutesBeforeDynamicRule } from "./static-hono-routes-before-dynamic.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "staticBeforeDynamic" };

tester.run("niwoerner/static-hono-routes-before-dynamic", staticHonoRoutesBeforeDynamicRule, {
	valid: [
		'app.get("/settings", handler); app.get("/:id", handler);',
		'app.get("/users/:id", handler); app.get("/settings", handler);',
		'app.get("/users/:id", handler); app.get("/users/settings/details", handler);',
		'app.get("/:id", handler); app.post("/settings", handler);',
		'app.get("/:id", handler); admin.get("/settings", handler);',
		'app.get("/:id", handler); app.get("/:slug", handler);',
		'app.get("/files/*", handler); app.get("/settings", handler);',
		'app.get("/files/readme", handler); app.get("/files/*", handler);',
		'app.get("/:id{[0-9]+}", handler); app.get("/settings", handler);',
		'app.get("/:id", handler); app.get(`/settings`, handler);',
		'client.get("/:id"); client.get("/settings");',
		'{ app.get("/:id", handler); } { app.get("/settings", handler); }',
		'function one() { app.get("/:id", handler); } function two() { app.get("/settings", handler); }',
	],
	invalid: [
		{
			name: "single parameter",
			code: 'app.get("/:id", handler); app.get("/settings", handler);',
			errors: [error],
		},
		{
			name: "nested parameter",
			code: 'app.get("/users/:id", handler); app.get("/users/settings", handler);',
			errors: [error],
		},
		{
			name: "catch-all wildcard",
			code: 'app.get("*", fallback); app.get("/health", handler);',
			errors: [error],
		},
		{
			name: "trailing wildcard",
			code: 'app.get("/files/*", fallback); app.get("/files/readme", handler);',
			errors: [error],
		},
		{
			name: "middle wildcard",
			code: 'app.get("/wild/*/card", fallback); app.get("/wild/playing/card", handler);',
			errors: [error],
		},
		{
			name: "optional parameter",
			code: 'app.get("/animal/:type?", handler); app.get("/animal", handler);',
			errors: [error],
		},
		{
			name: "chained registrations",
			code: 'app.get("/:id", handler).get("/settings", handler);',
			errors: [error],
		},
	],
});
